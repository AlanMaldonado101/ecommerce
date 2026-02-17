import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory } from '../../actions';

export const useCategories = () => {
	const queryClient = useQueryClient();

	const { data: categories = [], isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: getCategories,
	});

	const { mutate: createCategoryMutation, isPending: isCreating } = useMutation({
		mutationFn: (name: string) => createCategory(name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
	});

	return {
		categories,
		isLoading,
		createCategory: createCategoryMutation,
		isCreating,
	};
};
