export const FeatureGrid = () => {
	return (
		<section className="border-t border-primary/10 py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
					<div className="p-6">
						<span className="material-icons-outlined mb-4 text-4xl text-primary">
							local_shipping
						</span>
						<h4 className="mb-2 text-lg font-bold">Envío rápido</h4>
						<p className="text-sm text-slate-500">
							Envío el mismo día en pedidos antes de las 14h.
						</p>
					</div>
					<div className="p-6">
						<span className="material-icons-outlined mb-4 text-4xl text-primary">
							verified_user
						</span>
						<h4 className="mb-2 text-lg font-bold">
							Pago seguro
						</h4>
						<p className="text-sm text-slate-500">
							Compra con confianza con checkout cifrado.
						</p>
					</div>
					<div className="p-6">
						<span className="material-icons-outlined mb-4 text-4xl text-primary">
							sentiment_very_satisfied
						</span>
						<h4 className="mb-2 text-lg font-bold">
							Garantía de satisfacción
						</h4>
						<p className="text-sm text-slate-500">
							Devoluciones fáciles en 30 días si no estás
							conforme.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
