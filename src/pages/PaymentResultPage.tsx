import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Loader } from '../components/shared/Loader';
import { TestModeIndicator } from '../components/shared/TestModeIndicator';
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from 'react-icons/io5';

interface Order {
	id: string;
	order_number: string;
	status: string;
	total_amount: number;
	created_at: string;
}

export const PaymentResultPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const orderId = searchParams.get('order_id');
	const reason = searchParams.get('reason');

	useEffect(() => {
		const fetchOrder = async () => {
			if (!orderId) {
				setError('No se encontró el ID de la orden');
				setIsLoading(false);
				return;
			}

			try {
				const { data, error: fetchError } = await supabase
					.from('orders')
					.select('id, order_number, status, total_amount, created_at')
					// @ts-ignore - Supabase type mismatch with UUID
					.eq('id', orderId)
					.single();

				if (fetchError) throw fetchError;
				if (!data) throw new Error('Orden no encontrada');

				setOrder(data as unknown as Order);
			} catch (err) {
				console.error('Error fetching order:', err);
				setError('No se pudo cargar la información de la orden');
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrder();
	}, [orderId]);

	if (isLoading) return <Loader />;

	if (error || !order) {
		return (
			<div className='min-h-screen bg-gradient-to-b from-[#bbb9e9] via-[#fdf6fd] to-[#F4EEFF] flex items-center justify-center px-4'>
				<div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center'>
					<IoCloseCircle className='mx-auto text-red-500 mb-4' size={64} />
					<h1 className='text-2xl font-bold text-[#292524] mb-2'>Error</h1>
					<p className='text-[#64748b] mb-6'>{error || 'Ocurrió un error inesperado'}</p>
					<Link to='/' className='btn-primary px-8 py-3'>
						Volver al inicio
					</Link>
				</div>
			</div>
		);
	}

	// Determine result type based on URL path
	const pathname = window.location.pathname;
	const isSuccess = pathname.includes('/success');
	const isFailure = pathname.includes('/failure');
	const isPending = pathname.includes('/pending');

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#bbb9e9] via-[#fdf6fd] to-[#F4EEFF]'>
			<TestModeIndicator />
			<header className='flex h-[90px] flex-col items-center justify-center border-b border-[#DCD6F7] bg-[rgba(244,238,255,0.95)] px-6'>
				<Link
					to='/'
					className='self-center text-3xl font-extrabold tracking-tight text-[#292524] transition-all md:self-start md:text-4xl'
				>
					<span className='text-[#424874]'>Tiendita Jireh</span>
				</Link>
			</header>

			<main className='flex items-center justify-center px-4 py-16'>
				<div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center'>
					{isSuccess && (
						<>
							<IoCheckmarkCircle className='mx-auto text-green-500 mb-4' size={64} />
							<h1 className='text-2xl font-bold text-[#292524] mb-2'>
								¡Pago exitoso!
							</h1>
							<p className='text-[#64748b] mb-4'>
								Tu pago ha sido procesado correctamente.
							</p>
							<div className='bg-[#F4EEFF] rounded-lg p-4 mb-6'>
								<p className='text-sm text-[#64748b] mb-1'>Número de orden</p>
								<p className='text-lg font-bold text-[#424874]'>{order.order_number}</p>
							</div>
							<div className='flex flex-col gap-3'>
								<Link
									to={`/account/pedidos/${order.id}`}
									className='btn-primary px-8 py-3'
								>
									Ver detalle de orden
								</Link>
								<Link
									to='/productos'
									className='text-[#424874] hover:underline text-sm'
								>
									Seguir comprando
								</Link>
							</div>
						</>
					)}

					{isFailure && (
						<>
							<IoCloseCircle className='mx-auto text-red-500 mb-4' size={64} />
							<h1 className='text-2xl font-bold text-[#292524] mb-2'>
								Pago rechazado
							</h1>
							<p className='text-[#64748b] mb-4'>
								{reason || 'Tu pago no pudo ser procesado. Por favor, intenta nuevamente.'}
							</p>
							<div className='bg-[#F4EEFF] rounded-lg p-4 mb-6'>
								<p className='text-sm text-[#64748b] mb-1'>Número de orden</p>
								<p className='text-lg font-bold text-[#424874]'>{order.order_number}</p>
							</div>
							<div className='flex flex-col gap-3'>
								<button
									onClick={() => navigate('/checkout')}
									className='btn-primary px-8 py-3'
								>
									Reintentar pago
								</button>
								<Link
									to='/productos'
									className='text-[#424874] hover:underline text-sm'
								>
									Volver a la tienda
								</Link>
							</div>
						</>
					)}

					{isPending && (
						<>
							<IoTimeOutline className='mx-auto text-yellow-500 mb-4' size={64} />
							<h1 className='text-2xl font-bold text-[#292524] mb-2'>
								Pago pendiente
							</h1>
							<p className='text-[#64748b] mb-4'>
								Tu pago está siendo procesado. Te notificaremos cuando se confirme.
							</p>
							<div className='bg-[#F4EEFF] rounded-lg p-4 mb-6'>
								<p className='text-sm text-[#64748b] mb-1'>Número de orden</p>
								<p className='text-lg font-bold text-[#424874]'>{order.order_number}</p>
							</div>
							<div className='flex flex-col gap-3'>
								<Link
									to={`/account/pedidos/${order.id}`}
									className='btn-primary px-8 py-3'
								>
									Ver detalle de orden
								</Link>
								<Link
									to='/productos'
									className='text-[#424874] hover:underline text-sm'
								>
									Seguir comprando
								</Link>
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
};
