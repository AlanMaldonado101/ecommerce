export const Newsletter = () => {
	return (
		<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
			<div className="rounded-3xl bg-primary/10 p-12 text-center">
				<div className="mx-auto max-w-2xl">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
						<span className="material-icons-outlined text-3xl">
							mail
						</span>
					</div>
					<h2 className="mb-4 text-4xl font-extrabold text-slate-900">
						Únete a la comunidad
					</h2>
					<p className="mb-10 text-lg text-slate-600">
						Suscríbete y recibe ofertas exclusivas, novedades y
						acceso anticipado a promociones.
					</p>
					<form className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
						<input
							type="email"
							placeholder="Tu correo electrónico"
							className="flex-1 rounded-xl border-none bg-white px-6 py-4 focus:ring-2 focus:ring-primary dark:bg-slate-800"
						/>
						<button
							type="button"
							className="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl"
						>
							Suscribirme
						</button>
					</form>
				</div>
			</div>
		</section>
	);
};
