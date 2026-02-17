import { Link } from 'react-router-dom';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { ProductGrid } from '../components/home/ProductGrid';
import { ProductGridSkeleton } from '../components/skeletons/ProductGridSkeleton';
import { prepareProducts } from '../helpers';
import { useCategories, useHomeProducts } from '../hooks';

const bgClasses = [
	'bg-accent-pink/20 group-hover:bg-accent-pink/40',
	'bg-accent-peach/20 group-hover:bg-accent-peach/40',
	'bg-accent-blue/20 group-hover:bg-accent-blue/40',
	'bg-primary/10 group-hover:bg-primary/20',
];

const iconForCategory = (nameOrSlug: string) => {
	const v = nameOrSlug.toLowerCase();
	if (v.includes('globo')) return 'balloon';
	if (v.includes('reposter') || v.includes('torta') || v.includes('cake'))
		return 'cake';
	if (v.includes('navidad')) return 'holiday_village';
	if (v.includes('ano-nuevo') || v.includes('año nuevo')) return 'celebration';
	if (v.includes('oferta')) return 'sell';
	if (v.includes('destacad') || v.includes('top')) return 'emoji_events';
	if (v.includes('flor')) return 'local_florist';
	if (v.includes('decor')) return 'auto_awesome';
	return 'category';
};

export const HomePage = () => {
	const { recentProducts, popularProducts, isLoading } =
		useHomeProducts();
	const { categories, isLoading: isLoadingCategories } = useCategories();

	const preparedRecentProducts = prepareProducts(recentProducts);
	const preparedPopularProducts = prepareProducts(popularProducts);

	return (
		<div>
			{/* Shop by Category */}
			<section id="categorias" className="py-12 scroll-mt-28">
				<div className="mb-8 flex items-center justify-between">
					<h2 className="text-2xl font-bold">Comprar por categoría</h2>
					<Link
						to="/productos"
						className="flex items-center gap-1 font-semibold text-primary hover:underline"
					>
						Ver categorías
						<span className="material-icons-outlined text-sm">
							arrow_forward
						</span>
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
					{isLoadingCategories
						? Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="text-center">
									<div className="mb-4 aspect-square animate-pulse rounded-full bg-slate-200/70" />
									<div className="mx-auto h-4 w-24 animate-pulse rounded bg-slate-200/70" />
								</div>
						  ))
						: categories.slice(0, 8).map((cat, idx) => {
								const bgClass = bgClasses[idx % bgClasses.length];
								return (
									<Link
										key={cat.id}
										to={`/productos?categoria=${encodeURIComponent(
											cat.slug
										)}`}
										className="group cursor-pointer text-center"
									>
										<div
											className={`mb-4 flex aspect-square items-center justify-center rounded-full transition-colors ${bgClass}`}
										>
											<span className="material-icons-outlined text-5xl text-primary/80">
												{iconForCategory(
													cat.slug || cat.name
												)}
											</span>
										</div>
										<span className="font-bold text-slate-700">
											{cat.name}
										</span>
									</Link>
								);
						  })}
				</div>
			</section>

			<div id="novedades" className="scroll-mt-28">
				{isLoading ? (
					<ProductGridSkeleton numberOfProducts={4} />
				) : (
					<ProductGrid
						title="Nuevos Productos"
						products={preparedRecentProducts}
					/>
				)}
			</div>

			<div id="destacado" className="scroll-mt-28">
				{isLoading ? (
					<ProductGridSkeleton numberOfProducts={4} />
				) : (
					<ProductGrid
						title="Productos Destacados"
						products={preparedPopularProducts}
					/>
				)}
			</div>

			{/* Promotional Tiles */}
			<section
				id="ofertas"
				className="grid scroll-mt-28 grid-cols-1 gap-8 py-12 md:grid-cols-2"
			>
				<div className="relative flex items-center overflow-hidden rounded-xl bg-accent-pink/30 p-12">
					<div className="relative z-10 max-w-xs">
						<h3 className="mb-4 text-3xl font-extrabold text-slate-900">
							Completa tu fiesta
						</h3>
						<p className="mb-6 text-slate-700">
							Kits, globos, decoración y todo para tu celebración.
						</p>
						<Link
							to="/productos"
							className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800"
						>
							Ver productos
						</Link>
					</div>
				</div>
				<div className="relative flex items-center overflow-hidden rounded-xl bg-accent-peach/30 p-12">
					<div className="relative z-10 max-w-xs">
						<h3 className="mb-4 text-3xl font-extrabold text-slate-900">
							Ofertas exclusivas
						</h3>
						<p className="mb-6 text-slate-700">
							Suscríbete y recibe descuentos en tu primera compra.
						</p>
						<Link
							to="/productos"
							className="inline-block rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl"
						>
							Ver ofertas
						</Link>
					</div>
					<div className="absolute right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
					<span className="material-icons-outlined absolute right-12 top-1/2 -translate-y-1/2 text-9xl text-accent-peach">
						auto_fix_high
					</span>
				</div>
			</section>

			<FeatureGrid />
		</div>
	);
};
