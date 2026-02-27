import { useCreatePreference } from '../../hooks/payments/useCreatePreference';
import { useCartStore } from '../../store/cart.store';
import { useUser } from '../../hooks/auth/useUser';
import { useNavigate } from 'react-router-dom';
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

export const MercadoPagoCheckout = ({ buyerData }: MercadoPagoCheckoutProps) => {
  const cartItems = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const cleanCart = useCartStore((state) => state.cleanCart);
  const { session } = useUser();
  const navigate = useNavigate();

  const { mutate: createPreference, isPending: isCreatingPreference } = useCreatePreference();

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

  if (isCreatingPreference) {
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
      <button
        type='button'
        onClick={handleCheckoutPro}
        className='btn-primary mt-2 w-full justify-center text-center'
      >
        Continuar con Mercado Pago
      </button>

      <div className='rounded-lg bg-blue-50 border border-blue-200 p-4'>
        <p className='text-xs text-blue-800'>
          <strong>Nota:</strong> Serás redirigido a Mercado Pago donde podrás pagar con tarjeta de crédito/débito, efectivo o dinero en cuenta. Todos los métodos de pago están disponibles en la página de Mercado Pago.
        </p>
      </div>
    </div>
  );
};
