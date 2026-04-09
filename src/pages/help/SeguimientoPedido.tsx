import { FC, useState } from 'react';
import { PackageSearch, Search } from 'lucide-react';


export const SeguimientoPedido: FC = () => {
	const [orderId, setOrderId] = useState('');
	const [trackingResult, setTrackingResult] = useState<string | null>(null);

	const handleTrack = (e: React.FormEvent) => {
		e.preventDefault();
		if (!orderId) return;

		// Mock tracking logic, in a real app this would call an API with Supabase
		setTrackingResult(`Tu pedido #${orderId} está siendo preparado con mucho amor y cuidado en nuestra tienda. Te enviaremos un correo apenas salga a reparto.`);
	};

	return (
		<div className="min-h-screen bg-slate-50 pt-24 pb-12">
			<div className="container max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col items-center p-8 md:p-16 text-center">
					<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
						<PackageSearch className="w-10 h-10 text-primary" />
					</div>
					
					<h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Rastrea tu Arreglo</h1>
					<p className="text-slate-500 mb-8 max-w-xl mx-auto">
						Ingresa el ID de tu pedido que te enviamos al correo para conocer su estado de preparación o envío en tiempo real.
					</p>

					<form onSubmit={handleTrack} className="w-full max-w-md relative">
						<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-slate-400" />
						</div>
						<input
							type="text"
							placeholder="Ej: JIREH-1234..."
							value={orderId}
							onChange={(e) => setOrderId(e.target.value)}
							className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
						/>
						<div className="absolute inset-y-2 right-2 flex items-center">
							<button type="submit" className="py-2.5 px-6 rounded-lg font-semibold shadow-none bg-primary text-white hover:bg-primary/90 transition-colors">
								Buscar
							</button>
						</div>
					</form>

					{trackingResult && (
						<div className="mt-10 p-6 bg-green-50 rounded-xl border border-green-100 w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
							<h3 className="text-green-800 font-bold mb-2 text-lg">¡Pedido Encontrado! 🎉</h3>
							<p className="text-green-700 font-medium" dangerouslySetInnerHTML={{ __html: trackingResult }}></p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
