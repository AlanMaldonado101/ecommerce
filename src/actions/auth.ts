import { supabase } from '../supabase/client';

interface IAuthLogin {
	email: string;
	password: string;
	remember?: boolean;
}

interface IAuthRegister {
	email: string;
	password: string;
	fullName: string;
	phone?: string;
}

const assertStrongPassword = (password: string) => {
	if (password.length < 8) {
		throw new Error('La contraseña debe tener al menos 8 caracteres');
	}
	if (!/[A-Z]/.test(password)) {
		throw new Error('La contraseña debe incluir al menos 1 mayúscula');
	}
	if (!/[^A-Za-z0-9]/.test(password)) {
		throw new Error('La contraseña debe incluir al menos 1 carácter especial');
	}
};

const ensureUserBootstrap = async ({
	userId,
	email,
	fullName,
}: {
	userId: string;
	email: string;
	fullName: string;
}) => {
	// 1) Rol por defecto (si no existe)
	const { data: existingRole, error: roleSelectError } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', userId)
		.maybeSingle();

	if (roleSelectError) {
		console.error('Error leyendo user_roles:', roleSelectError);
		throw new Error('Error al validar el rol del usuario');
	}

	if (!existingRole) {
		const { error: roleInsertError } = await supabase
			.from('user_roles')
			.insert({
				user_id: userId,
				role: 'customer',
			});

		if (roleInsertError) {
			console.error('Error insertando rol:', roleInsertError);
			throw new Error(
				`Error al registrar el rol: ${roleInsertError.message}. Verifica las políticas RLS en la tabla user_roles.`
			);
		}
	}

	// 2) Customer (si no existe)
	const { data: existingCustomer, error: customerSelectError } =
		await supabase
			.from('customers')
			.select('id')
			.eq('user_id', userId)
			.maybeSingle();

	if (customerSelectError) {
		console.error('Error leyendo customers:', customerSelectError);
		throw new Error('Error al validar los datos del usuario');
	}

	if (!existingCustomer) {
		const { error: customerInsertError } = await supabase
			.from('customers')
			.insert({
				user_id: userId,
				full_name: fullName,
				email,
				font: 'default', // requerido por la tabla
			});

		if (customerInsertError) {
			console.error('Error insertando customer:', customerInsertError);
			throw new Error(
				`Error al registrar los datos del usuario: ${customerInsertError.message}. Verifica las políticas RLS en la tabla customers.`
			);
		}
	}
};

export const signUp = async ({
	email,
	password,
	fullName,
	phone,
}: IAuthRegister) => {
	try {
		assertStrongPassword(password);

		// 1. Crear o Registrar usuario
		// Pasamos los datos en metadata para que un trigger pueda usarlos si está configurado
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
					phone: phone || null,
				},
				// Al confirmar el email, redirigir a la pantalla de login
				// (si la sesión viene en la URL, Supabase la detecta y AuthPage redirige a "/")
				emailRedirectTo: `${window.location.origin}/login`,
			},
		});

		if (error) {
			console.error('Error en signUp:', error);
			throw new Error(error.message || 'Error al registrar el usuario');
		}

		const userId = data.user?.id;

		if (!userId) {
			throw new Error('Error al obtener el id del usuario');
		}

		// 2. Verificar si el usuario está autenticado (sesión activa)
		// Si data.session es null, significa que la confirmación de email está activada
		const hasSession = !!data.session;

		if (!hasSession) {
			console.warn('Usuario creado pero requiere confirmación de email. Si tienes un trigger configurado en Supabase, los datos se insertarán automáticamente.');
			// Si hay un trigger configurado, los datos se insertarán automáticamente
			// Si no hay trigger, el usuario deberá confirmar su email primero
			return data;
		}

		// 3. Si hay sesión activa, bootstrapear datos (solo ocurre si confirmación de email está desactivada)
		console.log('Usuario autenticado automáticamente. Verificando bootstrap...');
		await ensureUserBootstrap({ userId, email, fullName });

		return data;
	} catch (error) {
		console.error('Error completo en signUp:', error);
		// Si el error ya es un Error con mensaje, lo lanzamos tal cual
		if (error instanceof Error) {
			throw error;
		}
		throw new Error('Error al registrar el usuario');
	}
};

export const signIn = async ({ email, password }: IAuthLogin) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: email.trim(),
		password,
	});

	if (error) {
		const raw = (error.message || '').toLowerCase();
		console.log(error);

		if (raw.includes('email not confirmed')) {
			throw new Error(
				'Tu correo aún no fue confirmado. Revisa tu email y confirma tu cuenta.'
			);
		}

		if (raw.includes('invalid login credentials')) {
			throw new Error(
				'Credenciales inválidas o correo no confirmado. Verifica tus datos o reenvía el email de confirmación.'
			);
		}

		throw new Error(error.message || 'No se pudo iniciar sesión');
	}

	// Si el usuario fue creado con confirmación por email, es común que falten registros en
	// `user_roles`/`customers` (porque no había sesión al registrarse). Lo corregimos aquí.
	const userId = data.user?.id;
	if (userId) {
		const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
		const fullName =
			(typeof meta.full_name === 'string' && meta.full_name.trim()) ||
			email.split('@')[0] ||
			'Usuario';
		await ensureUserBootstrap({ userId, email, fullName });
	}

	return data;
};

export const resendConfirmationEmail = async (email: string) => {
	const { error } = await supabase.auth.resend({
		type: 'signup',
		email: email.trim(),
	});

	if (error) {
		console.log(error);
		throw new Error(
			error.message || 'No se pudo reenviar el correo de confirmación'
		);
	}
};

export const signInWithGoogle = async () => {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${window.location.origin}/login`,
		},
	});

	if (error) {
		console.log(error);
		throw new Error(
			error.message || 'No se pudo iniciar sesión con Google'
		);
	}

	return data;
};

export const requestPasswordReset = async (email: string) => {
	const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
		redirectTo: `${window.location.origin}/reset-password`,
	});

	if (error) {
		console.log(error);
		throw new Error(
			error.message || 'No se pudo enviar el correo de recuperación'
		);
	}
};

export const updatePassword = async (newPassword: string) => {
	assertStrongPassword(newPassword);
	const { error } = await supabase.auth.updateUser({ password: newPassword });
	if (error) {
		console.log(error);
		throw new Error(error.message || 'No se pudo actualizar la contraseña');
	}
};

export const signOut = async () => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.log(error);
		throw new Error('Error al cerrar sesión');
	}
};

export const getSession = async () => {
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		console.log(error);
		throw new Error('Error al obtener la sesión');
	}

	return data;
};

export const getUserData = async (userId: string) => {
	const { data, error } = await supabase
		.from('customers')
		.select('*')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		console.log(error);
		throw new Error('Error al obtener los datos del usuario');
	}

	return data;
};

export const getUserRole = async (userId: string) => {
	const { data, error } = await supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', userId)
		.single();

	if (error) {
		console.log(error);
		throw new Error('Error al obtener el rol del usuario');
	}

	return data.role;
};
