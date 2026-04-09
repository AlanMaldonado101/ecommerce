import { FC } from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export const Contacto: FC = () => {
	const handleContactSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert("¡Mensaje de prueba enviado! En un entorno real se enviaría a Supabase o Resend.");
	};

	return (
		<div className="min-h-screen bg-slate-50 pt-24 pb-16">
			<div className="container max-w-6xl mx-auto px-4">
				
				<div className="mb-12 text-center max-w-2xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Hablemos</h1>
					<p className="text-lg text-slate-600 font-medium">
						¿Tienes dudas sobre tu pedido, quieres cotizar un arreglo para evento de empresa o simplemente quieres saludarnos?
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
					
					{/* Columna Izquierda: Info */}
					<div className="space-y-10">
						<div>
							<h3 className="text-2xl font-bold text-slate-900 mb-6">Información de Contacto</h3>
							<ul className="space-y-6">
								<li className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
										<MapPin className="w-6 h-6" />
									</div>
									<div>
										<p className="font-bold text-slate-900 text-lg">Visítanos</p>
										<p className="text-slate-600 font-medium">Av. Providencia 1234, Local 56<br />Santiago, Chile</p>
									</div>
								</li>

								<li className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
										<Phone className="w-6 h-6" />
									</div>
									<div>
										<p className="font-bold text-slate-900 text-lg">Llámanos</p>
										<p className="text-slate-600 font-medium">+56 9 1234 5678</p>
										<p className="text-sm text-slate-400 font-medium">Lun-Sab: 9:00 - 18:00 hrs</p>
									</div>
								</li>

								<li className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
										<Mail className="w-6 h-6" />
									</div>
									<div>
										<p className="font-bold text-slate-900 text-lg">Correo Directo</p>
										<p className="text-slate-600 font-medium">contacto@santiagomates.cl</p>
									</div>
								</li>
							</ul>
						</div>

						<div>
							<h3 className="text-2xl font-bold text-slate-900 mb-4">Redes Sociales</h3>
							<div className="flex gap-4">
								<a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 hover:bg-pink-100 hover:text-pink-600 rounded-full flex items-center justify-center transition-colors text-slate-600">
									<Instagram className="w-5 h-5" />
								</a>
								<a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors text-slate-600">
									<Facebook className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Columna Derecha: Formulario */}
					<div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
						<h3 className="text-2xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
						<form onSubmit={handleContactSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-bold text-slate-700">Nombre</label>
									<input type="text" required placeholder="Tu nombre" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-bold text-slate-700">Teléfono</label>
									<input type="text" placeholder="+56 9..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700">Email</label>
								<input type="email" required placeholder="correo@ejemplo.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
							</div>

							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700">Asunto</label>
								<select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white">
									<option>Duda sobre un arreglo flor</option>
									<option>Problemas con mi entrega</option>
									<option>Cotización para empresas</option>
									<option>Reclamos</option>
									<option>Otro motivo</option>
								</select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700">Mensaje</label>
								<textarea required rows={4} placeholder="Escribe tu mensaje aquí..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"></textarea>
							</div>

							<button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
								Enviar Mensaje
							</button>
						</form>
					</div>

				</div>
			</div>
		</div>
	);
};
