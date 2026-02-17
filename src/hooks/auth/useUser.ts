import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from '../../actions';
import { supabase } from '../../supabase/client';
import { clearRemember, isRememberExpired } from '../../supabase/authStorage';

export const useUser = () => {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ['user'],
		queryFn: getSession,
		retry: false,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		// Enforce "recordarme 30 días" (modo local con vencimiento)
		if (isRememberExpired()) {
			clearRemember();
			supabase.auth.signOut().finally(() => {
				queryClient.setQueryData(['user'], { session: null });
			});
		}

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			queryClient.setQueryData(['user'], { session });
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [queryClient]);

	return {
		session: data?.session,
		isLoading,
	};
};
