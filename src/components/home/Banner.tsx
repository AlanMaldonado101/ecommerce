import { Link } from 'react-router-dom';
import { Logo } from '../shared/Logo';

export const Banner = () => {
	return (
		<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F4EEFF] via-[#FDEBFF] to-[#FFE9F5] border border-slate-100">
				<div className="absolute inset-y-0 right-0 w-1/3 bg-[rgba(180,170,255,0.15)]" aria-hidden />
				<div className="absolute inset-y-0 right-10 w-32 bg-[rgba(132,123,255,0.18)] blur-3xl" aria-hidden />

				<div className="relative z-10 grid gap-10 px-8 py-12 sm:px-12 sm:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-16 lg:py-20 items-center">
					<div className="max-w-xl">
						<div className="mb-6 flex items-center gap-3">
							<div className="hidden sm:block">
								<Logo />
							</div>
							<span className="inline-block rounded-full bg-accent-pink/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
								Nueva colección
							</span>
						</div>
						<h1 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
							Celebra cada
							<br />
							<span className="italic text-primary">inolvidable</span>
							<br />
							momento
						</h1>
						<p className="mb-8 max-w-md text-base text-slate-600 sm:text-lg">
							El destino definitivo para artículos de fiesta de primera. Desde cumpleaños hasta bodas
							elegantes.
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								to="/productos"
								className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
							>
								Comprar ahora
							</Link>
							<Link
								to="/nosotros"
								className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-800 transition-colors hover:bg-slate-50"
							>
								Ideas para fiestas
							</Link>
						</div>
					</div>

					<div className="relative flex justify-center">
						<div className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-white/70 shadow-xl shadow-primary/20 flex items-center justify-center overflow-hidden">
							<img
								src="/logo-jireh.png"
								alt="Logo Tiendita Jireh"
								className="h-56 w-56 object-contain"
							/>
						</div>
						<div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-accent-pink/30 blur-2xl" />
						<div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/25 blur-3xl" />
					</div>
				</div>
			</div>
		</section>
	);
};
