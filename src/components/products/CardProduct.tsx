import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VariantProduct } from '../../interfaces';
import { formatPrice } from '../../helpers';
import { Tag } from '../shared/Tag';
import { useCartStore } from '../../store/cart.store';
import toast from 'react-hot-toast';

interface Props {
	img: string;
	name: string;
	price: number;
	slug: string;
	colors: { name: string; color: string }[];
	variants: VariantProduct[];
	variant?: 'default' | 'catalog';
}

export const CardProduct = ({
	img,
	name,
	price,
	slug,
	colors,
	variants,
	variant = 'default',
}: Props) => {
	const [activeColor, setActiveColor] = useState(colors[0]);
	const addItem = useCartStore(state => state.addItem);

	const selectedVariant = variants.find(
		v => v.color === activeColor.color
	);
	const stock = selectedVariant?.stock ?? 0;

	const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (selectedVariant && selectedVariant.stock > 0) {
			addItem({
				variantId: selectedVariant.id,
				productId: slug,
				name,
				image: img,
				color: activeColor.name,
				storage: selectedVariant.storage,
				price: selectedVariant.price,
				quantity: 1,
			});
			toast.success('Producto añadido al carrito', {
				position: 'bottom-right',
			});
		} else {
			toast.error('Producto agotado', {
				position: 'bottom-right',
			});
		}
	};

	if (variant === 'catalog') {
		return (
			<div className="group overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
				<Link
					to={`/productos/${slug}`}
					className="relative block h-64 overflow-hidden bg-accent-blue/10"
				>
					<img
						src={img}
						alt={name}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
					<div className="absolute right-3 top-3">
						<button
							type="button"
							onClick={e => e.preventDefault()}
							className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm text-slate-400 transition-colors hover:text-red-400"
						>
							<span className="material-icons-outlined text-sm">
								favorite_border
							</span>
						</button>
					</div>
					{stock === 0 && (
						<div className="absolute bottom-3 left-3">
							<span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
								Agotado
							</span>
						</div>
					)}
				</Link>
				<div className="p-5">
					<h3 className="mb-1 font-semibold text-slate-900 transition-colors group-hover:text-primary">
						{name}
					</h3>
					<p className="mb-4 text-xs text-slate-500">
						{colors.length} color{colors.length !== 1 ? 'es' : ''} disponible
						{colors.length !== 1 ? 's' : ''}
					</p>
					<div className="flex items-center justify-between">
						<span className="text-lg font-bold text-slate-900">
							{formatPrice(price)}
						</span>
						<button
							type="button"
							onClick={handleAddClick}
							className="flex items-center justify-center rounded-lg bg-primary p-2 text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/80"
						>
							<span className="material-icons-outlined">
								add_shopping_cart
							</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Estilo default (home, etc.)
	return (
		<div className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
			<Link
				to={`/productos/${slug}`}
				className="relative block aspect-square overflow-hidden bg-slate-100"
			>
				<img
					src={img}
					alt={name}
					className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
				/>
				{stock === 0 && (
					<div className="absolute left-4 top-4">
						<Tag contentTag="agotado" />
					</div>
				)}
				<button
					type="button"
					className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow transition-colors hover:text-red-400"
					onClick={e => e.preventDefault()}
				>
					<span className="material-icons-outlined text-xl">
						favorite_border
					</span>
				</button>
			</Link>
			<div className="p-6">
				<div className="mb-2 flex items-center gap-1">
					{[1, 2, 3, 4, 5].map(i => (
						<span
							key={i}
							className="material-icons-outlined text-sm text-yellow-400"
						>
							{i < 5 ? 'star' : 'star_half'}
						</span>
					))}
					<span className="ml-1 text-xs text-slate-400">(—)</span>
				</div>
				<h3 className="mb-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-primary">
					{name}
				</h3>
				<div className="mt-4 flex items-center justify-between">
					<span className="text-2xl font-black text-primary">
						{formatPrice(price)}
					</span>
					<button
						type="button"
						onClick={handleAddClick}
						className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
					>
						<span className="material-icons-outlined">
							add_shopping_cart
						</span>
					</button>
				</div>
			</div>
			<div className="flex gap-2 px-6 pb-4">
				{colors.map(color => (
					<button
						key={color.color}
						type="button"
						onClick={() => setActiveColor(color)}
						className={`grid h-6 w-6 place-items-center rounded-full border ${
							activeColor.color === color.color
								? 'border-slate-800'
								: 'border-transparent'
						}`}
					>
						<span
							className="h-3.5 w-3.5 rounded-full"
							style={{ backgroundColor: color.color }}
						/>
					</button>
				))}
			</div>
		</div>
	);
};
