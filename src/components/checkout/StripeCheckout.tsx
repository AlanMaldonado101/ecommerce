import { useCartStore } from '../../store/cart.store';
import { useUser } from '../../hooks/auth/useUser';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { useStripeCheckout } from '../../hooks/payments/useStripeCheckout';

interface StripeCheckoutProps {
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

export const StripeCheckout = ({ buyerData }: StripeCheckoutProps) => {
    const cartItems = useCartStore((state) => state.items);
    const totalAmount = useCartStore((state) => state.totalAmount);
    const cleanCart = useCartStore((state) => state.cleanCart);
    const { session } = useUser();
    const navigate = useNavigate();

    const { mutate: createCheckout, isPending } = useStripeCheckout();

    const handlePay = () => {
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

        createCheckout(
            { items, totalAmount, buyerData },
            {
                onSuccess: (data) => {
                    cleanCart();
                    window.location.href = data.checkoutUrl;
                },
            }
        );
    };

    if (isPending) {
        return (
            <div className='flex flex-col items-center justify-center gap-3 py-8'>
                <ImSpinner2 className='h-10 w-10 animate-spin text-[#424874]' />
                <p className='text-sm font-medium text-[#64748b]'>
                    Preparando tu pago seguro...
                </p>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4'>
            <button
                type='button'
                onClick={handlePay}
                className='btn-primary mt-2 w-full justify-center text-center flex items-center gap-2'
            >
                {/* Stripe lock icon */}
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>
                Pagar con Stripe
            </button>

            <div className='rounded-lg bg-slate-50 border border-slate-200 p-3'>
                <p className='text-xs text-slate-600 flex items-start gap-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 shrink-0 mt-0.5 text-slate-400' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <circle cx='12' cy='12' r='10' /><line x1='12' y1='16' x2='12' y2='12' /><line x1='12' y1='8' x2='12.01' y2='8' />
                    </svg>
                    Serás redirigido a Stripe, la plataforma de pago más segura a nivel mundial. Puedes pagar con tarjeta de crédito o débito.
                </p>
            </div>

            {/* Stripe branding */}
            <div className='flex items-center justify-center gap-1.5 text-[10px] text-slate-400'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>
                Pagos protegidos por Stripe
            </div>
        </div>
    );
};
