import { Link } from 'react-router-dom';

export const AccountFavoritesPage = () => {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-[#292524]">Wishlist (Favoritos)</h1>
			<div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 py-16 text-center">
				<span className="material-icons-outlined text-6xl text-primary/40">
					favorite_border
				</span>
				<p className="max-w-sm text-sm text-[#64748b]">
					Aún no has añadido productos a tus favoritos. Explora la tienda y guarda
					los productos que te gusten.
				</p>
				<Link
					to="/productos"
					className="btn-primary px-8 py-3"
				>
					Ir a la tienda
				</Link>
			</div>
		</div>
	);
};
