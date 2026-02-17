import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { socialLinks } from '../../constants/links';

export const Footer = () => {
	return (
		<footer className="bg-slate-900 py-16 text-slate-400">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
					<div>
						<div className="mb-6 flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
								<span className="material-icons-outlined text-lg">
									celebration
								</span>
							</div>
							<span className="text-xl font-extrabold text-white">
								Tiendita de Jireh
							</span>
						</div>
						<p className="text-sm leading-relaxed">
							Tu tiendita de artículos para fiestas. Globos, decoración y todo para celebrar.
						</p>
					</div>
					<div>
						<h5 className="mb-6 font-bold text-white">
							Enlaces rápidos
						</h5>
						<ul className="space-y-4 text-sm">
							<li>
								<Link
									to="/productos"
									className="transition-colors hover:text-primary"
								>
									Ver productos
								</Link>
							</li>
							<li>
								<Link
									to="/nosotros"
									className="transition-colors hover:text-primary"
								>
									Sobre nosotros
								</Link>
							</li>
							<li>
								<Link
									to="/"
									className="transition-colors hover:text-primary"
								>
									Inicio
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h5 className="mb-6 font-bold text-white">Ayuda</h5>
						<ul className="space-y-4 text-sm">
							<li>
								<Link
									to="#"
									className="transition-colors hover:text-primary"
								>
									Seguimiento de pedido
								</Link>
							</li>
							<li>
								<Link
									to="#"
									className="transition-colors hover:text-primary"
								>
									Envíos
								</Link>
							</li>
							<li>
								<Link
									to="#"
									className="transition-colors hover:text-primary"
								>
									Devoluciones
								</Link>
							</li>
							<li>
								<Link
									to="#"
									className="transition-colors hover:text-primary"
								>
									Contacto
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h5 className="mb-6 font-bold text-white">Síguenos</h5>
						<div className="mb-6 flex gap-4">
							{socialLinks.map(link => (
								<a
									key={link.id}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-all hover:bg-primary hover:text-white"
								>
									{link.icon}
								</a>
							))}
						</div>
						<p className="text-xs">
							Síguenos para ofertas y novedades.
						</p>
					</div>
				</div>
				<div className="flex flex-col items-center gap-4 border-t border-slate-800 pt-8 text-xs md:flex-row md:justify-between">
					<p>© 2024 Tiendita de Jireh. Todos los derechos reservados.</p>
					<div className="flex gap-6">
						<Link
							to="#"
							className="transition-colors hover:text-white"
						>
							Privacidad
						</Link>
						<Link
							to="#"
							className="transition-colors hover:text-white"
						>
							Términos
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};
