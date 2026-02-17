import {
	HiOutlineSquares2X2,
	HiOutlineShoppingCart,
	HiOutlineUser,
	HiOutlineMapPin,
	HiOutlineHeart,
	HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';

export const accountLinks = [
	{ id: 'dashboard', title: 'Dashboard', href: '/account', icon: HiOutlineSquares2X2 },
	{ id: 'pedidos', title: 'Mis Pedidos', href: '/account/pedidos', icon: HiOutlineShoppingCart },
	{ id: 'datos', title: 'Datos de Cuenta', href: '/account/datos', icon: HiOutlineUser },
	{ id: 'direcciones', title: 'Direcciones', href: '/account/direcciones', icon: HiOutlineMapPin },
	{ id: 'favoritos', title: 'Favoritos', href: '/account/favoritos', icon: HiOutlineHeart },
];

export const accountLogoutLink = {
	title: 'Cerrar Sesión',
	icon: HiOutlineArrowRightOnRectangle,
};
