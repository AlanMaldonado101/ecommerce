import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSubcategories,
    getProviders,
    getOccasions,
    createSubcategory,
    createOccasion,
} from '../../actions';

export const useAttributes = () => {
    const queryClient = useQueryClient();

    const { data: subcategories = [], isLoading: isLoadingSubcategories } =
        useQuery({
            queryKey: ['subcategories'],
            queryFn: getSubcategories,
        });

    const { data: providers = [], isLoading: isLoadingProviders } =
        useQuery({
            queryKey: ['providers'],
            queryFn: getProviders,
        });

    const { data: occasions = [], isLoading: isLoadingOccasions } =
        useQuery({
            queryKey: ['occasions'],
            queryFn: getOccasions,
        });

    const { mutate: createSubcategoryMutation, isPending: isCreatingSubcategory } =
        useMutation({
            mutationFn: ({ name, categoryId }: { name: string; categoryId?: string }) =>
                createSubcategory(name, categoryId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['subcategories'] });
            },
        });

    const { mutate: createOccasionMutation, isPending: isCreatingOccasion } =
        useMutation({
            mutationFn: (name: string) => createOccasion(name),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['occasions'] });
            },
        });

    return {
        subcategories,
        isLoadingSubcategories,
        providers,
        isLoadingProviders,
        occasions,
        isLoadingOccasions,
        createSubcategory: createSubcategoryMutation,
        isCreatingSubcategory,
        createOccasion: createOccasionMutation,
        isCreatingOccasion,
    };
};
