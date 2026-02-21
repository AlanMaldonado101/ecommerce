import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navbarLinks, type NavbarLinkItem } from '../../constants/links';
import {
	HiOutlineSearch,
	HiOutlineShoppingBag,
	HiOutlineUser,
} from 'react-icons/hi';
import { FaBarsStaggered } from 'react-icons/fa6';
import { MdOutlineExpandMore } from 'react-icons/md';
import { Logo } from './Logo';
import { useGlobalStore } from '../../store/global.store';
import { useCartStore } from '../../store/cart.store';
import { useCustomer, useUser } from '../../hooks';
import { LuLoader2 } from 'react-icons/lu';

function isDropdownLink(
	link: NavbarLinkItem
): link is NavbarLinkItem & { children: { title: string; href: string }[] } {
	return 'children' in link && Array.isArray(link.children);
}

export const Navbar = () => {
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	const navRef = useRef<HTMLDivElement>(null);

	const openSheet = useGlobalStore(state => state.openSheet);
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);
	const setActiveNavMobile = useGlobalStore(
		state => state.setActiveNavMobile
	);
	const { session, isLoading } = useUser();
	const userId = session?.user.id;
	const { data: customer } = useCustomer(userId);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				navRef.current &&
				!navRef.current.contains(e.target as Node)
			) {
				setOpenDropdownId(null);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<nav className="sticky top-0 z-50 border-b border-primary/10 bg-background-light/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-20 items-center justify-between">
					<Logo />

					{/* Nav links */}
					<nav
						ref={navRef}
						className="hidden md:flex items-center gap-1 flex-1 justify-center"
					>
						{navbarLinks.map(link => {
							if (isDropdownLink(link)) {
								const isOpen = openDropdownId === link.id;
								return (
									<div
										key={link.id}
										className="relative"
									>
										<button
											type="button"
											onClick={() =>
												setOpenDropdownId(prev =>
													prev === link.id
														? null
														: link.id
												)
											}
											className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
										>
											{link.title}
											<MdOutlineExpandMore
												className={`h-4 w-4 transition-transform ${
													isOpen
														? 'rotate-180'
														: ''
												}`}
											/>
										</button>
										{isOpen && (
											<div className="absolute left-0 top-full mt-1 min-w-[180px] rounded-xl border border-primary/10 bg-background-light py-2 shadow-lg">
												{link.children.map(
													(child) => (
														<Link
															key={
																child.href
															}
															to={
																child.href
															}
															className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
															onClick={() =>
																setOpenDropdownId(
																	null
																)
															}
														>
															{
																child.title
															}
														</Link>
													)
												)}
											</div>
										)}
									</div>
								);
							}
							const isHashLink = link.href.includes('#');
							if (isHashLink) {
								return (
									<Link
										key={link.id}
										to={link.href}
										className="rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-700 hover:bg-primary/10 hover:text-primary"
									>
										{link.title}
									</Link>
								);
							}
							return (
								<NavLink
									key={link.id}
									to={link.href}
									className={({ isActive }) =>
										`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
											isActive
												? 'text-primary bg-primary/10'
												: 'text-slate-700 hover:bg-primary/10 hover:text-primary'
										}`
									}
								>
									{link.title}
								</NavLink>
							);
						})}
					</nav>

					{/* Action Icons Group */}
					<div className="flex items-center gap-2 md:gap-4">
						<button
							onClick={() => openSheet('search')}
							className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
							title="Buscar"
						>
							<HiOutlineSearch size={22} />
						</button>

						{isLoading ? (
							<LuLoader2
								className="animate-spin text-primary"
								size={26}
							/>
						) : session ? (
							<Link
								to="/account"
								className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
								title="Cuenta"
							>
								{customer?.full_name ? (
									<span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-bold text-primary shadow-sm">
										{customer.full_name[0]}
									</span>
								) : (
									<HiOutlineUser size={22} />
								)}
							</Link>
						) : (
							<Link
								to="/login"
								className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
								title="Cuenta"
							>
								<HiOutlineUser size={22} />
							</Link>
						)}

						<button
							className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
							onClick={() => openSheet('cart')}
							title="Carrito"
						>
							<HiOutlineShoppingBag size={22} />
							{totalItemsInCart > 0 && (
								<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
									{totalItemsInCart}
								</span>
							)}
						</button>

						<button
							className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
							onClick={() => setActiveNavMobile(true)}
						>
							<FaBarsStaggered size={18} />
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};
