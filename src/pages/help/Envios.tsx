import { FC } from 'react';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const Envios: FC = () => {
	const infoCards = [
		{
			icon: <Truck className="w-8 h-8 text-primary" />,
			title: 'Cobertura',
			description: 'Realizamos entregas seguras en toda la ciudad.',
		},
		{
			icon: <Clock className="w-8 h-8 text-primary" />,
			title: 'Horarios',
			description: 'Entregamos de Lunes a Domingo, de 9:00 AM a 8:00 PM.',
		},
		{
			icon: <ShieldCheck className="w-8 h-8 text-primary" />,
			title: 'Cuidados',
			description: 'Tus arreglos van protegidos y climatizados.',
		},
	];

	return (
		<div className="min-h-screen bg-white pt-24 pb-16">
			{/* Hero Section */}
			<div className="bg-primary/5 py-16 mb-12">
				<div className="container max-w-5xl mx-auto px-4 text-center">
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Política de Envíos</h1>
					<p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
						En Santiago Mates nos encargamos de que tu sorpresa llegue fresca, a tiempo y en perfectas condiciones hasta la puerta de esa persona especial.
					</p>
				</div>
			</div>

			<div className="container max-w-5xl mx-auto px-4">
				{/* Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
					{infoCards.map((card, idx) => (
						<div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
							<div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
								{card.icon}
							</div>
							<h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
							<p className="text-slate-600 font-medium">{card.description}</p>
						</div>
					))}
				</div>

				{/* Detailed Info */}
				<div className="max-w-3xl mx-auto prose prose-slate prose-p:font-medium prose-p:text-slate-600 prose-headings:font-bold prose-headings:text-slate-900">
					<h2 className="text-2xl mb-4">Costos de Despacho</h2>
					<p>
						Nuestros costos de envío se calculan dinámicamente en tu carrito de compras dependiendo de la comuna de destino. Contamos con una flota especializada en transporte de arreglos florales y elementos frágiles.
					</p>
					
					<h2 className="text-2xl mt-10 mb-4 flex items-center gap-3">
						<MapPin className="text-primary w-6 h-6" /> Comunas Disponibles
					</h2>
					<ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-slate-600 font-medium pl-0 list-none mt-4">
						<li className="flex items-center gap-2">• Santiago Centro</li>
						<li className="flex items-center gap-2">• Providencia</li>
						<li className="flex items-center gap-2">• Las Condes</li>
						<li className="flex items-center gap-2">• Ñuñoa</li>
						<li className="flex items-center gap-2">• La Florida</li>
						<li className="flex items-center gap-2">• Maipú</li>
					</ul>

					<div className="mt-12 bg-amber-50 rounded-2xl p-8 border border-amber-100">
						<h3 className="text-amber-800 font-bold m-0 mb-3 text-lg">Pedidos para el mismo día</h3>
						<p className="text-amber-700 m-0">
							Para solicitar una entrega el mismo día, el pedido debe ser realizado antes de las <strong>12:00 PM</strong>. Los pedidos ingresados después de esta hora se despacharán el día hábil siguiente.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
