/**
 * Utility functions for Mercado Pago integration
 */

/**
 * Generates a unique order number in format ORD-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Validates that the order amount matches the cart items
 */
export function validateOrderAmount(
  items: Array<{ quantity: number; unit_price: number }>,
  totalAmount: number
): boolean {
  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  return Math.abs(calculatedTotal - totalAmount) < 0.01;
}

/**
 * Translates Mercado Pago error messages to Spanish
 */
export function translateMercadoPagoError(error: string): string {
  const translations: Record<string, string> = {
    'Request timeout': 'Tiempo de espera agotado. Por favor, intenta nuevamente.',
    'Mercado Pago API error': 'Error al procesar el pago. Por favor, intenta nuevamente.',
    'Invalid payment data': 'Datos de pago inválidos.',
    'Payment rejected': 'Pago rechazado. Verifica los datos de tu tarjeta.',
    'Insufficient funds': 'Fondos insuficientes.',
    'Invalid card': 'Tarjeta inválida.',
  };

  for (const [key, value] of Object.entries(translations)) {
    if (error.includes(key)) {
      return value;
    }
  }

  return 'Error al procesar el pago. Por favor, intenta nuevamente.';
}
