import { FC } from 'react';
import { RefreshCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Devoluciones: FC = () => {
	return (
		<div className="min-h-screen bg-slate-50 pt-24 pb-16">
			{/* Header */}
			<div className="bg-white border-b border-slate-200 py-12 mb-12">
				<div className="container max-w-4xl mx-auto px-4 text-center">
					<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
						<RefreshCcw className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Cambios y Devoluciones</h1>
					<p className="text-lg text-slate-600 font-medium">
						Tu satisfacción es nuestra prioridad. Conoce nuestras políticas para arreglos florales y regalos personalizados.
					</p>
				</div>
			</div>

			<div className="container max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
					<div className="prose prose-slate max-w-none prose-p:font-medium text-slate-600 prose-headings:font-bold prose-headings:text-slate-900">
						<h2 className="text-2xl mb-4">Nuestra Política General</h2>
						<p>
							Debido a la naturaleza perecedera de nuestros productos (flores frescas, chocolates, alimentos), los cambios o devoluciones están sujetos a condiciones estrictas para garantizar la calidad e higiene, de acuerdo a la Ley Pro-Consumidor.
						</p>

						<div className="my-10 grid gap-6 md:grid-cols-2">
							<div className="bg-red-50 p-6 rounded-2xl border border-red-100">
								<h3 className="flex items-center gap-2 text-red-800 text-lg mt-0 mb-3">
									<AlertTriangle className="w-5 h-5" /> No aceptamos devoluciones si:
								</h3>
								<ul className="text-red-700 m-0 pl-5 space-y-2">
									<li>El destinatario se rehúsa a recibir el arreglo.</li>
									<li>La dirección proporcionada por el cliente era incorrecta.</li>
									<li>Se solicita un cambio por motivos de gusto personal una vez el arreglo fue preparado según las especificaciones.</li>
								</ul>
							</div>

							<div className="bg-green-50 p-6 rounded-2xl border border-green-100">
								<h3 className="flex items-center gap-2 text-green-800 text-lg mt-0 mb-3">
									<ShieldAlert className="w-5 h-5" /> Sí hacemos devoluciones si:
								</h3>
								<ul className="text-green-700 m-0 pl-5 space-y-2">
									<li>El producto llega en mal estado comprobable (flores marchitas al momento de entrega).</li>
									<li>El pedido entregado no corresponde a lo comprado en la web.</li>
									<li>Omitimos un componente clave o extra pagado por el cliente.</li>
								</ul>
							</div>
						</div>

						<h2 className="text-2xl mb-4">Plazos de Reclamo</h2>
						<p>
							Si tienes algún inconveniente con tu pedido, debes reportarlo dentro de un plazo <strong>no mayor a 4 horas</strong> desde el momento en que se completó la entrega. Nuestro equipo revisará tu caso y ofrecerá un reemplazo del arreglo o el reembolso de tu dinero según corresponda.
						</p>

						<h2 className="text-2xl mt-8 mb-4">¿Cómo solicitar una devolución?</h2>
						<p>
							Para canalizar tu reclamo necesitamos evidencia fotográfica del producto apenas lo recibiste. Por favor, comunícate con nosotros inmediatamente mediante nuestro canal de atención u ocupando la página de <Link to="/contacto" className="text-primary hover:underline">Contacto</Link>.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
