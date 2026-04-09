import { useQuery } from '@tanstack/react-query';
import { getFilteredProducts } from '../../actions';

export const useFilteredProducts = ({
	page,
	categories,
	maxPrice,
	colors,
	occasions,
	sortBy,
}: {
	page: number;
	categories: string[];
	maxPrice?: number;
	colors?: string[];
	occasions?: string[];
	sortBy?: string;
}) => {
	const { data, isLoading } = useQuery({
		queryKey: ['filteredProducts', page, categories, maxPrice, colors, occasions, sortBy],
		queryFn: () => getFilteredProducts({ page, categories, maxPrice, colors, occasions, sortBy }),
		retry: false,
	});

	return {
		data: data?.data,
		isLoading,
		totalProducts: data?.count ?? 0,
	};
};
