/**
 * Cliente para interactuar con la API de Mercado Pago
 * 
 * Este cliente maneja:
 * - Creación de preferencias de pago (Checkout Pro)
 * - Procesamiento de pagos (Checkout API)
 * - Consulta de estado de pagos
 * - Validación de firmas de webhook
 * - Timeout y reintentos con backoff exponencial
 */

export interface MercadoPagoPreference {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: 'CLP';
  }>;
  payer: {
    name: string;
    email: string;
    phone: {
      area_code: string;
      number: string;
    };
    address: {
      street_name: string;
      street_number: string;
      zip_code: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved';
  notification_url: string;
  statement_descriptor: string;
  external_reference: string;
}

export interface MercadoPagoPayment {
  token: string;
  transaction_amount: number;
  installments: number;
  payment_method_id: string;
  issuer_id: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  description: string;
  external_reference: string;
  notification_url: string;
  statement_descriptor: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
}

export interface PaymentDetailsResponse {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string;
  external_reference: string;
}

export class MercadoPagoClient {
  private accessToken: string;
  private baseUrl: string = 'https://api.mercadopago.com';
  private timeout: number = 30000; // 30 segundos
  private maxRetries: number = 2;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    this.accessToken = accessToken;
  }

  /**
   * Crea una preferencia de pago para Checkout Pro
   * @param preference - Datos de la preferencia
   * @returns ID de preferencia y URL de inicio
   */
  async createPreference(preference: MercadoPagoPreference): Promise<PreferenceResponse> {
    return this.executeWithRetry(async () => {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/checkout/preferences`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(preference),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mercado Pago API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        init_point: data.init_point,
      };
    });
  }

  /**
   * Procesa un pago usando Checkout API
   * @param payment - Datos del pago
   * @returns Resultado del pago
   */
  async createPayment(payment: MercadoPagoPayment): Promise<PaymentResponse> {
    return this.executeWithRetry(async () => {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(payment),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mercado Pago API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        payment_method_id: data.payment_method_id,
        payment_type_id: data.payment_type_id,
      };
    });
  }

  /**
   * Obtiene los detalles de un pago
   * @param paymentId - ID del pago en Mercado Pago
   * @returns Detalles del pago
   */
  async getPayment(paymentId: string): Promise<PaymentDetailsResponse> {
    return this.executeWithRetry(async () => {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mercado Pago API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        transaction_amount: data.transaction_amount,
        payment_method_id: data.payment_method_id,
        payment_type_id: data.payment_type_id,
        external_reference: data.external_reference,
      };
    });
  }

  /**
   * Valida la firma de un webhook de Mercado Pago
   * @param signature - Firma del header x-signature
   * @param requestId - ID de la petición del header x-request-id
   * @param dataId - ID de los datos recibidos
   * @returns Promise que resuelve a true si la firma es válida
   */
  async validateWebhookSignature(
    signature: string,
    requestId: string,
    dataId: string
  ): Promise<boolean> {
    try {
      // Extraer ts y hash de la firma
      // Formato: ts=1234567890,v1=hash_value
      const parts = signature.split(',');
      const tsMatch = parts[0]?.match(/ts=(\d+)/);
      const hashMatch = parts[1]?.match(/v1=([a-f0-9]+)/);

      if (!tsMatch || !hashMatch) {
        return false;
      }

      const timestamp = tsMatch[1];
      const receivedHash = hashMatch[1];

      // Construir el manifest según la documentación de Mercado Pago
      const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;

      // Calcular HMAC-SHA256
      const encoder = new TextEncoder();
      const key = encoder.encode(this.accessToken);
      const message = encoder.encode(manifest);

      // Usar Web Crypto API para calcular HMAC
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, message);
      const calculatedHash = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return calculatedHash === receivedHash;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Ejecuta una petición con timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Ejecuta una operación con reintentos y backoff exponencial
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      // Backoff exponencial: 1s, 2s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.executeWithRetry(operation, attempt + 1);
    }
  }
}
