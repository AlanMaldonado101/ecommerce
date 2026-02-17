import { useQuery } from '@tanstack/react-query';
import { getUserRole } from '../../actions';

export const useRoleUser = (userId?: string) => {
	const { data, isLoading } = useQuery({
		queryKey: ['rol-user', userId],
		queryFn: async () => await getUserRole(userId as string),
		enabled: !!userId,
		retry: false,
		refetchOnWindowFocus: true,
	});

	return {
		data,
		isLoading,
	};
};
