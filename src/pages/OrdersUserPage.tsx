import { Link } from 'react-router-dom';
import { useOrders } from '../hooks';
import { Loader } from '../components/shared/Loader';
import { TableOrders } from '../components/orders/TableOrders';

export const OrdersUserPage = () => {
	const { data: orders = [], isLoading } = useOrders();

	if (isLoading) return <Loader />;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold text-[#292524]">Mis Pedidos</h1>
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
						{orders.length}
					</span>
				</div>
			</div>

			{orders.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 py-16 text-center">
					<p className="text-sm text-[#64748b]">
						Todavía no has hecho ningún pedido
					</p>
					<Link to="/productos" className="btn-primary px-8 py-3">
						Empezar a comprar
					</Link>
				</div>
			) : (
				<TableOrders orders={orders} />
			)}
		</div>
	);
};
