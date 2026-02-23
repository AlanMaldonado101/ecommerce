import { IoWarning } from 'react-icons/io5';

export const TestModeIndicator = () => {
	const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
	const isTestMode = publicKey?.startsWith('TEST-');

	if (!isTestMode) return null;

	return (
		<div className='bg-yellow-100 border-b border-yellow-300 px-4 py-2'>
			<div className='max-w-7xl mx-auto flex items-center justify-center gap-2 text-yellow-800'>
				<IoWarning size={20} />
				<p className='text-sm font-medium'>
					Modo de prueba activo - Los pagos no son reales
				</p>
			</div>
		</div>
	);
};
