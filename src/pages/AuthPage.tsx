import { useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '../hooks';
import { Loader } from '../components/shared/Loader';
import { AuthIllustration } from '../components/auth/AuthIllustration';
import { LoginFormContent } from '../components/auth/LoginFormContent';
import { RegisterFormContent } from '../components/auth/RegisterFormContent';

const slideLeft = {
	initial: { x: '100%' },
	animate: { x: 0 },
	exit: { x: '-100%' },
	transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
};

const slideRight = {
	initial: { x: '-100%' },
	animate: { x: 0 },
	exit: { x: '100%' },
	transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
};

export const AuthPage = () => {
	const { pathname } = useLocation();
	const { session, isLoading } = useUser();
	const isRegister = pathname === '/registro';

	if (isLoading) return <Loader />;
	if (session) return <Navigate to="/" />;

	return (
		<main className="flex w-full max-w-5xl flex-col rounded-xl border border-primary/20 bg-white shadow-2xl md:min-h-[920px] md:flex-row md:overflow-hidden">
			{/* Móvil: solo el formulario actual */}
			<div className="min-h-[500px] w-full md:hidden">
				{isRegister ? <RegisterFormContent /> : <LoginFormContent />}
			</div>

			{/* Desktop: dos columnas con animación de desplazamiento */}
			<>
				{/* Columna izquierda: login = ilustración, registro = formulario */}
				<section className="relative hidden min-h-[920px] w-full overflow-hidden md:block md:w-1/2">
					<AnimatePresence mode="wait" initial={false}>
						{isRegister ? (
							<motion.div
								key="register-form"
								className="absolute inset-0 bg-white"
								{...slideLeft}
							>
								<RegisterFormContent />
							</motion.div>
						) : (
							<motion.div
								key="login-illustration"
								className="absolute inset-0"
								{...slideLeft}
							>
								<AuthIllustration
									title={
										<>
											¡La fiesta empieza <span className="text-primary">aquí!</span>
										</>
									}
									subtitle="Únete a nuestra comunidad y accede a la mejor colección de artículos para celebrar."
									avatarLabel="¡Planners felices con nosotros!"
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</section>

				{/* Columna derecha: login = formulario, registro = ilustración */}
				<section className="relative hidden min-h-[920px] w-full overflow-hidden md:block md:w-1/2">
					<AnimatePresence mode="wait" initial={false}>
						{isRegister ? (
							<motion.div
								key="register-illustration"
								className="absolute inset-0"
								{...slideRight}
							>
								<AuthIllustration
									title={
										<>
											¡Únete a la <span className="text-primary">fiesta!</span>
										</>
									}
									subtitle="Crea tu cuenta y accede a ofertas exclusivas y la mejor colección de artículos de fiesta."
									avatarLabel="¡Ya nos acompañan!"
								/>
							</motion.div>
						) : (
							<motion.div
								key="login-form"
								className="absolute inset-0 bg-white"
								{...slideRight}
							>
								<LoginFormContent />
							</motion.div>
						)}
					</AnimatePresence>
				</section>
			</>
		</main>
	);
};
