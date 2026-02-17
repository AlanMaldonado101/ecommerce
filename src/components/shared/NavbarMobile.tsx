import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineExpandMore } from 'react-icons/md';
import { useGlobalStore } from '../../store/global.store';
import { Link, NavLink } from 'react-router-dom';
import { navbarLinks, type NavbarLinkItem } from '../../constants/links';

function isDropdownLink(
	link: NavbarLinkItem
): link is NavbarLinkItem & { children: { title: string; href: string }[] } {
	return 'children' in link && Array.isArray(link.children);
}

export const NavbarMobile = () => {
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	const setActiveNavMobile = useGlobalStore(
		state => state.setActiveNavMobile
	);

	return (
		<div className="fixed z-50 flex h-screen w-full justify-center bg-background-light py-32 shadow-lg animate-slide-in-left text-slate-800">
			<button
				type="button"
				className="absolute right-5 top-5 text-slate-800"
				onClick={() => setActiveNavMobile(false)}
			>
				<IoMdClose size={30} />
			</button>

			<div className="flex flex-col gap-12">
				<Link
					to="/"
					className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
					onClick={() => setActiveNavMobile(false)}
				>
					<span className="material-icons-outlined text-3xl">
						celebration
					</span>
					Cotillón
				</Link>

				<nav className="flex flex-col items-center gap-2">
					{navbarLinks.map(item => {
						if (isDropdownLink(item)) {
							const isOpen = openDropdownId === item.id;
							return (
								<div key={item.id} className="w-full max-w-xs">
									<button
										type="button"
										onClick={() =>
											setOpenDropdownId(
												isOpen ? null : item.id
											)
										}
										className="flex w-full items-center justify-center gap-1 py-3 text-xl font-semibold transition-colors hover:text-primary"
									>
										{item.title}
										<MdOutlineExpandMore
											className={`h-5 w-5 transition-transform ${
												isOpen ? 'rotate-180' : ''
											}`}
										/>
									</button>
									{isOpen && (
										<div className="flex flex-col gap-1 py-2">
											{item.children.map(child => (
												<Link
													key={child.href}
													to={child.href}
													className="block py-2 pl-6 text-lg font-medium text-slate-600 hover:text-primary"
													onClick={() => {
														setActiveNavMobile(
															false
														);
														setOpenDropdownId(null);
													}}
												>
													{child.title}
												</Link>
											))}
										</div>
									)}
								</div>
							);
						}
						const isHashLink = item.href.includes('#');
						if (isHashLink) {
							return (
								<Link
									key={item.id}
									to={item.href}
									className="py-3 text-xl font-semibold transition-colors hover:text-primary hover:underline"
									onClick={() => setActiveNavMobile(false)}
								>
									{item.title}
								</Link>
							);
						}
						return (
							<NavLink
								key={item.id}
								to={item.href}
								className={({ isActive }) =>
									`py-3 text-xl font-semibold transition-colors ${
										isActive
											? 'text-primary underline'
											: 'hover:text-primary hover:underline'
									}`
								}
								onClick={() => setActiveNavMobile(false)}
							>
								{item.title}
							</NavLink>
						);
					})}
				</nav>
			</div>
		</div>
	);
};
