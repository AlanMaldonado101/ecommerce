import { useNavigate } from 'react-router-dom';
import {
	formatDateShort,
	formatPrice,
	formatOrderId,
	getStatus,
	getStatusBadgeClass,
} from '../../helpers';
import { OrderItemSingle } from '../../interfaces';

interface Props {
	orders: OrderItemSingle[];
}

const tableHeaders = ['Orden ID', 'Fecha', 'Estado', 'Total', 'Acción'];

export const TableOrders = ({ orders }: Props) => {
	const navigate = useNavigate();

	return (
		<div className="relative w-full overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
			<table className="w-full text-sm caption-bottom">
				<thead>
					<tr className="border-b border-primary/10 bg-primary/5">
						{tableHeaders.map((header, index) => (
							<th
								key={index}
								className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{orders.map(order => (
						<tr
							key={order.id}
							className="cursor-pointer border-b border-primary/5 transition-colors hover:bg-primary/5 last:border-0"
							onClick={() => navigate(`/account/pedidos/${order.id}`)}
						>
							<td className="px-4 py-3 font-medium text-[#292524]">
								{formatOrderId(order.id)}
							</td>
							<td className="px-4 py-3 text-[#64748b]">
								{formatDateShort(order.created_at)}
							</td>
							<td className="px-4 py-3">
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
								>
									{getStatus(order.status)}
								</span>
							</td>
							<td className="px-4 py-3 font-semibold text-[#292524]">
								{formatPrice(order.total_amount)}
							</td>
							<td className="px-4 py-3">
								<button
									type="button"
									onClick={e => {
										e.stopPropagation();
										navigate(`/account/pedidos/${order.id}`);
									}}
									className="text-sm font-medium text-primary hover:underline"
								>
									Detalles
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
