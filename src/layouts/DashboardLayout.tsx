import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard';
import { useUser } from '../hooks';
import { useEffect, useState } from 'react';
import { getSession, getUserRole } from '../actions';
import { Loader } from '../components/shared/Loader';
import { supabase } from '../supabase/client';

export const DashboardLayout = () => {
	const navigate = useNavigate();

	const { isLoading, session } = useUser();
	const [roleLoading, setRoleLoading] = useState(true);

	useEffect(() => {
		const checkRole = async () => {
			try {
				setRoleLoading(true);
				const { session } = await getSession();

				if (!session) {
					navigate('/login', { replace: true });
					return;
				}

				const role = await getUserRole(session.user.id);

				if (role !== 'admin') {
					navigate('/', { replace: true });
					return;
				}
			} catch (err) {
				console.error('Error validando sesión/rol:', err);
				navigate('/login', { replace: true });
			} finally {
				setRoleLoading(false);
			}
		};

		checkRole();

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

	if (isLoading || roleLoading) return <Loader />;
	if (!session) return <Navigate to="/login" replace />;

	return (
		<div className='flex bg-gray-100 min-h-screen font-montserrat'>
			<Sidebar />

			<main className='container m-5 mt-7 flex-1 text-slate-800 ml-[140px] lg:ml-[270px]'>
				<Outlet />
			</main>
		</div>
	);
};
