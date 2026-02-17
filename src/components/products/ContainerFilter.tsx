import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks';

const colorOptions = [
	{ name: 'Rosa', class: 'bg-pink-200' },
	{ name: 'Azul', class: 'bg-blue-200' },
	{ name: 'Lavanda', class: 'bg-purple-200' },
	{ name: 'Crema', class: 'bg-yellow-100' },
	{ name: 'Menta', class: 'bg-green-200' },
];

const occasions = ['Cumpleaños', 'Boda', 'Baby Shower'];

interface Props {
	selectedCategories: string[];
	setSelectedCategories: (categories: string[]) => void;
}

export const ContainerFilter = ({
	selectedCategories,
	setSelectedCategories,
}: Props) => {
	const { categories: productCategories } = useCategories();

	const handleCategoryChange = (slug: string) => {
		if (selectedCategories.includes(slug)) {
			setSelectedCategories(selectedCategories.filter(c => c !== slug));
		} else {
			setSelectedCategories([...selectedCategories, slug]);
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
						onClick={() => setSelectedCategories([])}
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
						className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20"
					/>
					<div className="flex justify-between text-xs font-medium text-slate-500">
						<span>$0</span>
						<span>$100+</span>
					</div>
				</div>

				{/* Paleta de colores */}
				<div className="mb-8 space-y-4">
					<h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
						Colores
					</h4>
					<div className="flex flex-wrap gap-2">
						{colorOptions.map(c => (
							<button
								key={c.name}
								type="button"
								title={c.name}
								className={`h-8 w-8 rounded-full border-2 border-transparent shadow-sm transition-all hover:border-primary ${c.class}`}
							/>
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
								key={occ}
								type="button"
								className="rounded-full bg-accent-blue/30 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-primary/30"
							>
								{occ}
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
