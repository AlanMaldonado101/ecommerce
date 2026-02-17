import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { FormCheckout } from '../components/checkout/FormCheckout';
import { ItemsCheckout } from '../components/checkout/ItemsCheckout';
import { useUser } from '../hooks';
import { Loader } from '../components/shared/Loader';
import { useEffect } from 'react';
import { supabase } from '../supabase/client';

export const CheckoutPage = () => {
	const totalItems = useCartStore(state => state.totalItemsInCart);

	const { isLoading } = useUser();

	const navigate = useNavigate();

	useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				navigate('/login');
			}
		});
	}, [navigate]);

	if (isLoading) return <Loader />;

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#bbb9e9] via-[#fdf6fd] to-[#F4EEFF]'>
			<header className='flex h-[90px] flex-col items-center justify-center border-b border-[#DCD6F7] bg-[rgba(244,238,255,0.95)] px-6'>
				<Link
					to='/'
					className='self-center text-3xl font-extrabold tracking-tight text-[#292524] transition-all md:self-start md:text-4xl'
				>
					<p>
						<span className='text-[#424874]'>Tiendita de Jireh</span>
					</p>
				</Link>
			</header>

			<main className='relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row'>
				{totalItems === 0 ? (
					<div
						className='flex w-full flex-col items-center justify-center gap-5 rounded-3xl bg-white/80 py-16 text-center shadow-lg'
					>
						<p className='text-sm font-medium tracking-tight text-[#64748b]'>
							Su carro esta vacío
						</p>
						<Link
							to='/productos'
							className='btn-primary px-8 py-3 text-xs uppercase tracking-[0.18em]'
						>
							Empezar a comprar
						</Link>
					</div>
				) : (
					<>
						<div className='w-full md:w-[55%]'>
							<FormCheckout />
						</div>

						<div
							className='sticky top-24 hidden w-[45%] md:block'
						>
							<div className='glass-card p-6 md:p-8'>
								<h3 className='mb-4 text-lg font-semibold text-[#292524]'>
									Tu pedido
								</h3>
								<ItemsCheckout />
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
};
