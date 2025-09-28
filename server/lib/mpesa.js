import axios from "axios";
import dotenv from "dotenv";
import Bottleneck from "bottleneck";

dotenv.config();

class MpesaAPI {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.environment = process.env.MPESA_ENVIRONMENT || "sandbox";
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    this.passkey = process.env.MPESA_PASSKEY;

    this.callbackUrl = `${process.env.BACKEND_URL.replace(
      /\/$/,
      ""
    )}/${process.env.MPESA_CALLBACK_URL.replace(/^\//, "")}`;
    this.resultUrl = `${process.env.BACKEND_URL.replace(
      /\/$/,
      ""
    )}/${process.env.MPESA_RESULT_URL.replace(/^\//, "")}`;
    this.timeoutUrl = `${process.env.BACKEND_URL.replace(
      /\/$/,
      ""
    )}/${process.env.MPESA_TIMEOUT_URL.replace(/^\//, "")}`;

    this.initiatorName = process.env.MPESA_INITIATOR_NAME;
    this.securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;

    this.baseURL =
      this.environment === "sandbox"
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

    // Rate limiter: 4 requests per minute to stay under the 5 request limit
    this.limiter = new Bottleneck({
      minTime: 15000, // 15 seconds between requests
      maxConcurrent: 1,
      reservoir: 4, // Start with 4 requests
      reservoirRefreshAmount: 4,
      reservoirRefreshInterval: 60 * 1000, // Refresh every minute
    });
  }

  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.trim();

    if (cleaned.length === 12 && cleaned.startsWith("254")) {
      return cleaned; // Already in international format
    }

    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      return "254" + cleaned.slice(1); // Local format to international
    }

    if (cleaned.length === 9 && cleaned.startsWith("7")) {
      return "254" + cleaned; // Missing leading zero, add country code
    }

    throw new Error(
      "Invalid phone number format. Please provide number as 07XXXXXXXX or 2547XXXXXXXX"
    );
  }

  async getAccessToken() {
    const url = `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`;
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error(
        "Error getting access token:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get access token");
    }
  }

  generateTimestamp() {
    const date = new Date();
    return (
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2)
    );
  }

  generatePassword(timestamp) {
    const data = this.businessShortCode + this.passkey + timestamp;
    return Buffer.from(data).toString("base64");
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("STK Push error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || "STK Push failed");
    }
  }

  async queryTransaction(checkoutRequestId) {
    try {
      return await this.limiter.schedule(async () => {
        const accessToken = await this.getAccessToken();
        const timestamp = this.generateTimestamp();
        const password = this.generatePassword(timestamp);

        const queryData = {
          BusinessShortCode: this.businessShortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        };

        const response = await axios.post(
          `${this.baseURL}/mpesa/stkpushquery/v1/query`,
          queryData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Map response codes to meaningful status
        const data = response.data;
        const resultCode = data.ResultCode;

        // Enhanced status mapping based on M-Pesa response codes
        let status = "PENDING";
        if (resultCode === "0") {
          status = "SUCCESS";
        } else if (resultCode === "1032") {
          status = "CANCELLED"; // Request cancelled by user
        } else if (resultCode === "1037") {
          status = "TIMEOUT"; // DS timeout user cannot be reached
        } else if (resultCode === "1025") {
          status = "INVALID_PHONE"; // Unable to lock subscriber, invalid phone number
        } else if (resultCode === "1001") {
          status = "INSUFFICIENT_FUNDS"; // Insufficient funds on MPESA account
        } else if (resultCode === "1019") {
          status = "TRANSACTION_FAILED"; // Transaction failed
        } else if (resultCode && resultCode !== "1037") {
          status = "FAILED";
        }

        return {
          ...data,
          MappedStatus: status,
        };
      });
    } catch (error) {
      console.error(
        "Transaction query error:",
        error.response?.data || error.message
      );

      // If it's a rate limit error, return a specific response
      if (
        error.response?.data?.fault?.detail?.errorcode ===
        "policies.ratelimit.SpikeArrestViolation"
      ) {
        return {
          ResultCode: "RATE_LIMITED",
          ResultDesc: "Rate limit exceeded. Please try again later.",
        };
      }

      throw new Error(
        error.response?.data?.errorMessage || "Transaction query failed"
      );
    }
  }

  async b2cPayment(phoneNumber, amount, commandId, remarks, occasion = "") {
    try {
      const accessToken = await this.getAccessToken();

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const b2cData = {
        InitiatorName: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: commandId, // SalaryPayment, BusinessPayment, PromotionPayment
        Amount: Math.round(amount),
        PartyA: this.businessShortCode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: this.timeoutUrl,
        ResultURL: this.resultUrl,
        Occasion: occasion,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        b2cData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "B2C Payment error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "B2C Payment failed"
      );
    }
  }

  async b2bPayment(partyB, amount, commandId, accountReference, remarks) {
    try {
      const accessToken = await this.getAccessToken();

      const b2bData = {
        Initiator: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: commandId, // BusinessPayBill, BusinessBuyGoods, DisburseFundsToBusiness, BusinessToBusinessTransfer
        Amount: Math.round(amount),
        PartyA: this.businessShortCode,
        PartyB: partyB,
        Remarks: remarks,
        QueueTimeOutURL: this.timeoutUrl,
        ResultURL: this.resultUrl,
        AccountReference: accountReference,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/b2b/v1/paymentrequest`,
        b2bData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "B2B Payment error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "B2B Payment failed"
      );
    }
  }

  async accountBalance(partyA, identifierType, remarks) {
    try {
      const accessToken = await this.getAccessToken();

      const balanceData = {
        Initiator: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: "AccountBalance",
        PartyA: partyA,
        IdentifierType: identifierType, // 1 for MSISDN, 2 for Till Number, 4 for Organization short code
        Remarks: remarks,
        QueueTimeOutURL: this.timeoutUrl,
        ResultURL: this.resultUrl,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/accountbalance/v1/query`,
        balanceData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Account Balance error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "Account Balance query failed"
      );
    }
  }

  async transactionStatus(
    transactionId,
    partyA,
    identifierType,
    remarks,
    occasion = ""
  ) {
    try {
      const accessToken = await this.getAccessToken();

      const statusData = {
        Initiator: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionId,
        PartyA: partyA,
        IdentifierType: identifierType,
        ResultURL: this.resultUrl,
        QueueTimeOutURL: this.timeoutUrl,
        Remarks: remarks,
        Occasion: occasion,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/transactionstatus/v1/query`,
        statusData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Transaction Status error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "Transaction Status query failed"
      );
    }
  }

  async generateQRCode(merchantName, refNo, amount, trxCode, cpi = "") {
    try {
      const accessToken = await this.getAccessToken();

      const qrData = {
        MerchantName: merchantName,
        RefNo: refNo,
        Amount: amount ? Math.round(amount) : undefined,
        TrxCode: trxCode, // BG for Buy Goods, WA for Withdraw Cash, PB for PayBill, SM for Send Money
        CPI: cpi || "174379",
      };

      // Remove undefined values
      Object.keys(qrData).forEach(
        (key) => qrData[key] === undefined && delete qrData[key]
      );

      const response = await axios.post(
        `${this.baseURL}/mpesa/qrcode/v1/generate`,
        qrData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "QR Code generation error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "QR Code generation failed"
      );
    }
  }

  async reverseTransaction(
    transactionId,
    amount,
    receiverParty,
    remarks,
    occasion = ""
  ) {
    try {
      const accessToken = await this.getAccessToken();

      const reversalData = {
        Initiator: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: "TransactionReversal",
        TransactionID: transactionId,
        Amount: Math.round(amount),
        ReceiverParty: receiverParty,
        RecieverIdentifierType: "11", // 11 for MSISDN
        ResultURL: this.resultUrl,
        QueueTimeOutURL: this.timeoutUrl,
        Remarks: remarks,
        Occasion: occasion,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/reversal/v1/request`,
        reversalData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Transaction Reversal error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.errorMessage || "Transaction Reversal failed"
      );
    }
  }
}

export default MpesaAPI;
