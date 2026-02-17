import { useQuery } from '@tanstack/react-query';
import { getFilteredProducts } from '../../actions';

export const useFilteredProducts = ({
	page,
	categories,
}: {
	page: number;
	categories: string[];
}) => {
	const { data, isLoading } = useQuery({
		queryKey: ['filteredProducts', page, categories],
		queryFn: () => getFilteredProducts({ page, categories }),
		retry: false,
	});

	return {
		data: data?.data,
		isLoading,
		totalProducts: data?.count ?? 0,
	};
};
