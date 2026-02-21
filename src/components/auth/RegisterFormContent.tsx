import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks';
import { LuLoader2 } from 'react-icons/lu';
import {
	UserRegisterFormValues,
	userRegisterSchema,
} from '../../lib/validators';

export const RegisterFormContent = () => {
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserRegisterFormValues>({
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			confirmPassword: '',
			phone: '',
		},
		resolver: zodResolver(userRegisterSchema),
	});
	const { mutate, isPending } = useRegister();

	const onRegister = handleSubmit(data => {
		mutate({
			email: data.email,
			password: data.password,
			fullName: data.fullName,
			phone: data.phone,
		});
	});

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
				<Link
					to="/login"
					className="flex-1 rounded-md py-2 text-center text-sm font-semibold text-[#292524]/60 transition-colors hover:text-[#292524]"
				>
					Iniciar sesión
				</Link>
				<span className="flex-1 rounded-md bg-white py-2 text-center text-sm font-semibold text-[#292524] shadow-sm">
					Registrarse
				</span>
			</div>
			<div className="space-y-6">
				<div>
					<h1 className="mb-2 text-3xl font-bold">Crear cuenta</h1>
					<p className="text-sm opacity-60">
						Completa los datos para unirte a Tiendita Jireh.
					</p>
				</div>
				{isPending ? (
					<div className="flex justify-center py-12">
						<LuLoader2 className="animate-spin text-primary" size={48} />
					</div>
				) : (
					<>
						<form className="space-y-5" onSubmit={onRegister}>
							<div className="space-y-2">
								<label htmlFor="reg-fullName" className="ml-1 text-sm font-semibold">Nombre completo</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">person_outline</span>
									<input
										id="reg-fullName"
										type="text"
										placeholder="Tu nombre"
										{...register('fullName')}
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-4 text-[#292524] focus:border-primary focus:outline-none focus:ring-0"
									/>
								</div>
								{errors.fullName && <p className="ml-1 text-xs text-red-500">{errors.fullName.message}</p>}
							</div>
							<div className="space-y-2">
								<label htmlFor="reg-phone" className="ml-1 text-sm font-semibold">Teléfono</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">phone</span>
									<input
										id="reg-phone"
										type="tel"
										placeholder="Opcional"
										{...register('phone')}
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-4 text-[#292524] focus:border-primary focus:outline-none focus:ring-0"
									/>
								</div>
								{errors.phone && <p className="ml-1 text-xs text-red-500">{errors.phone.message}</p>}
							</div>
							<div className="space-y-2">
								<label htmlFor="reg-email" className="ml-1 text-sm font-semibold">Correo electrónico</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">mail_outline</span>
									<input
										id="reg-email"
										type="email"
										placeholder="hola@ejemplo.com"
										{...register('email')}
										autoComplete="email"
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-4 text-[#292524] focus:border-primary focus:outline-none focus:ring-0"
									/>
								</div>
								{errors.email && <p className="ml-1 text-xs text-red-500">{errors.email.message}</p>}
							</div>
							<div className="space-y-2">
								<label htmlFor="reg-password" className="ml-1 text-sm font-semibold">Contraseña</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">lock_open</span>
									<input
										id="reg-password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										{...register('password')}
										autoComplete="new-password"
										spellCheck={false}
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-10 text-[#292524] focus:border-primary focus:outline-none focus:ring-0"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
										aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
									>
										<span className="material-icons-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
									</button>
								</div>
								<p className="ml-1 text-[11px] opacity-60">
									Mínimo 8 caracteres, 1 mayúscula y 1 carácter especial.
								</p>
								{errors.password && <p className="ml-1 text-xs text-red-500">{errors.password.message}</p>}
							</div>
							<div className="space-y-2">
								<label
									htmlFor="reg-confirmPassword"
									className="ml-1 text-sm font-semibold"
								>
									Confirmar contraseña
								</label>
								<div className="relative">
									<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
										lock_open
									</span>
									<input
										id="reg-confirmPassword"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										{...register('confirmPassword')}
										autoComplete="new-password"
										spellCheck={false}
										className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-10 text-[#292524] focus:border-primary focus:outline-none focus:ring-0"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
										aria-label={
											showPassword
												? 'Ocultar contraseña'
												: 'Ver contraseña'
										}
									>
										<span className="material-icons-outlined text-sm">
											{showPassword
												? 'visibility_off'
												: 'visibility'}
										</span>
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="ml-1 text-xs text-red-500">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
							<button
								type="submit"
								className="mt-2 w-full rounded-lg bg-accent-pink py-4 font-bold text-white shadow-lg shadow-accent-pink/20 transition-all hover:bg-accent-pink/90 active:scale-[0.98]"
							>
								Registrarme
							</button>
						</form>
						<p className="mt-8 text-center text-sm opacity-60">
							¿Ya tienes cuenta?{' '}
							<Link to="/login" className="font-bold text-primary hover:underline">
								Inicia sesión
							</Link>
						</p>
					</>
				)}
			</div>
		</div>
	);
};
