import { PrismaClient } from "@prisma/client";
import MpesaAPI from "../lib/mpesa.js";

const prisma = new PrismaClient();
const mpesa = new MpesaAPI();

class ReversalChecker {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.expireAfter = 24 * 60 * 60 * 1000; // 24 hours
    this.maxPendingTime = 30 * 60 * 1000; // 30 minutes before first check
  }

  start() {
    if (this.isRunning) {
      console.log("Reversal checker is already running");
      return;
    }

    this.isRunning = true;
    console.log("🔄 Starting reversal status checker...");
    
    // Run immediately, then at intervals
    this.checkPendingReversals();
    this.intervalId = setInterval(() => {
      this.checkPendingReversals();
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Reversal checker stopped");
  }

  async checkPendingReversals() {
    try {
      console.log("🔍 Checking pending reversals...");

      // Get all pending reversals
      const pendingReversals = await prisma.transactionReversal.findMany({
        where: {
          status: "PENDING",
          conversationId: { not: null },
        },
        orderBy: { createdAt: "asc" },
      });

      console.log(`Found ${pendingReversals.length} pending reversals`);

      for (const reversal of pendingReversals) {
        await this.checkSingleReversal(reversal);
        // Add small delay between checks to avoid rate limiting
        await this.sleep(1000);
      }

      // Handle expired reversals
      await this.handleExpiredReversals();

    } catch (error) {
      console.error("Error in reversal checker:", error);
    }
  }

  async checkSingleReversal(reversal) {
    try {
      const now = new Date();
      const createdAt = new Date(reversal.createdAt);
      const timePending = now - createdAt;

      // Skip if reversal is too new (give M-Pesa time to process)
      if (timePending < this.maxPendingTime) {
        console.log(`⏳ Reversal ${reversal.id} is too new, skipping check`);
        return;
      }

      console.log(`🔍 Checking reversal status for ID: ${reversal.id}`);

      // Query M-Pesa for transaction status
      const statusResponse = await mpesa.transactionStatus(
        reversal.transactionId,
        reversal.receiverParty,
        "11", // MSISDN identifier type
        `Status check for reversal ${reversal.id}`,
        "Automated status check"
      );

      if (statusResponse.ResponseCode === "0") {
        // Status query initiated successfully
        console.log(`✅ Status query initiated for reversal ${reversal.id}`);
        
        // Update last check time
        await prisma.transactionReversal.update({
          where: { id: reversal.id },
          data: {
            lastStatusCheck: now,
            statusCheckCount: (reversal.statusCheckCount || 0) + 1,
          },
        });
      } else {
        console.log(`❌ Status query failed for reversal ${reversal.id}: ${statusResponse.ResponseDescription}`);
      }

    } catch (error) {
      console.error(`Error checking reversal ${reversal.id}:`, error);
      
      // Update error count
      await prisma.transactionReversal.update({
        where: { id: reversal.id },
        data: {
          errorCount: (reversal.errorCount || 0) + 1,
          lastError: error.message,
          lastErrorAt: new Date(),
        },
      });
    }
  }

  async handleExpiredReversals() {
    try {
      const expireThreshold = new Date(Date.now() - this.expireAfter);

      const expiredReversals = await prisma.transactionReversal.findMany({
        where: {
          status: "PENDING",
          createdAt: { lt: expireThreshold },
        },
      });

      if (expiredReversals.length > 0) {
        console.log(`⏰ Found ${expiredReversals.length} expired reversals`);

        for (const reversal of expiredReversals) {
          await prisma.transactionReversal.update({
            where: { id: reversal.id },
            data: {
              status: "EXPIRED",
              expiredAt: new Date(),
              resultDesc: "Reversal expired - no callback received within 24 hours",
              failureReason: "Callback timeout - reversal may have succeeded but confirmation not received",
            },
          });

          console.log(`⏰ Marked reversal ${reversal.id} as expired`);
        }
      }
    } catch (error) {
      console.error("Error handling expired reversals:", error);
    }
  }

  async retryFailedReversals() {
    try {
      console.log("🔄 Checking for failed reversals to retry...");

      const failedReversals = await prisma.transactionReversal.findMany({
        where: {
          status: "FAILED",
          retryCount: { lt: prisma.transactionReversal.fields.maxRetries },
          OR: [
            { lastRetryAt: null },
            { lastRetryAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } }, // 10 minutes ago
          ],
        },
        take: 5, // Limit retries per cycle
      });

      for (const reversal of failedReversals) {
        console.log(`🔄 Retrying failed reversal ${reversal.id}`);
        
        try {
          // Update status to processing
          await prisma.transactionReversal.update({
            where: { id: reversal.id },
            data: {
              status: "PROCESSING",
              retryCount: reversal.retryCount + 1,
              lastRetryAt: new Date(),
            },
          });

          // Attempt reversal again
          const reverseResponse = await mpesa.reverseTransaction(
            reversal.transactionId,
            reversal.amount,
            reversal.receiverParty,
            reversal.remarks,
            reversal.occasion
          );

          if (reverseResponse.ResponseCode === "0") {
            await prisma.transactionReversal.update({
              where: { id: reversal.id },
              data: {
                conversationId: reverseResponse.ConversationID,
                originatorConversationId: reverseResponse.OriginatorConversationID,
                status: "PENDING",
                mpesaResponseCode: reverseResponse.ResponseCode,
                mpesaResponseDesc: reverseResponse.ResponseDescription,
              },
            });
            console.log(`✅ Retry successful for reversal ${reversal.id}`);
          } else {
            await prisma.transactionReversal.update({
              where: { id: reversal.id },
              data: {
                status: "FAILED",
                resultCode: parseInt(reverseResponse.ResponseCode) || null,
                resultDesc: reverseResponse.ResponseDescription,
                failureReason: reverseResponse.ResponseDescription,
              },
            });
            console.log(`❌ Retry failed for reversal ${reversal.id}`);
          }
        } catch (retryError) {
          await prisma.transactionReversal.update({
            where: { id: reversal.id },
            data: {
              status: "FAILED",
              failureReason: retryError.message,
            },
          });
          console.error(`❌ Retry error for reversal ${reversal.id}:`, retryError);
        }

        // Add delay between retries
        await this.sleep(2000);
      }
    } catch (error) {
      console.error("Error in retry failed reversals:", error);
    }
  }

  async getReversalStats() {
    try {
      const stats = await prisma.transactionReversal.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const totalReversals = await prisma.transactionReversal.count();
      
      return {
        total: totalReversals,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error("Error getting reversal stats:", error);
      return null;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ReversalChecker;