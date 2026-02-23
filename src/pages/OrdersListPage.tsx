import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Loader } from '../components/shared/Loader';
import { formatDateLong, formatPrice } from '../helpers';

interface OrderListItem {
	id: string;
	order_number: string;
	status: string;
	total_amount: number;
	created_at: string;
}

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

export const OrdersListPage = () => {
	const [orders, setOrders] = useState<OrderListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				// Check if user is authenticated
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					navigate('/login');
					return;
				}

				// Fetch orders for the authenticated user (RLS will filter automatically)
				const { data, error: fetchError } = await supabase
					.from('orders')
					.select('id, order_number, status, total_amount, created_at')
					.order('created_at', { ascending: false });

				if (fetchError) throw fetchError;

				setOrders((data || []) as unknown as OrderListItem[]);
			} catch (err) {
				console.error('Error fetching orders:', err);
				setError('No se pudieron cargar las órdenes');
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, [navigate]);

	if (isLoading) return <Loader />;

	if (error) {
		return (
			<div className='space-y-6'>
				<h1 className='text-2xl font-bold text-[#292524]'>Mis Pedidos</h1>
				<div className='flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-16 text-center'>
					<p className='text-sm text-red-600'>{error}</p>
					<button
						onClick={() => window.location.reload()}
						className='btn-primary px-8 py-3'
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<h1 className='text-2xl font-bold text-[#292524]'>Mis Pedidos</h1>
					<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary'>
						{orders.length}
					</span>
				</div>
			</div>

			{orders.length === 0 ? (
				<div className='flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 py-16 text-center'>
					<p className='text-sm text-[#64748b]'>
						Todavía no has hecho ningún pedido
					</p>
					<Link to='/productos' className='btn-primary px-8 py-3'>
						Empezar a comprar
					</Link>
				</div>
			) : (
				<div className='space-y-4'>
					{orders.map((order) => (
						<Link
							key={order.id}
							to={`/account/pedidos/${order.id}`}
							className='block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'
						>
							<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
								<div className='flex-1'>
									<div className='flex items-center gap-3 mb-2'>
										<h3 className='font-bold text-lg text-[#292524]'>
											{order.order_number}
										</h3>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${
												statusColors[order.status] || 'bg-gray-100 text-gray-800'
											}`}
										>
											{statusLabels[order.status] || order.status}
										</span>
									</div>
									<p className='text-sm text-[#64748b]'>
										{formatDateLong(order.created_at)}
									</p>
								</div>
								<div className='text-right'>
									<p className='text-sm text-[#64748b] mb-1'>Total</p>
									<p className='text-xl font-bold text-[#424874]'>
										{formatPrice(order.total_amount)}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};
