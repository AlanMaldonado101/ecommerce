import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signUp } from '../../actions';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useRegister = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: signUp,
		onSuccess: data => {
			// Si la confirmación por email está activada, Supabase no devuelve sesión
			if (!data?.session) {
				toast.success(
					'Revisa tu correo y confirma tu cuenta para poder iniciar sesión.',
					{ position: 'bottom-right' }
				);
				queryClient.invalidateQueries({ queryKey: ['user'] });
				navigate('/login');
				return;
			}

			queryClient.invalidateQueries({ queryKey: ['user'] });
			navigate('/');
		},
		onError: err => {
			toast.error(err.message, {
				position: 'bottom-right',
			});
		},
	});

	return {
		mutate,
		isPending,
	};
};
