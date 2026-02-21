import { useState, useEffect } from 'react';
import { useCreatePreference } from '../../hooks/payments/useCreatePreference';
import { useProcessPayment } from '../../hooks/payments/useProcessPayment';
import { useCartStore } from '../../store/cart.store';
import { useUser } from '../../hooks/auth/useUser';
import { useNavigate } from 'react-router-dom';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { ImSpinner2 } from 'react-icons/im';

interface MercadoPagoCheckoutProps {
  buyerData: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      number: string;
      zipCode: string;
      city: string;
      state: string;
    };
  };
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const MercadoPagoCheckout = ({ buyerData }: MercadoPagoCheckoutProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'checkout_pro' | 'checkout_api'>('checkout_pro');
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);

  const cartItems = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const cleanCart = useCartStore((state) => state.cleanCart);
  const { session } = useUser();
  const navigate = useNavigate();

  const { mutate: createPreference, isPending: isCreatingPreference } = useCreatePreference();
  const { mutate: processPayment, isPending: isProcessingPayment } = useProcessPayment();

  // Load Mercado Pago SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      setMpInstance(mp);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize card form when payment method changes to checkout_api
  useEffect(() => {
    if (paymentMethod === 'checkout_api' && mpInstance && !cardForm) {
      const form = mpInstance.cardForm({
        amount: totalAmount.toString(),
        iframe: true,
        form: {
          id: 'form-checkout',
          cardNumber: {
            id: 'form-checkout__cardNumber',
            placeholder: 'Número de tarjeta',
          },
          expirationDate: {
            id: 'form-checkout__expirationDate',
            placeholder: 'MM/YY',
          },
          securityCode: {
            id: 'form-checkout__securityCode',
            placeholder: 'CVV',
          },
          cardholderName: {
            id: 'form-checkout__cardholderName',
            placeholder: 'Titular de la tarjeta',
          },
          issuer: {
            id: 'form-checkout__issuer',
            placeholder: 'Banco emisor',
          },
          installments: {
            id: 'form-checkout__installments',
            placeholder: 'Cuotas',
          },
          identificationType: {
            id: 'form-checkout__identificationType',
            placeholder: 'Tipo de documento',
          },
          identificationNumber: {
            id: 'form-checkout__identificationNumber',
            placeholder: 'Número de documento',
          },
          cardholderEmail: {
            id: 'form-checkout__cardholderEmail',
            placeholder: 'E-mail',
          },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) console.error('Form mounted error:', error);
          },
          onSubmit: (event: any) => {
            event.preventDefault();
            handleCardPayment();
          },
        },
      });
      setCardForm(form);
    }
  }, [paymentMethod, mpInstance, totalAmount]);

  const handleCheckoutPro = () => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const items = cartItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
    }));

    createPreference(
      {
        items,
        totalAmount,
        buyerData,
      },
      {
        onSuccess: (data) => {
          cleanCart();
          window.location.href = data.initPoint;
        },
      }
    );
  };

  const handleCardPayment = async () => {
    if (!session?.user || !cardForm) return;

    try {
      const { token, issuerId, paymentMethodId, installments, identificationNumber, identificationType } =
        await cardForm.getCardFormData();

      const items = cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image: item.image,
      }));

      processPayment(
        {
          token,
          paymentMethodId,
          issuerId,
          installments: parseInt(installments),
          items,
          totalAmount,
          buyerData: {
            ...buyerData,
            identification: {
              type: identificationType,
              number: identificationNumber,
            },
          },
        },
        {
          onSuccess: (data) => {
            cleanCart();
            navigate(`/checkout/${data.orderId}/thank-you`);
          },
        }
      );
    } catch (error) {
      console.error('Card payment error:', error);
    }
  };

  if (isCreatingPreference || isProcessingPayment) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-8'>
        <ImSpinner2 className='h-10 w-10 animate-spin text-[#424874]' />
        <p className='text-sm font-medium text-[#64748b]'>
          Procesando tu pago...
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
      />

      {paymentMethod === 'checkout_pro' ? (
        <button
          type='button'
          onClick={handleCheckoutPro}
          className='btn-primary mt-2 w-full justify-center text-center'
        >
          Continuar con Mercado Pago
        </button>
      ) : (
        <div className='rounded-2xl bg-white/90 p-5'>
          <form id='form-checkout' className='flex flex-col gap-4'>
            <div className='soft-input'>
              <div id='form-checkout__cardNumber' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='soft-input'>
                <div id='form-checkout__expirationDate' />
              </div>
              <div className='soft-input'>
                <div id='form-checkout__securityCode' />
              </div>
            </div>
            <div className='soft-input'>
              <div id='form-checkout__cardholderName' />
            </div>
            <div className='soft-input'>
              <div id='form-checkout__cardholderEmail' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='soft-input'>
                <select id='form-checkout__identificationType' />
              </div>
              <div className='soft-input'>
                <div id='form-checkout__identificationNumber' />
              </div>
            </div>
            <div className='soft-input'>
              <select id='form-checkout__issuer' />
            </div>
            <div className='soft-input'>
              <select id='form-checkout__installments' />
            </div>
            <button
              type='submit'
              className='btn-primary mt-2 w-full justify-center text-center'
            >
              Pagar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
