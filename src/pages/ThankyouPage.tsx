import { Link, useNavigate, useParams } from 'react-router-dom';
import { useOrder, useUser } from '../hooks';
import { Loader } from '../components/shared/Loader';
import { CiCircleCheck } from 'react-icons/ci';
import { formatPrice } from '../helpers';
import { useEffect } from 'react';
import { supabase } from '../supabase/client';

const getPaymentStatusInfo = (status: string) => {
	switch (status) {
		case 'paid':
			return {
				icon: <CiCircleCheck size={38} />,
				bgColor: 'bg-emerald-100',
				textColor: 'text-emerald-600',
				title: '¡Pago confirmado!',
				message: 'Tu pago ha sido procesado exitosamente.',
			};
		case 'pending':
			return {
				icon: <span className='material-icons-outlined text-3xl'>schedule</span>,
				bgColor: 'bg-yellow-100',
				textColor: 'text-yellow-600',
				title: 'Pago pendiente',
				message: 'Estamos esperando la confirmación de tu pago.',
			};
		case 'failed':
			return {
				icon: <span className='material-icons-outlined text-3xl'>error_outline</span>,
				bgColor: 'bg-red-100',
				textColor: 'text-red-600',
				title: 'Pago rechazado',
				message: 'No pudimos procesar tu pago. Por favor, intenta nuevamente.',
			};
		default:
			return {
				icon: <CiCircleCheck size={38} />,
				bgColor: 'bg-emerald-100',
				textColor: 'text-emerald-600',
				title: '¡Gracias por tu compra!',
				message: 'Tu pedido ha sido registrado.',
			};
	}
};

export const ThankyouPage = () => {
	const { id } = useParams<{ id: string }>();

	const { data, isLoading, isError } = useOrder(id!);
	const { isLoading: isLoadingSession } = useUser();

	const navigate = useNavigate();

	useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				navigate('/login');
			}
		});
	}, [navigate]);

	if (isError) return <div>Error al cargar la orden</div>;

	if (isLoading || !data || isLoadingSession) return <Loader />;

	const paymentStatus = getPaymentStatusInfo(data.status);

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#F4EEFF] via-[#FDF6FD] to-[#F9FAFB]'>
			<header className='border-b border-[#E5E1FF] bg-white/70 backdrop-blur-md'>
				<div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
					<Link
						to='/'
						className='flex items-center gap-2 text-sm font-bold tracking-tight text-primary sm:text-base'
					>
						<span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm'>
							<span className='material-icons-outlined text-primary text-xl'>
								celebration
							</span>
						</span>
						<span>Tiendita Jireh</span>
					</Link>

					<span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
						Resumen de tu compra
					</span>
				</div>
			</header>

			<main className='mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
				<section className='flex flex-col items-center gap-4 text-center'>
					<div className={`flex h-16 w-16 items-center justify-center rounded-full ${paymentStatus.bgColor} ${paymentStatus.textColor} shadow-sm`}>
						{paymentStatus.icon}
					</div>
					<div>
						<h1 className='text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl'>
							{paymentStatus.title}
						</h1>
						<p className='mt-1 text-sm text-slate-600 sm:text-base'>
							{paymentStatus.message}
						</p>
						<p className='mt-2 text-sm text-slate-600'>
							Pedido para {data.customer.full_name} - {data.customer.email}
						</p>
					</div>
				</section>

				<section className='grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]'>
					<div className='space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm'>
						<div className='flex items-center justify-between'>
							<h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-slate-500'>
								Resumen del pedido
							</h2>
							<span className='rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary'>
								Total pagado:{' '}
								{formatPrice(data.totalAmount)}
							</span>
						</div>

						<ul className='divide-y divide-slate-100'>
							{data.orderItems.map((item, index) => (
								<li
									key={index}
									className='flex items-center gap-3 py-3'
								>
									<div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50'>
										<img
											src={item.productImage}
											alt={item.productName}
											className='h-full w-full object-contain'
										/>
									</div>
									<div className='flex-1 space-y-1'>
										<div className='flex items-center justify-between gap-2'>
											<p className='text-sm font-semibold text-slate-900'>
												{item.productName}
											</p>
											<p className='text-sm font-semibold text-slate-700'>
												{formatPrice(item.price)}
											</p>
										</div>
										<p className='text-xs text-slate-500'>
											{item.storage} · {item.color_name} ·
											Cantidad: {item.quantity}
										</p>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className='space-y-4'>
						<div className='space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm'>
							<h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-slate-500'>
								Estado del pago
							</h2>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-slate-600'>Estado:</span>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold ${
										data.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
										data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
										'bg-red-100 text-red-700'
									}`}>
										{data.status === 'paid' ? 'Pagado' :
										 data.status === 'pending' ? 'Pendiente' :
										 data.status === 'failed' ? 'Rechazado' : 'Cancelado'}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-slate-600'>Método de pago:</span>
									<span className='text-sm font-semibold text-slate-700'>
										{data.payment_method === 'checkout_pro' ? 'Mercado Pago' :
										 data.payment_method === 'checkout_api' ? 'Tarjeta' : 'N/A'}
									</span>
								</div>
							</div>
						</div>

						{data.status === 'pending' && (
							<div className='rounded-2xl border border-yellow-200 bg-yellow-50 p-4'>
								<p className='text-sm text-yellow-800'>
									Tu pago está siendo procesado. Te notificaremos cuando se confirme.
								</p>
							</div>
						)}

						{data.status === 'failed' && (
							<div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
								<p className='text-sm text-red-800'>
									El pago no pudo ser procesado. Por favor, intenta realizar una nueva compra.
								</p>
							</div>
						)}

						<div className='space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm'>
							<h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-slate-500'>
								Información de envío
							</h2>
							<div className='space-y-1 text-sm text-slate-700'>
								<p className='font-semibold'>
									Dirección de entrega
								</p>
								<p>{data.address.addressLine1}</p>
								{data.address.addressLine2 && (
									<p>{data.address.addressLine2}</p>
								)}
								<p>
									{data.address.city}, {data.address.state}
								</p>
								<p>
									{data.address.postalCode} ·{' '}
									{data.address.country}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className='mt-2 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row'>
					<p>
						¿Necesitas ayuda con tu pedido? Escríbenos y con gusto
						te apoyamos.
					</p>
					<div className='flex flex-wrap gap-3'>
						<Link
							to='/productos'
							className='rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90'
						>
							Seguir comprando
						</Link>
						<Link
							to='/account/pedidos'
							className='rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
						>
							Ver mis pedidos
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
};
