import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updatePassword } from '../actions';
import { LuLoader2 } from 'react-icons/lu';

export const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	return (
		<main className="w-full max-w-xl rounded-xl border border-primary/20 bg-white p-8 shadow-2xl">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Crear nueva contraseña</h1>
				<p className="mt-1 text-sm opacity-70">
					Mínimo 8 caracteres, 1 mayúscula y 1 carácter especial.
				</p>
			</div>

			<form
				className="space-y-5"
				onSubmit={async e => {
					e.preventDefault();

					if (password !== confirmPassword) {
						toast.error('Las contraseñas no coinciden', {
							position: 'bottom-right',
						});
						return;
					}

					try {
						setIsSaving(true);
						await updatePassword(password);
						toast.success('Contraseña actualizada. Ya puedes iniciar sesión.', {
							position: 'bottom-right',
						});
						navigate('/login', { replace: true });
					} catch (err) {
						toast.error(
							err instanceof Error
								? err.message
								: 'No se pudo actualizar la contraseña',
							{ position: 'bottom-right' }
						);
					} finally {
						setIsSaving(false);
					}
				}}
			>
				<div className="space-y-2">
					<label htmlFor="reset-password" className="ml-1 text-sm font-semibold">
						Nueva contraseña
					</label>
					<div className="relative">
						<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
							lock_open
						</span>
						<input
							id="reset-password"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							value={password}
							onChange={e => setPassword(e.target.value)}
							autoComplete="new-password"
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

				<div className="space-y-2">
					<label
						htmlFor="reset-confirm"
						className="ml-1 text-sm font-semibold"
					>
						Confirmar contraseña
					</label>
					<div className="relative">
						<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
							lock_open
						</span>
						<input
							id="reset-confirm"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							autoComplete="new-password"
							spellCheck={false}
							className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-10 text-[#292524] transition-colors focus:border-primary focus:outline-none focus:ring-0"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSaving}
					className="w-full rounded-lg bg-accent-pink py-4 font-bold text-white shadow-lg shadow-accent-pink/20 transition-all hover:bg-accent-pink/90 active:scale-[0.98] disabled:opacity-60"
				>
					{isSaving ? (
						<span className="inline-flex items-center justify-center gap-2">
							<LuLoader2 className="animate-spin" size={18} />
							Guardando...
						</span>
					) : (
						'Guardar contraseña'
					)}
				</button>

				<p className="text-center text-sm opacity-60">
					<Link to="/login" className="font-bold text-primary hover:underline">
						Volver a iniciar sesión
					</Link>
				</p>
			</form>
		</main>
	);
};

