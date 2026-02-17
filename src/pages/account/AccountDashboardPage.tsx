import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders, useHomeProducts } from '../../hooks';
import { Loader } from '../../components/shared/Loader';
import {
	formatDateShort,
	formatPrice,
	formatOrderId,
	getStatus,
	getStatusBadgeClass,
	prepareProducts,
} from '../../helpers';
import { OrderItemSingle, Product } from '../../interfaces';
import type { PreparedProducts } from '../../interfaces';
import { HiOutlineTruck } from 'react-icons/hi2';
import { HiOutlineHeart } from 'react-icons/hi';
import { BiSolidCoupon } from 'react-icons/bi';
import { useCartStore } from '../../store/cart.store';
import toast from 'react-hot-toast';

export const AccountDashboardPage = () => {
	const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
	const { recentProducts = [] } = useHomeProducts();
	const [couponBannerDismissed, setCouponBannerDismissed] = useState(false);
	const addItem = useCartStore(state => state.addItem);
	const navigate = useNavigate();

	if (isLoadingOrders) return <Loader />;

	const recentOrders = [...orders].slice(0, 3);
	const preparedProducts = recentProducts.length > 0 ? prepareProducts(recentProducts as Product[]) : [] as PreparedProducts[];
	const wishlistCount = 0; // Placeholder - no wishlist feature yet
	const couponCount = 2; // Placeholder

	const handleAddToCart = (e: React.MouseEvent, product: PreparedProducts) => {
		e.preventDefault();
		const variant = product.variants[0];
		if (variant && variant.stock > 0) {
			addItem({
				variantId: variant.id,
				productId: product.slug,
				name: product.name,
				image: product.images[0] ?? '',
				color: variant.color_name,
				storage: variant.storage,
				price: variant.price,
				quantity: 1,
			});
			toast.success('Producto añadido al carrito', { position: 'bottom-right' });
		}
	};

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold text-[#292524]">Mi Dashboard</h1>

			{/* Summary cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div className="relative overflow-hidden rounded-2xl bg-primary/10 p-6">
					<div className="absolute -right-4 -top-4 opacity-10">
						<HiOutlineTruck className="h-24 w-24 text-primary" />
					</div>
					<p className="text-sm font-medium text-[#64748b]">Pedidos Totales</p>
					<p className="mt-1 text-3xl font-bold text-[#292524]">{orders.length}</p>
				</div>
				<div className="relative overflow-hidden rounded-2xl bg-primary/10 p-6">
					<div className="absolute -right-4 -top-4 opacity-10">
						<HiOutlineHeart className="h-24 w-24 text-primary" />
					</div>
					<p className="text-sm font-medium text-[#64748b]">Items en Wishlist</p>
					<p className="mt-1 text-3xl font-bold text-[#292524]">{wishlistCount}</p>
				</div>
				<div className="relative overflow-hidden rounded-2xl bg-accent-pink/20 p-6">
					<div className="absolute -right-4 -top-4 opacity-20">
						<BiSolidCoupon className="h-24 w-24 text-accent-pink" />
					</div>
					<p className="text-sm font-medium text-[#64748b]">Cupones Disponibles</p>
					<p className="mt-1 text-3xl font-bold text-[#292524]">{couponCount}</p>
				</div>
			</div>

			{/* Mis Pedidos Recientes */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-[#292524]">
						<HiOutlineTruck className="h-5 w-5" />
						Mis Pedidos Recientes
					</h2>
					<Link
						to="/account/pedidos"
						className="text-sm font-medium text-primary hover:underline"
					>
						Ver todos
					</Link>
				</div>
				<div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
					{recentOrders.length === 0 ? (
						<div className="p-8 text-center">
							<p className="text-sm text-[#64748b]">
								Todavía no has hecho ningún pedido
							</p>
							<Link
								to="/productos"
								className="btn-primary mt-4 inline-block px-6 py-3"
							>
								Empezar a comprar
							</Link>
						</div>
					) : (
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-primary/10 bg-primary/5">
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
										Orden ID
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
										Fecha
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
										Estado
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
										Total
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
										Acción
									</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map((order: OrderItemSingle) => (
									<tr
										key={order.id}
										className="border-b border-primary/5 transition-colors hover:bg-primary/5 last:border-0"
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
												onClick={() => navigate(`/account/pedidos/${order.id}`)}
												className="text-sm font-medium text-primary hover:underline"
											>
												Detalles
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</section>

			{/* Wishlist (Favoritos) */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-[#292524]">
						<HiOutlineHeart className="h-5 w-5" />
						Wishlist (Favoritos)
					</h2>
					<Link
						to="/account/favoritos"
						className="text-sm font-medium text-primary hover:underline"
					>
						Ver Wishlist completa
					</Link>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{preparedProducts.slice(0, 3).map(product => {
						const variant = product.variants[0];
						const price = variant?.price ?? product.price;
						return (
							<div
								key={product.id}
								className="group overflow-hidden rounded-2xl border border-primary/10 bg-white p-4 shadow-sm transition-all hover:shadow-md"
							>
								<div className="relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-accent-peach/10">
									<img
										src={product.images?.[0] ?? ''}
										alt={product.name}
										className="h-full max-h-24 w-auto object-contain"
									/>
									<button
										type="button"
										className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm transition-colors hover:text-red-400"
									>
										<span className="material-icons-outlined text-sm">
											favorite
										</span>
									</button>
								</div>
								<h3 className="mb-1 font-semibold text-[#292524] line-clamp-1">
									{product.name}
								</h3>
								<p className="mb-3 text-sm font-semibold text-primary">
									{formatPrice(price)}
								</p>
								<button
									type="button"
									onClick={e => handleAddToCart(e, product)}
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/15 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
								>
									<span className="material-icons-outlined text-base">
										add_shopping_cart
									</span>
									Añadir al Carrito
								</button>
							</div>
						);
					})}
					{/* Empty placeholder card */}
					<Link
						to="/productos"
						className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center transition-colors hover:border-primary/30 hover:bg-primary/10"
					>
						<span className="material-icons-outlined text-5xl text-primary/40">
							add
						</span>
						<p className="text-sm font-medium text-[#64748b]">
							¿Buscas algo más? Agrega más productos a tus favoritos para verlos
							aquí.
						</p>
						<span className="text-sm font-semibold text-primary hover:underline">
							Ir a la tienda
						</span>
					</Link>
				</div>
			</section>

			{/* Coupon banner */}
			{!couponBannerDismissed && (
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-pink/30 to-accent-peach/30 p-6">
					<button
						type="button"
						onClick={() => setCouponBannerDismissed(true)}
						className="absolute right-3 top-3 rounded-full p-1 text-[#64748b] transition-colors hover:bg-white/50 hover:text-[#292524]"
						aria-label="Cerrar"
					>
						<span className="material-icons-outlined text-xl">close</span>
					</button>
					<div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:gap-4">
						<span className="material-icons-outlined text-3xl text-primary">
							campaign
						</span>
						<div>
							<p className="text-sm font-medium text-[#292524] sm:text-base">
								¡Tienes un cupón de descuento esperando! Usa el código{' '}
								<strong>HBD20</strong> en tu próxima compra y obtén un 20% de
								descuento en toda la categoría de Globos de Helio.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
