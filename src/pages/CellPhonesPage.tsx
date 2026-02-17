import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardProduct } from '../components/products/CardProduct';
import { ContainerFilter } from '../components/products/ContainerFilter';
import { prepareProducts } from '../helpers';
import { useFilteredProducts } from '../hooks';
import { Pagination } from '../components/shared/Pagination';

const ITEMS_PER_PAGE = 10;

export const CellPhonesPage = () => {
	const [page, setPage] = useState(1);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [searchParams] = useSearchParams();

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

	useEffect(() => {
		// cuando cambia el query param, sincronizar filtros
		const a = selectedCategories.join(',');
		const b = categoriesFromUrl.join(',');
		if (a !== b) {
			setSelectedCategories(categoriesFromUrl);
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoriesFromUrl]);

	const {
		data: products = [],
		isLoading,
		totalProducts,
	} = useFilteredProducts({
		page,
		categories: selectedCategories,
	});

	const preparedProducts = prepareProducts(products);

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
				<ContainerFilter
					setSelectedCategories={setSelectedCategories}
					selectedCategories={selectedCategories}
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
									className="w-full appearance-none rounded-xl border-none bg-white py-2 pl-4 pr-10 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary sm:w-auto"
									aria-label="Ordenar por"
								>
									<option>Más populares</option>
									<option>Precio: menor a mayor</option>
									<option>Precio: mayor a menor</option>
									<option>Novedades</option>
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
