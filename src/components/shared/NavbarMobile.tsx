import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineExpandMore } from 'react-icons/md';
import { useGlobalStore } from '../../store/global.store';
import { Link, NavLink } from 'react-router-dom';
import { navbarLinks, type NavbarLinkItem } from '../../constants/links';
import { Logo } from './Logo';
import { useEffect } from 'react';
import { supabase } from '../../supabase/client';

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

	// Fetch dynamic occasions
	const [dynamicLinks, setDynamicLinks] = useState<NavbarLinkItem[]>(navbarLinks);

	useEffect(() => {
		const fetchOccasions = async () => {
			try {
				const { data, error } = await supabase
					.from('occasions')
					.select('*')
					.order('created_at', { ascending: true });

				if (error) throw error;

				if (data && data.length > 0) {
					// Build new children array
					const occasionChildren = data.map((occ: any) => ({
						title: occ.name,
						href: `/productos?ocasion=${occ.slug}`
					}));

					setDynamicLinks(prev => prev.map(link => {
						if (link.title === 'Temporadas') {
							return { ...link, children: occasionChildren };
						}
						return link;
					}));
				}
			} catch (error) {
				console.error("Error fetching occasions for mobile navbar:", error);
			}
		};

		fetchOccasions();
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex h-screen w-screen justify-center bg-background-light py-20 px-4 shadow-lg animate-slide-in-left text-slate-800 overflow-y-auto overflow-x-hidden">
			<button
				type="button"
				className="absolute right-4 top-4 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-800 z-10"
				onClick={() => setActiveNavMobile(false)}
			>
				<IoMdClose size={24} />
			</button>

			<div className="flex flex-col gap-12">
				<div onClick={() => setActiveNavMobile(false)}>
					<Logo />
				</div>

				<nav className="flex flex-col items-center gap-2">
					{dynamicLinks.map(item => {
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
