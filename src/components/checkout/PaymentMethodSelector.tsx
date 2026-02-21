interface PaymentMethodSelectorProps {
  selectedMethod: 'checkout_pro' | 'checkout_api';
  onMethodChange: (method: 'checkout_pro' | 'checkout_api') => void;
}

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
        <button
          type='button'
          onClick={() => onMethodChange('checkout_pro')}
          className={`flex items-center justify-between rounded-2xl border px-6 py-4 text-left transition-all ${
            selectedMethod === 'checkout_pro'
              ? 'border-[#424874] bg-[#fdf6fd]'
              : 'border-[#DCD6F7] bg-white/90 hover:border-[#424874]/50'
          }`}
        >
          <div>
            <p className='text-sm font-semibold text-[#292524]'>
              Mercado Pago (Redirigir)
            </p>
            <p className='text-xs text-[#64748b]'>
              Serás redirigido a Mercado Pago para completar el pago
            </p>
          </div>
          <div
            className={`h-5 w-5 rounded-full border-2 ${
              selectedMethod === 'checkout_pro'
                ? 'border-[#424874] bg-[#424874]'
                : 'border-[#64748b]'
            }`}
          >
            {selectedMethod === 'checkout_pro' && (
              <div className='flex h-full w-full items-center justify-center'>
                <div className='h-2 w-2 rounded-full bg-white' />
              </div>
            )}
          </div>
        </button>

        <button
          type='button'
          onClick={() => onMethodChange('checkout_api')}
          className={`flex items-center justify-between rounded-2xl border px-6 py-4 text-left transition-all ${
            selectedMethod === 'checkout_api'
              ? 'border-[#424874] bg-[#fdf6fd]'
              : 'border-[#DCD6F7] bg-white/90 hover:border-[#424874]/50'
          }`}
        >
          <div>
            <p className='text-sm font-semibold text-[#292524]'>
              Tarjeta de Crédito/Débito
            </p>
            <p className='text-xs text-[#64748b]'>
              Paga directamente con tu tarjeta
            </p>
          </div>
          <div
            className={`h-5 w-5 rounded-full border-2 ${
              selectedMethod === 'checkout_api'
                ? 'border-[#424874] bg-[#424874]'
                : 'border-[#64748b]'
            }`}
          >
            {selectedMethod === 'checkout_api' && (
              <div className='flex h-full w-full items-center justify-center'>
                <div className='h-2 w-2 rounded-full bg-white' />
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
