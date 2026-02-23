import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Loader } from '../components/shared/Loader';
import { IoChevronBack } from 'react-icons/io5';
import { formatDateLong, formatPrice } from '../helpers';
import type { MercadoPagoOrder } from '../interfaces/order.interface';

const tableHeaders = ['Producto', 'Cantidad', 'Precio Unitario', 'Total'];

const statusLabels: Record<string, string> = {
	pending: 'Pendiente',
	paid: 'Pagado',
	processing: 'En preparación',
	shipped: 'Enviado',
	delivered: 'Entregado',
	cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800',
	paid: 'bg-green-100 text-green-800',
	processing: 'bg-blue-100 text-blue-800',
	shipped: 'bg-purple-100 text-purple-800',
	delivered: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800',
};

export const OrderDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<MercadoPagoOrder | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrder = async () => {
			if (!id) {
				setError('ID de orden no válido');
				setIsLoading(false);
				return;
			}

			try {
				const { data, error: fetchError } = await supabase
					.from('orders')
					.select('*')
					.eq('id', id)
					.single();

				if (fetchError) throw fetchError;
				if (!data) throw new Error('Orden no encontrada');

				setOrder(data as MercadoPagoOrder);
			} catch (err) {
				console.error('Error fetching order:', err);
				setError('No se pudo cargar la orden. Verifica que tengas permiso para acceder a ella.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrder();
	}, [id]);

	if (isLoading) return <Loader />;

	if (error || !order) {
		return (
			<div className='flex flex-col items-center justify-center py-16 gap-4'>
				<p className='text-red-500'>{error || 'Orden no encontrada'}</p>
				<button
					className='btn-primary px-8 py-3'
					onClick={() => navigate('/account/pedidos')}
				>
					Volver a mis pedidos
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className='flex flex-col justify-between items-center gap-5 md:flex-row md:gap-0'>
				<button
					className='border rounded-full py-2 border-slate-200 px-5 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest hover:bg-stone-100 transition-all'
					onClick={() => navigate(-1)}
				>
					<IoChevronBack size={16} />
					Volver a los pedidos
				</button>
				<div className='flex flex-col items-center gap-1.5'>
					<h1 className='text-3xl font-bold'>Pedido {order.order_number}</h1>
					<p className='text-sm'>{formatDateLong(order.created_at)}</p>
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium ${
							statusColors[order.status] || 'bg-gray-100 text-gray-800'
						}`}
					>
						{statusLabels[order.status] || order.status}
					</span>
				</div>
				<div></div>
				<div></div>
			</div>

			<div className='flex flex-col mt-10 mb-5 gap-10'>
				{/* Items Table */}
				<table className='text-sm w-full caption-bottom overflow-auto'>
					<thead>
						<tr>
							{tableHeaders.map((header, index) => (
								<th
									key={index}
									className='h-12 text-center uppercase tracking-wide text-stone-600 font-medium'
								>
									{header}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{order.items.map((item, index) => (
							<tr key={index} className='border-b border-gray-200'>
								<td className='p-4 font-medium tracking-tighter flex gap-3 items-center'>
									<img
										src={item.image}
										alt={item.name}
										className='h-20 w-20 object-contain rounded-lg'
									/>
									<div className='space-y-2'>
										<h3>{item.name}</h3>
									</div>
								</td>
								<td className='p-4 font-medium tracking-tighter text-center'>
									{item.quantity}
								</td>
								<td className='p-4 font-medium tracking-tighter text-center'>
									{formatPrice(item.unit_price)}
								</td>
								<td className='p-4 font-medium tracking-tighter text-center'>
									{formatPrice(item.unit_price * item.quantity)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Total Summary */}
				<div className='flex flex-col gap-3 text-slate-600 text-sm self-end w-full md:w-1/2'>
					<div className='flex justify-between'>
						<p>Subtotal</p>
						<p>{formatPrice(order.total_amount)}</p>
					</div>
					<div className='flex justify-between'>
						<p>Envío (Standard)</p>
						<p>{formatPrice(0)}</p>
					</div>
					<div className='flex justify-between text-black font-semibold text-base'>
						<p>Total</p>
						<p>{formatPrice(order.total_amount)}</p>
					</div>
				</div>

				{/* Buyer Information */}
				<div className='flex flex-col gap-3'>
					<h2 className='text-lg font-bold'>Información del Comprador</h2>

					<div className='border border-stone-300 p-5 flex flex-col gap-5'>
						<div className='space-y-1'>
							<h3 className='font-medium'>Cliente:</h3>
							<p>{order.buyer_data.name}</p>
							<p className='text-sm text-slate-600'>{order.buyer_data.email}</p>
							<p className='text-sm text-slate-600'>{order.buyer_data.phone}</p>
						</div>

						<div className='flex flex-col gap-1 text-sm'>
							<h3 className='font-medium text-base'>Dirección de Envío:</h3>
							<p>
								{order.buyer_data.address.street} {order.buyer_data.address.number}
							</p>
							<p>{order.buyer_data.address.city}</p>
							<p>{order.buyer_data.address.state}</p>
							<p>{order.buyer_data.address.zipCode}</p>
						</div>
					</div>
				</div>

				{/* Payment Information */}
				{order.paid_at && (
					<div className='flex flex-col gap-3'>
						<h2 className='text-lg font-bold'>Información de Pago</h2>

						<div className='border border-stone-300 p-5 flex flex-col gap-3'>
							<div className='flex justify-between'>
								<span className='font-medium'>Método de pago:</span>
								<span>{order.payment_method || 'Checkout Pro'}</span>
							</div>
							<div className='flex justify-between'>
								<span className='font-medium'>Fecha de pago:</span>
								<span>{formatDateLong(order.paid_at)}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
