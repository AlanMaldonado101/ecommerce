import { useQuery } from '@tanstack/react-query';
import { getMinMaxPrices } from '../../actions';

export const usePriceRange = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['priceRange'],
		queryFn: getMinMaxPrices,
		staleTime: 1000 * 60 * 60, // 1 hora
	});

	return {
		minPrice: data?.minPrice ?? 0,
		maxPrice: data?.maxPrice ?? 10000,
		isLoading,
		isError,
	};
};
