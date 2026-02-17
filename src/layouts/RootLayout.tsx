import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Banner } from '../components/home/Banner';
import { Newsletter } from '../components/home/Newsletter';
import { Sheet } from '../components/shared/Sheet';
import { useGlobalStore } from '../store/global.store';
import { NavbarMobile } from '../components/shared/NavbarMobile';

const isAuthPage = (path: string) =>
	path === '/login' || path === '/registro';

export const RootLayout = () => {
	const { pathname, hash } = useLocation();
	const isSheetOpen = useGlobalStore(state => state.isSheetOpen);
	const activeNavMobile = useGlobalStore(state => state.activeNavMobile);
	const authLayout = isAuthPage(pathname);

	useEffect(() => {
		if (!hash) return;
		const id = hash.replace('#', '');
		const el = document.getElementById(id);
		if (!el) return;
		// esperar a que renderice contenido
		requestAnimationFrame(() => {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}, [hash, pathname]);

	if (authLayout) {
		return (
			<div className="login-page-bg flex min-h-screen flex-col font-display text-[#292524]">
				<div className="flex min-h-screen items-center justify-center overflow-y-auto py-8 px-4">
					<Outlet />
				</div>
				<footer className="pointer-events-none fixed bottom-4 left-0 w-full text-center">
					<p className="text-xs font-medium uppercase tracking-widest text-[#292524]/40">
						© 2024 Tiendita de Jireh • Hecho para celebrar
					</p>
				</footer>
				{isSheetOpen && <Sheet />}
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col font-display text-slate-800 transition-colors duration-300">
			<Navbar />

			{pathname === '/' && <Banner />}

			<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
				<Outlet />
			</main>

			{pathname === '/' && <Newsletter />}

			{isSheetOpen && <Sheet />}

			{activeNavMobile && <NavbarMobile />}

			<Footer />
		</div>
	);
};
