import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardProduct } from '../components/products/CardProduct';
import { ContainerFilter } from '../components/products/ContainerFilter';
import { prepareProducts } from '../helpers';
import { useAttributes, useFilteredProducts, usePriceRange } from '../hooks';
import { Pagination } from '../components/shared/Pagination';

const ITEMS_PER_PAGE = 10;

export const CellPhonesPage = () => {
	const [page, setPage] = useState(1);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [sortBy, setSortBy] = useState('Novedades');
	const [searchParams] = useSearchParams();

	const { minPrice: absoluteMinPrice, maxPrice: absoluteMaxPrice, isLoading: isPriceRangeLoading } = usePriceRange();

	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

	// Inicializar el slider cuando maxPrice llega desde la bd
	useEffect(() => {
		if (maxPrice === undefined && absoluteMaxPrice !== 10000 && !isPriceRangeLoading) {
			setMaxPrice(absoluteMaxPrice);
		}
	}, [absoluteMaxPrice, maxPrice, isPriceRangeLoading]);

	const categoriesFromUrl = useMemo(() => {
		const raw = [
			...searchParams
				.getAll('categoria')
				.flatMap(v => v.split(','))
				.map(v => v.trim())
				.filter(Boolean),
			...searchParams
				.getAll('categories')
				.flatMap(v => v.split(','))
				.map(v => v.trim())
				.filter(Boolean),
		];
		return Array.from(new Set(raw));
	}, [searchParams]);

	const { occasions } = useAttributes();

	const occasionsFromUrl = useMemo(() => {
		const raw = searchParams
			.getAll('ocasion')
			.flatMap(v => v.split(','))
			.map(v => v.trim())
			.filter(Boolean);
			
		return raw
			.map(slug => occasions.find((o: any) => o.slug === slug)?.id)
			.filter(Boolean) as string[];
	}, [searchParams, occasions]);

	useEffect(() => {
		// cuando cambia el query param, sincronizar filtros
		const a = selectedCategories.join(',');
		const b = categoriesFromUrl.join(',');
		if (a !== b) {
			setSelectedCategories(categoriesFromUrl);
			setPage(1);
		}
	}, [categoriesFromUrl]);

	useEffect(() => {
		const a = selectedOccasions.join(',');
		const b = occasionsFromUrl.join(',');
		// Solo sincronizar si cargó occasions o si no hay query param
		if (a !== b && (occasionsFromUrl.length > 0 || !searchParams.has('ocasion') || occasions.length > 0)) {
			setSelectedOccasions(occasionsFromUrl);
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [occasionsFromUrl, occasions.length, searchParams]);

	const {
		data: products = [],
		isLoading,
		totalProducts,
	} = useFilteredProducts({
		page,
		categories: selectedCategories,
		colors: selectedColors,
		occasions: selectedOccasions,
		maxPrice: (maxPrice ?? 10000) >= absoluteMaxPrice ? undefined : maxPrice,
		sortBy,
	});

	const preparedProducts = prepareProducts(products as any);

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
				<ContainerFilter
					setSelectedCategories={setSelectedCategories}
					selectedCategories={selectedCategories}
					selectedColors={selectedColors}
					setSelectedColors={setSelectedColors}
					selectedOccasions={selectedOccasions}
					setSelectedOccasions={setSelectedOccasions}
					absoluteMinPrice={absoluteMinPrice}
					absoluteMaxPrice={absoluteMaxPrice}
					maxPrice={maxPrice ?? absoluteMaxPrice}
					setMaxPrice={(val: number) => {
						setMaxPrice(val);
						setPage(1);
					}}
				/>

				<section className="flex-1">
					{/* Controles del grid */}
					<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-900">
								Artículos de fiesta
							</h1>
							<p className="text-sm text-slate-500">
								Mostrando {preparedProducts.length} de {totalProducts} productos
							</p>
						</div>
						<div className="flex w-full items-center gap-4 sm:w-auto">
							<div className="relative flex-1 sm:flex-initial">
								<select
									value={sortBy}
									onChange={(e) => {
										setSortBy(e.target.value);
										setPage(1);
									}}
									className="w-full appearance-none rounded-xl border-none bg-white py-2 pl-4 pr-10 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary sm:w-auto"
									aria-label="Ordenar por"
								>
									<option value="Más populares">Más populares</option>
									<option value="Precio: menor a mayor">Precio: menor a mayor</option>
									<option value="Precio: mayor a menor">Precio: mayor a menor</option>
									<option value="Novedades">Novedades</option>
								</select>
								<span className="material-icons-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
									expand_more
								</span>
							</div>
							<div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm">
								<button
									type="button"
									onClick={() => setViewMode('grid')}
									className={`rounded-lg p-1.5 ${
										viewMode === 'grid'
											? 'bg-primary text-white'
											: 'text-slate-400 hover:bg-slate-100'
									}`}
									aria-label="Vista cuadrícula"
								>
									<span className="material-icons-outlined text-sm">
										grid_view
									</span>
								</button>
								<button
									type="button"
									onClick={() => setViewMode('list')}
									className={`rounded-lg p-1.5 ${
										viewMode === 'list'
											? 'bg-primary text-white'
											: 'text-slate-400 hover:bg-slate-100'
									}`}
									aria-label="Vista lista"
								>
									<span className="material-icons-outlined text-sm">
										view_list
									</span>
								</button>
							</div>
						</div>
					</div>

					{/* Productos */}
					{isLoading ? (
						<div className="rounded-xl bg-white p-6 shadow-sm">
							<div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-200" />
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<div
										key={i}
										className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
									>
										<div className="h-40 w-full animate-pulse rounded-xl bg-slate-200" />
										<div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
										<div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
										<div className="mt-2 h-9 w-full animate-pulse rounded-full bg-slate-200" />
									</div>
								))}
							</div>
						</div>
					) : (
						<>
							<div
								className={
									viewMode === 'grid'
										? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
										: 'flex flex-col gap-4'
								}
							>
								{preparedProducts.map(product => (
									<CardProduct
										key={product.id}
										name={product.name}
										price={product.price}
										colors={product.colors}
										img={product.images[0]}
										slug={product.slug}
										variants={product.variants}
										variant="catalog"
									/>
								))}
							</div>

							<Pagination
								totalItems={totalProducts}
								page={page}
								setPage={setPage}
								itemsPerPage={ITEMS_PER_PAGE}
							/>
						</>
					)}
				</section>
		</div>
	);
};
