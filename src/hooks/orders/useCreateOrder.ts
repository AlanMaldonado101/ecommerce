import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../actions';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useCreateOrder = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate, isPending } = useMutation({
		mutationFn: createOrder,
		onSuccess: data => {
			queryClient.invalidateQueries({
				queryKey: ['orders'],
			});
			navigate(`/checkout/${data.id}/thank-you`);
		},
		onError: error => {
			toast.error(error.message, {
				position: 'bottom-right',
			});
		},
	});

	return {
		mutate,
		isPending,
	};
};
