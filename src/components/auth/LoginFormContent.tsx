import { useState } from 'react';
import { LuLoader2 } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks';
import toast from 'react-hot-toast';
import { resendConfirmationEmail, signInWithGoogle } from '../../actions';
import { setAuthStorageMode, setRememberForDays } from '../../supabase/authStorage';

export const LoginFormContent = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);
	const { mutate, isPending } = useLogin();

	const onLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setAuthStorageMode(remember ? 'local' : 'session');
		if (remember) setRememberForDays(30);
		mutate({ email: email.trim(), password });
	};

	return (
		<div className="flex min-h-full w-full flex-col justify-center p-8 md:p-12">
			<div className="mb-8 flex justify-center md:justify-start">
				<Link to="/" className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-pink text-white shadow-lg">
						<span className="material-icons-outlined">celebration</span>
					</div>
					<span className="text-2xl font-extrabold tracking-tighter">
						Tiendita Jireh<span className="text-primary">.</span>
					</span>
				</Link>
			</div>
			<div className="mb-8 flex rounded-lg bg-slate-100 p-1">
				<span className="flex-1 rounded-md bg-white py-2 text-center text-sm font-semibold text-[#292524] shadow-sm">
					Iniciar sesión
				</span>
				<Link
					to="/registro"
					className="flex-1 rounded-md py-2 text-center text-sm font-semibold text-[#292524]/60 transition-colors hover:text-[#292524]"
				>
					Registrarse
				</Link>
			</div>
			<div className="space-y-6">
				<div>
					<h1 className="mb-2 text-3xl font-bold">Bienvenido de nuevo</h1>
					<p className="text-sm opacity-60">
						Ingresa tus datos para acceder a tu cuenta.
					</p>
				</div>
				{isPending ? (
					<div className="flex justify-center py-12">
						<LuLoader2 className="animate-spin text-primary" size={48} />
					</div>
				) : (
					<>
						<form className="space-y-5" onSubmit={onLogin}>
							<div className="space-y-2">
								<label htmlFor="login-email" className="ml-1 text-sm font-semibold">
									Correo electrónico
								</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
										mail_outline
									</span>
									<input
										id="login-email"
										type="email"
										placeholder="hola@ejemplo.com"
										value={email}
										onChange={e => setEmail(e.target.value)}
										autoComplete="email"
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-4 text-[#292524] transition-colors focus:border-primary focus:outline-none focus:ring-0"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<div className="ml-1 flex items-center justify-between">
									<label htmlFor="login-password" className="text-sm font-semibold">
										Contraseña
									</label>
									<Link
										to="/recuperar"
										className="text-xs font-bold text-primary transition-colors hover:text-accent-pink"
									>
										¿Olvidaste tu contraseña?
									</Link>
								</div>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
										lock_open
									</span>
									<input
										id="login-password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										value={password}
										onChange={e => setPassword(e.target.value)}
										autoComplete="current-password"
										spellCheck={false}
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-10 text-[#292524] transition-colors focus:border-primary focus:outline-none focus:ring-0"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
										aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
									>
										<span className="material-icons-outlined text-sm">
											{showPassword ? 'visibility_off' : 'visibility'}
										</span>
									</button>
								</div>
							</div>
							<div className="ml-1 flex items-center space-x-2">
								<input
									id="login-remember"
									type="checkbox"
									checked={remember}
									onChange={e => setRemember(e.target.checked)}
									className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
								/>
								<label htmlFor="login-remember" className="cursor-pointer text-sm font-medium opacity-80">
									Recordarme 30 días
								</label>
							</div>
							<button
								type="submit"
								className="mt-2 w-full rounded-lg bg-accent-pink py-4 font-bold text-white shadow-lg shadow-accent-pink/20 transition-all hover:bg-accent-pink/90 active:scale-[0.98]"
							>
								Iniciar sesión
							</button>
						</form>
						<div className="text-center">
							<button
								type="button"
								onClick={async () => {
									const cleaned = email.trim();
									if (!cleaned) {
										toast.error(
											'Ingresa tu email para reenviar la confirmación',
											{ position: 'bottom-right' }
										);
										return;
									}
									try {
										await resendConfirmationEmail(cleaned);
										toast.success(
											'Te reenviamos el correo de confirmación. Revisa tu bandeja y spam.',
											{ position: 'bottom-right' }
										);
									} catch (err) {
										toast.error(
											err instanceof Error
												? err.message
												: 'No se pudo reenviar el correo',
											{ position: 'bottom-right' }
										);
									}
								}}
								className="text-xs font-bold text-primary transition-colors hover:text-accent-pink"
							>
								¿No te llegó el email de confirmación? Reenviar
							</button>
						</div>
						<div className="relative py-4">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-primary/20" />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-white px-4 text-xs font-bold uppercase text-[#292524]/40">
									O continúa con
								</span>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary/20 py-3 px-4 text-sm font-semibold transition-colors hover:bg-slate-100"
								onClick={async () => {
									try {
										setAuthStorageMode('local');
										setRememberForDays(30);
										await signInWithGoogle();
									} catch (err) {
										toast.error(
											err instanceof Error
												? err.message
												: 'No se pudo iniciar con Google',
											{ position: 'bottom-right' }
										);
									}
								}}
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
									<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
									<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
									<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
								</svg>
								Google
							</button>
							<button
								type="button"
								className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary/20 py-3 px-4 text-sm font-semibold transition-colors hover:bg-slate-100"
							>
								<svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
								Facebook
							</button>
						</div>
						<p className="mt-8 text-center text-sm opacity-60">
							¿Aún no tienes cuenta?{' '}
							<Link to="/registro" className="font-bold text-primary hover:underline">
								Regístrate
							</Link>
						</p>
					</>
				)}
			</div>
		</div>
	);
};
