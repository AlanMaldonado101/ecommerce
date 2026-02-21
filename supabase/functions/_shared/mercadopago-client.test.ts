/**
 * Tests básicos para MercadoPagoClient
 * 
 * Estos tests verifican la funcionalidad básica del cliente.
 * Los property tests más exhaustivos se implementarán en tareas posteriores.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MercadoPagoClient } from './mercadopago-client.ts';

describe('MercadoPagoClient', () => {
  describe('Constructor', () => {
    it('debe requerir accessToken', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        new MercadoPagoClient('');
      }).toThrow('Access token is required');
    });

    it('debe aceptar accessToken válido', () => {
      const client = new MercadoPagoClient('TEST-1234567890');
      expect(client).toBeInstanceOf(MercadoPagoClient);
    });
  });

  describe('validateWebhookSignature', () => {
    let client: MercadoPagoClient;

    beforeEach(() => {
      client = new MercadoPagoClient('TEST-1234567890');
    });

    it('debe retornar false para firma con formato inválido', async () => {
      const isValid = await client.validateWebhookSignature(
        'invalid_format',
        'request-123',
        'data-456'
      );
      expect(isValid).toBe(false);
    });

    it('debe retornar false para firma sin timestamp', async () => {
      const isValid = await client.validateWebhookSignature(
        'v1=somehash',
        'request-123',
        'data-456'
      );
      expect(isValid).toBe(false);
    });

    it('debe retornar false para firma sin hash', async () => {
      const isValid = await client.validateWebhookSignature(
        'ts=1234567890',
        'request-123',
        'data-456'
      );
      expect(isValid).toBe(false);
    });

    it('debe retornar false para hash inválido', async () => {
      const isValid = await client.validateWebhookSignature(
        'ts=1234567890,v1=invalid_hash',
        'request-123',
        'data-456'
      );
      expect(isValid).toBe(false);
    });
  });

  describe('createPreference', () => {
    it('debe lanzar error si la respuesta no es ok', async () => {
      const client = new MercadoPagoClient('TEST-1234567890');
      
      // Mock fetch para simular error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' }),
      });

      const preference = {
        items: [{
          id: '1',
          title: 'Test Product',
          quantity: 1,
          unit_price: 10000,
          currency_id: 'CLP' as const,
        }],
        payer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: {
            area_code: '56',
            number: '912345678',
          },
          address: {
            street_name: 'Test Street',
            street_number: '123',
            zip_code: '1234567',
          },
        },
        back_urls: {
          success: 'https://example.com/success',
          failure: 'https://example.com/failure',
          pending: 'https://example.com/pending',
        },
        auto_return: 'approved' as const,
        notification_url: 'https://example.com/webhook',
        statement_descriptor: 'TEST STORE',
        external_reference: 'ORD-20240101-00001',
      };

      await expect(client.createPreference(preference)).rejects.toThrow('Mercado Pago API error');
    });
  });

  describe('createPayment', () => {
    it('debe lanzar error si la respuesta no es ok', async () => {
      const client = new MercadoPagoClient('TEST-1234567890');
      
      // Mock fetch para simular error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid token' }),
      });

      const payment = {
        token: 'test_token',
        transaction_amount: 10000,
        installments: 1,
        payment_method_id: 'visa',
        issuer_id: '1',
        payer: {
          email: 'test@example.com',
          identification: {
            type: 'RUT',
            number: '12345678-9',
          },
        },
        description: 'Test Payment',
        external_reference: 'ORD-20240101-00001',
        notification_url: 'https://example.com/webhook',
        statement_descriptor: 'TEST STORE',
      };

      await expect(client.createPayment(payment)).rejects.toThrow('Mercado Pago API error');
    });
  });

  describe('getPayment', () => {
    it('debe lanzar error si la respuesta no es ok', async () => {
      const client = new MercadoPagoClient('TEST-1234567890');
      
      // Mock fetch para simular error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ message: 'Payment not found' }),
      });

      await expect(client.getPayment('123456')).rejects.toThrow('Mercado Pago API error');
    });
  });

  describe('Timeout y Reintentos', () => {
    it('debe reintentar en caso de timeout', async () => {
      const client = new MercadoPagoClient('TEST-1234567890');
      let attempts = 0;

      // Mock fetch para simular timeout en los primeros 2 intentos
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts <= 2) {
          return Promise.reject(new Error('Request timeout'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: '123',
            status: 'approved',
            status_detail: 'accredited',
            transaction_amount: 10000,
            payment_method_id: 'visa',
            payment_type_id: 'credit_card',
            external_reference: 'ORD-20240101-00001',
          }),
        });
      });

      const result = await client.getPayment('123456');
      expect(result.id).toBe('123');
      expect(attempts).toBe(3); // 1 intento inicial + 2 reintentos
    });

    it('debe fallar después de máximo de reintentos', async () => {
      const client = new MercadoPagoClient('TEST-1234567890');

      // Mock fetch para simular timeout siempre
      global.fetch = vi.fn().mockRejectedValue(new Error('Request timeout'));

      await expect(client.getPayment('123456')).rejects.toThrow('Request timeout');
    });
  });
});
