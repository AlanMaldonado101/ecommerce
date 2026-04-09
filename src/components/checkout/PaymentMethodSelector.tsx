export type PaymentMethod = 'webpay' | 'checkout_pro';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const methodConfig: Record<PaymentMethod, { label: string; description: string }> = {
  webpay: {
    label: 'Webpay Plus (Tarjetas / Redcompra)',
    description: 'Paga de forma segura con Webpay de Transbank.',
  },
  checkout_pro: {
    label: 'Mercado Pago',
    description: 'Serás redirigido a Mercado Pago para completar el pago.',
  },
};

export const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) => {
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]'>
        3. Método de pago
      </p>

      <div className='flex flex-col gap-3'>
        {(Object.entries(methodConfig) as [PaymentMethod, (typeof methodConfig)[PaymentMethod]][]).map(
          ([method, { label, description }]) => (
            <button
              key={method}
              type='button'
              onClick={() => onMethodChange(method)}
              className={`flex items-center justify-between rounded-2xl border px-6 py-4 text-left transition-all ${selectedMethod === method
                  ? 'border-[#424874] bg-[#fdf6fd]'
                  : 'border-[#DCD6F7] bg-white/90 hover:border-[#424874]/50'
                }`}
            >
              <div>
                <p className='text-sm font-semibold text-[#292524]'>{label}</p>
                <p className='text-xs text-[#64748b]'>{description}</p>
              </div>
              <div
                className={`h-5 w-5 shrink-0 rounded-full border-2 ${selectedMethod === method
                    ? 'border-[#424874] bg-[#424874]'
                    : 'border-[#64748b]'
                  }`}
              >
                {selectedMethod === method && (
                  <div className='flex h-full w-full items-center justify-center'>
                    <div className='h-2 w-2 rounded-full bg-white' />
                  </div>
                )}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
};
