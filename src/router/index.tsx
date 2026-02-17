import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import {
	HomePage,
	CellPhonesPage,
	AboutPage,
	CellPhonePage,
	AuthPage,
	ForgotPasswordPage,
	ResetPasswordPage,
	OrdersUserPage,
	CheckoutPage,
	ThankyouPage,
	OrderUserPage,
	AccountDashboardPage,
	AccountDataPage,
	AccountAddressesPage,
	AccountFavoritesPage,
	DashboardProductsPage,
	DashboardNewProductPage,
	DashboardProductSlugPage,
	DashboardOrdersPage,
	DashboardOrderPage,
} from '../pages';
import { ClientLayout } from '../layouts/ClientLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'productos',
				element: <CellPhonesPage />,
			},
			{
				path: 'productos/:slug',
				element: <CellPhonePage />,
			},
			{
				path: 'nosotros',
				element: <AboutPage />,
			},
			{
				path: 'login',
				element: <AuthPage />,
			},
			{
				path: 'registro',
				element: <AuthPage />,
			},
			{
				path: 'recuperar',
				element: <ForgotPasswordPage />,
			},
			{
				path: 'reset-password',
				element: <ResetPasswordPage />,
			},
			{
				path: 'account',
				element: <ClientLayout />,
				children: [
					{
						path: '',
						element: <AccountDashboardPage />,
					},
					{
						path: 'pedidos',
						element: <OrdersUserPage />,
					},
					{
						path: 'pedidos/:id',
						element: <OrderUserPage />,
					},
					{
						path: 'datos',
						element: <AccountDataPage />,
					},
					{
						path: 'direcciones',
						element: <AccountAddressesPage />,
					},
					{
						path: 'favoritos',
						element: <AccountFavoritesPage />,
					},
				],
			},
		],
	},
	{
		path: '/checkout',
		element: <CheckoutPage />,
	},
	{
		path: '/checkout/:id/thank-you',
		element: <ThankyouPage />,
	},
	{
		path: '/dashboard',
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: <Navigate to='/dashboard/productos' />,
			},
			{
				path: 'productos',
				element: <DashboardProductsPage />,
			},
			{
				path: 'productos/new',
				element: <DashboardNewProductPage />,
			},
			{
				path: 'productos/editar/:slug',
				element: <DashboardProductSlugPage />,
			},
			{
				path: 'ordenes',
				element: <DashboardOrdersPage />,
			},
			{
				path: 'ordenes/:id',
				element: <DashboardOrderPage />,
			},
		],
	},
]);
