import {
	FaBoxOpen,
	FaCartShopping,
	FaFacebookF,
	FaInstagram,
	FaTiktok,
	FaXTwitter,
} from 'react-icons/fa6';

export type NavbarLinkItem =
	| { id: number; title: string; href: string; children?: never }
	| {
			id: number;
			title: string;
			href?: string;
			children: { title: string; href: string }[];
	  };

const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // quitar acentos
		.replace(/ñ/g, 'n')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

const categoryHref = (slugOrName: string) =>
	`/productos?categoria=${encodeURIComponent(slugify(slugOrName))}`;

export const navbarLinks: NavbarLinkItem[] = [
	{ id: 1, title: 'Inicio', href: '/' },
	{
		id: 2,
		title: 'Navidad',
		children: [
			{
				title: 'Pack navideño',
				href: categoryHref('navidad-pack-navideno'),
			},
			{
				title: 'Decoración',
				href: categoryHref('navidad-decoracion'),
			},
			{
				title: 'Papel de regalo y sellos',
				href: categoryHref('navidad-papel-de-regalo-y-sellos'),
			},
			{
				title: 'Cinta y scotch',
				href: categoryHref('navidad-cinta-y-scotch'),
			},
			{
				title: 'Cajas',
				href: categoryHref('navidad-cajas'),
			},
		],
	},
	{
		id: 3,
		title: 'Año nuevo',
		children: [
			{
				title: 'Decoración',
				href: categoryHref('ano-nuevo-decoracion'),
			},
			{
				title: 'Lanza confetti',
				href: categoryHref('ano-nuevo-lanza-confetti'),
			},
			{
				title: 'Serpentina y nieve',
				href: categoryHref('ano-nuevo-serpentina-y-nieve'),
			},
		],
	},
	{ id: 4, title: 'Globos', href: categoryHref('globos') },
	{ id: 5, title: 'Repostería', href: categoryHref('reposteria') },
	{ id: 6, title: 'Novedades', href: '/#novedades' },
	{
		id: 7,
		title: 'Temporadas',
		children: [
			{
				title: 'Día de los enamorados',
				href: categoryHref('temporada-dia-de-los-enamorados'),
			},
			{
				title: 'Pascua de resurrección',
				href: categoryHref('temporada-pascua-de-resurreccion'),
			},
			{
				title: 'Día de la madre',
				href: categoryHref('temporada-dia-de-la-madre'),
			},
			{
				title: 'Día del padre',
				href: categoryHref('temporada-dia-del-padre'),
			},
			{
				title: 'Día del niño/a',
				href: categoryHref('temporada-dia-del-nino-a'),
			},
			{
				title: 'Fiestas patrias',
				href: categoryHref('temporada-fiestas-patrias'),
			},
			{
				title: 'Graduación',
				href: categoryHref('temporada-graduacion'),
			},
			{
				title: 'Halloween',
				href: categoryHref('temporada-halloween'),
			},
			{
				title: 'Navidad',
				href: categoryHref('temporada-navidad'),
			},
			{
				title: 'Año nuevo',
				href: categoryHref('temporada-ano-nuevo'),
			},
			{
				title: 'Florería',
				href: categoryHref('floreria'),
			},
		],
	},
	{ id: 8, title: 'DESTACADO', href: '/#destacado' },
	{ id: 9, title: 'OFERTAS', href: '/#ofertas' },
];

export const socialLinks = [
	{
		id: 1,
		title: 'Facebook',
		href: 'https://www.facebook.com',
		icon: <FaFacebookF />,
	},
	{
		id: 2,
		title: 'Twitter',
		href: 'https://www.twitter.com',
		icon: <FaXTwitter />,
	},
	{
		id: 3,
		title: 'Instagram',
		href: 'https://www.instagram.com',
		icon: <FaInstagram />,
	},
	{
		id: 4,
		title: 'Tiktok',
		href: 'https://www.tiktok.com',
		icon: <FaTiktok />,
	},
];

export const dashboardLinks = [
	{
		id: 1,
		title: 'Productos',
		href: '/dashboard/productos',
		icon: <FaBoxOpen size={25} />,
	},
	{
		id: 2,
		title: 'Ordenes',
		href: '/dashboard/ordenes',
		icon: <FaCartShopping size={25} />,
	},
];
