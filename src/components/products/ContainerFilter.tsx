import { Link } from 'react-router-dom';
import { useAttributes, useCategories } from '../../hooks';
import { formatPrice } from '../../helpers';

const colorSwatches = [
	{ code: '#EF4444', name: 'Rojo' },
	{ code: '#F97316', name: 'Naranja' },
	{ code: '#EAB308', name: 'Amarillo' },
	{ code: '#22C55E', name: 'Verde' },
	{ code: '#3B82F6', name: 'Azul' },
	{ code: '#8B5CF6', name: 'Violeta' },
	{ code: '#EC4899', name: 'Rosa' },
	{ code: '#FFFFFF', name: 'Blanco', border: true },
	{ code: '#111827', name: 'Negro' },
	{ code: '#F9A8D4', name: 'Rosa Pastel' },
	{ code: '#93C5FD', name: 'Azul Pastel' },
	{ code: '#6EE7B7', name: 'Verde Pastel' },
];

interface Props {
	selectedCategories: string[];
	setSelectedCategories: (categories: string[]) => void;
	selectedColors: string[];
	setSelectedColors: (colors: string[]) => void;
	selectedOccasions: string[];
	setSelectedOccasions: (occasions: string[]) => void;
	absoluteMinPrice?: number;
	absoluteMaxPrice?: number;
	maxPrice: number;
	setMaxPrice: (price: number) => void;
}

export const ContainerFilter = ({
	selectedCategories,
	setSelectedCategories,
	selectedColors,
	setSelectedColors,
	selectedOccasions,
	setSelectedOccasions,
	absoluteMinPrice = 0,
	absoluteMaxPrice = 10000,
	maxPrice,
	setMaxPrice,
}: Props) => {
	const { categories: productCategories } = useCategories();
	const { occasions } = useAttributes();

	const handleCategoryChange = (slug: string) => {
		if (selectedCategories.includes(slug)) {
			setSelectedCategories(selectedCategories.filter(c => c !== slug));
		} else {
			setSelectedCategories([...selectedCategories, slug]);
		}
	};

	const handleColorChange = (colorCode: string) => {
		if (selectedColors.includes(colorCode)) {
			setSelectedColors(selectedColors.filter(c => c !== colorCode));
		} else {
			setSelectedColors([...selectedColors, colorCode]);
		}
	};

	const handleOccasionChange = (occasionId: string) => {
		if (selectedOccasions.includes(occasionId)) {
			setSelectedOccasions(selectedOccasions.filter(o => o !== occasionId));
		} else {
			setSelectedOccasions([...selectedOccasions, occasionId]);
		}
	};

	return (
		<aside className="w-full space-y-8 lg:w-64">
			<div>
				<div className="mb-4 flex items-center justify-between gap-2">
					<h3 className="flex items-center gap-2 text-lg font-bold">
						<span className="material-icons-outlined text-primary text-sm">
							filter_alt
						</span>
						Filtros
					</h3>
					<button
						type="button"
						onClick={() => {
							setSelectedCategories([]);
							setSelectedColors([]);
							setSelectedOccasions([]);
							setMaxPrice(absoluteMaxPrice);
						}}
						className="text-xs font-medium text-slate-500 hover:text-primary hover:underline"
					>
						Limpiar
					</button>
				</div>

				{/* Categorías */}
				<div className="mb-8 space-y-4">
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Categorías
					</h4>
					<div className="flex flex-col gap-2">
						{productCategories.map(cat => (
							<label
								key={cat.id}
								className="group flex cursor-pointer items-center gap-3"
							>
								<input
									type="checkbox"
									checked={selectedCategories.includes(cat.slug)}
									onChange={() => handleCategoryChange(cat.slug)}
									className="rounded border-slate-300 text-primary focus:ring-primary"
								/>
								<span className="text-sm transition-colors group-hover:text-primary">
									{cat.name}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Rango de precio */}
				<div className="mb-8 space-y-4">
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Rango de precio
					</h4>
					<input
						type="range"
						min={absoluteMinPrice}
						max={absoluteMaxPrice}
						step={100}
						value={maxPrice}
						onChange={(e) => setMaxPrice(Number(e.target.value))}
						className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20"
					/>
					<div className="flex justify-between text-xs font-medium text-slate-500">
						<span>{formatPrice(absoluteMinPrice)}</span>
						<span>{maxPrice >= absoluteMaxPrice ? `${formatPrice(absoluteMaxPrice)}+` : formatPrice(maxPrice)}</span>
					</div>
				</div>

				{/* Paleta de colores */}
				<div className="mb-8 space-y-4">
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Colores
					</h4>
					<div className="flex flex-wrap gap-2">
						{colorSwatches.map(c => (
							<button
								key={c.name}
								type="button"
								title={c.name}
								onClick={() => handleColorChange(c.code)}
								style={{ backgroundColor: c.code }}
								className={`h-8 w-8 rounded-full border-2 ${
									c.border ? 'border-slate-300' : 'border-transparent'
								} shadow-sm transition-all hover:border-primary/50 relative flex items-center justify-center ${
									selectedColors.includes(c.code) ? 'ring-2 ring-primary ring-offset-1' : ''
								}`}
							>
								{selectedColors.includes(c.code) && (
									<span className={`text-[10px] font-bold ${c.code === '#FFFFFF' ? 'text-black' : 'text-white'}`}>✓</span>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Ocasión */}
				<div className="space-y-4">
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Ocasión
					</h4>
					<div className="flex flex-wrap gap-2">
						{occasions.map(occ => (
							<button
								key={occ.id}
								type="button"
								onClick={() => handleOccasionChange(occ.id)}
								className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
									selectedOccasions.includes(occ.id)
										? 'bg-primary text-white shadow-md'
										: 'bg-accent-blue/30 text-slate-700 hover:bg-primary/30'
								}`}
							>
								{occ.name}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Tarjeta promocional */}
			<div className="group relative overflow-hidden rounded-xl bg-primary/20 p-6">
				<div className="relative z-10">
					<h5 className="mb-2 text-lg font-bold leading-tight text-primary">
						¡Oferta de temporada!
					</h5>
					<p className="mb-4 text-xs text-slate-600">
						Hasta 40% de descuento en artículos temáticos.
					</p>
					<Link
						to="/productos"
						className="inline-block rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:shadow-xl"
					>
						Comprar ahora
					</Link>
				</div>
				<span
					className="material-icons-outlined absolute -bottom-4 -right-4 text-7xl text-primary/10 rotate-12 transition-transform group-hover:scale-110"
					aria-hidden
				>
					star
				</span>
			</div>
		</aside>
	);
};
