interface Props {
	totalItems: number;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	itemsPerPage?: number;
}

export const Pagination = ({
	totalItems,
	page,
	setPage,
	itemsPerPage = 10,
}: Props) => {
	const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 1;
	const isFirstPage = page <= 1;
	const isLastPage = page >= totalPages;

	const handlePrev = () => setPage(p => Math.max(p - 1, 1));
	const handleNext = () => setPage(p => Math.min(p + 1, totalPages));

	// Números de página a mostrar: 1, 2, 3, ..., última
	const getPageNumbers = () => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		const pages: (number | 'ellipsis')[] = [1];
		if (page > 3) pages.push('ellipsis');
		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);
		for (let i = start; i <= end; i++) {
			if (!pages.includes(i)) pages.push(i);
		}
		if (page < totalPages - 2) pages.push('ellipsis');
		if (totalPages > 1) pages.push(totalPages);
		return pages;
	};

	return (
		<nav className="mt-12 flex justify-center" aria-label="Paginación">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={handlePrev}
					disabled={isFirstPage}
					className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-50 disabled:pointer-events-none"
					aria-label="Página anterior"
				>
					<span className="material-icons-outlined">chevron_left</span>
				</button>
				{getPageNumbers().map((p, i) =>
					p === 'ellipsis' ? (
						<span key={`ellipsis-${i}`} className="px-2 text-slate-400">
							...
						</span>
					) : (
						<button
							key={p}
							type="button"
							onClick={() => setPage(p)}
							className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
								page === p
									? 'bg-primary text-white'
									: 'text-slate-600 hover:bg-white'
							}`}
						>
							{p}
						</button>
					)
				)}
				<button
					type="button"
					onClick={handleNext}
					disabled={isLastPage}
					className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-50 disabled:pointer-events-none"
					aria-label="Página siguiente"
				>
					<span className="material-icons-outlined">chevron_right</span>
				</button>
			</div>
		</nav>
	);
};
