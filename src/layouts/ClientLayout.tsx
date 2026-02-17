import { Link, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../actions';
import { useRoleUser, useUser, useCustomer } from '../hooks';
import { useEffect } from 'react';
import { supabase } from '../supabase/client';
import { Loader } from '../components/shared/Loader';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { accountLinks, accountLogoutLink } from '../constants/accountLinks';

const getBreadcrumb = (pathname: string) => {
	if (pathname === '/account' || pathname === '/account/') return ['Mi Cuenta', 'Dashboard'];
	if (pathname.startsWith('/account/pedidos/')) return ['Mi Cuenta', 'Pedidos', 'Detalles'];
	if (pathname === '/account/pedidos') return ['Mi Cuenta', 'Pedidos'];
	if (pathname === '/account/datos') return ['Mi Cuenta', 'Datos de Cuenta'];
	if (pathname === '/account/direcciones') return ['Mi Cuenta', 'Direcciones'];
	if (pathname === '/account/favoritos') return ['Mi Cuenta', 'Favoritos'];
	return ['Mi Cuenta'];
};

export const ClientLayout = () => {
	const { pathname } = useLocation();
	const { session, isLoading: isLoadingSession } = useUser();
	const userId = session?.user.id;
	const { data: customer, isLoading: isLoadingCustomer } = useCustomer(userId);
	const { data: role, isLoading: isLoadingRole } = useRoleUser(userId);

	const navigate = useNavigate();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (event === 'SIGNED_OUT') {
				navigate('/login', { replace: true });
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [navigate]);

	if (isLoadingSession || isLoadingRole || isLoadingCustomer) return <Loader />;
	if (!session) return <Navigate to="/login" replace />;

	const handleLogout = async () => {
		await signOut();
	};

	const initials = customer?.full_name
		? customer.full_name
				.split(' ')
				.map(n => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: session?.user.email?.[0]?.toUpperCase() ?? 'U';

	const breadcrumb = getBreadcrumb(pathname);

	return (
		<div className="space-y-6">
			{/* Barra secundaria: breadcrumb + enlaces rápidos */}
			<div className="flex flex-col gap-3 border-b border-primary/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<nav className="flex items-center gap-2 text-sm text-[#64748b]">
					{breadcrumb.map((item, index) => {
						const href =
							item === 'Mi Cuenta'
								? '/account'
								: item === 'Pedidos'
									? '/account/pedidos'
									: index < breadcrumb.length - 1
										? '/account'
										: null;
						return (
							<span key={`${item}-${index}`} className="flex items-center gap-2">
								{index > 0 && (
									<span className="text-primary/50">&gt;</span>
								)}
								{index === breadcrumb.length - 1 ? (
									<span className="font-semibold text-[#292524]">{item}</span>
								) : href ? (
									<Link
										to={href}
										className="hover:text-primary hover:underline"
									>
										{item}
									</Link>
								) : (
									<span>{item}</span>
								)}
							</span>
						);
					})}
				</nav>
				<div className="flex items-center gap-4 text-sm font-medium">
					<Link
						to="/account/pedidos"
						className="text-[#64748b] transition-colors hover:text-primary"
					>
						Pedidos
					</Link>
					{role === 'admin' && (
						<Link
							to="/dashboard/productos"
							className="flex items-center gap-1 text-[#64748b] transition-colors hover:text-primary"
						>
							Dashboard
							<HiOutlineExternalLink className="h-4 w-4" />
						</Link>
					)}
					<button
						type="button"
						onClick={handleLogout}
						className="text-red-600 transition-colors hover:text-red-700 hover:underline"
					>
						Cerrar sesión
					</button>
				</div>
			</div>

			<div className="flex min-h-[calc(100vh-10rem)] flex-col gap-8 lg:flex-row lg:gap-12">
			{/* Sidebar */}
			<aside className="shrink-0 lg:w-72">
				<div className="sticky top-24 space-y-6">
					{/* User profile card */}
					<div className="rounded-2xl bg-primary/10 p-6 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
							{initials}
						</div>
						<h2 className="text-lg font-bold text-[#292524]">
							{customer?.full_name ?? 'Usuario'}
						</h2>
						<p className="mt-1 text-sm text-[#64748b]">
							{customer?.email ?? session?.user.email ?? '—'}
						</p>
					</div>

					{/* Navigation menu */}
					<nav className="space-y-1">
						{accountLinks.map(link => {
							const Icon = link.icon;
							return (
								<NavLink
									key={link.id}
									to={link.href}
									end={link.href === '/account'}
									className={({ isActive }) =>
										`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
											isActive
												? 'bg-primary/15 text-primary'
												: 'text-[#64748b] hover:bg-primary/10 hover:text-primary'
										}`
									}
								>
									<Icon className="h-5 w-5 shrink-0" />
									{link.title}
								</NavLink>
							);
						})}
						{role === 'admin' && (
							<NavLink
								to="/dashboard/productos"
								className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#64748b] transition-colors hover:bg-primary/10 hover:text-primary"
							>
								<HiOutlineExternalLink className="h-5 w-5 shrink-0" />
								Dashboard
							</NavLink>
						)}
						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							<accountLogoutLink.icon className="h-5 w-5 shrink-0" />
							{accountLogoutLink.title}
						</button>
					</nav>
				</div>
			</aside>

			{/* Main content */}
			<main className="min-w-0 flex-1">
				<Outlet />
			</main>
		</div>
		</div>
	);
};
