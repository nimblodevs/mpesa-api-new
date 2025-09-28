const API_BASE_URL = "http://localhost:3001/api";

export interface PaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
}

export interface Payment {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  resultCode?: number;
  resultDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class PaymentAPI {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  async initiatePayment(paymentData: PaymentRequest) {
    return this.request<{
      checkoutRequestId: string;
      merchantRequestId: string;
    }>("/payments/initiate", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async checkPaymentStatus(checkoutRequestId: string) {
    return this.request<Payment>(`/payments/status/${checkoutRequestId}`);
  }

  async getPaymentHistory() {
    return this.request<Payment[]>("/payments/history");
  }
}

export const paymentAPI = new PaymentAPI();
