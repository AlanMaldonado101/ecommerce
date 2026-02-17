import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../actions';
import { LuLoader2 } from 'react-icons/lu';

export const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [isSending, setIsSending] = useState(false);

	return (
		<main className="w-full max-w-xl rounded-xl border border-primary/20 bg-white p-8 shadow-2xl">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Recuperar contraseña</h1>
				<p className="mt-1 text-sm opacity-70">
					Te enviaremos un link para crear una nueva contraseña.
				</p>
			</div>

			<form
				className="space-y-5"
				onSubmit={async e => {
					e.preventDefault();
					const cleaned = email.trim();
					if (!cleaned) {
						toast.error('Ingresa tu correo electrónico', {
							position: 'bottom-right',
						});
						return;
					}

					try {
						setIsSending(true);
						await requestPasswordReset(cleaned);
						toast.success(
							'Revisa tu correo (y spam) para recuperar tu contraseña.',
							{ position: 'bottom-right' }
						);
					} catch (err) {
						toast.error(
							err instanceof Error
								? err.message
								: 'No se pudo enviar el correo',
							{ position: 'bottom-right' }
						);
					} finally {
						setIsSending(false);
					}
				}}
			>
				<div className="space-y-2">
					<label htmlFor="forgot-email" className="ml-1 text-sm font-semibold">
						Correo electrónico
					</label>
					<div className="relative">
						<span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">
							mail_outline
						</span>
						<input
							id="forgot-email"
							type="email"
							placeholder="hola@ejemplo.com"
							value={email}
							onChange={e => setEmail(e.target.value)}
							autoComplete="email"
							className="w-full rounded-lg border-2 border-primary/30 bg-white py-3 pl-10 pr-4 text-[#292524] transition-colors focus:border-primary focus:outline-none focus:ring-0"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSending}
					className="w-full rounded-lg bg-accent-pink py-4 font-bold text-white shadow-lg shadow-accent-pink/20 transition-all hover:bg-accent-pink/90 active:scale-[0.98] disabled:opacity-60"
				>
					{isSending ? (
						<span className="inline-flex items-center justify-center gap-2">
							<LuLoader2 className="animate-spin" size={18} />
							Enviando...
						</span>
					) : (
						'Enviar link'
					)}
				</button>

				<p className="text-center text-sm opacity-60">
					¿Ya la recordaste?{' '}
					<Link to="/login" className="font-bold text-primary hover:underline">
						Volver a iniciar sesión
					</Link>
				</p>
			</form>
		</main>
	);
};

