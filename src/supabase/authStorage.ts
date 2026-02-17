type AuthStorageMode = 'local' | 'session';

const MODE_KEY = 'jireh_auth_storage_mode';
const AUTH_KEY = 'jireh-auth';
const REMEMBER_UNTIL_KEY = 'jireh_auth_remember_until_ms';

const getMode = (): AuthStorageMode => {
	try {
		const v = localStorage.getItem(MODE_KEY);
		return v === 'session' ? 'session' : 'local';
	} catch {
		return 'local';
	}
};

const read = (mode: AuthStorageMode, key: string) =>
	mode === 'local'
		? localStorage.getItem(key)
		: sessionStorage.getItem(key);

const write = (mode: AuthStorageMode, key: string, value: string) => {
	if (mode === 'local') localStorage.setItem(key, value);
	else sessionStorage.setItem(key, value);
};

const removeEverywhere = (key: string) => {
	try {
		localStorage.removeItem(key);
	} catch {
		// ignore
	}
	try {
		sessionStorage.removeItem(key);
	} catch {
		// ignore
	}
};

export const authStorage = {
	getItem: (key: string) => {
		const mode = getMode();
		return read(mode, key);
	},
	setItem: (key: string, value: string) => {
		const mode = getMode();
		write(mode, key, value);
	},
	removeItem: (key: string) => {
		removeEverywhere(key);
	},
};

export const setAuthStorageMode = (mode: AuthStorageMode) => {
	try {
		localStorage.setItem(MODE_KEY, mode);
	} catch {
		// ignore
	}

	// Migrar sesión existente si corresponde (clave fija AUTH_KEY)
	const from: AuthStorageMode = mode === 'local' ? 'session' : 'local';
	try {
		const existing = read(from, AUTH_KEY);
		if (existing) {
			write(mode, AUTH_KEY, existing);
		}
	} catch {
		// ignore
	}

	// Si pasamos a session, no queremos expiración persistente
	if (mode === 'session') {
		removeEverywhere(REMEMBER_UNTIL_KEY);
	}
};

export const setRememberForDays = (days: number) => {
	const mode = getMode();
	if (mode !== 'local') return;

	const until = Date.now() + days * 24 * 60 * 60 * 1000;
	try {
		localStorage.setItem(REMEMBER_UNTIL_KEY, String(until));
	} catch {
		// ignore
	}
};

export const isRememberExpired = () => {
	const mode = getMode();
	if (mode !== 'local') return false;

	try {
		const v = localStorage.getItem(REMEMBER_UNTIL_KEY);
		if (!v) return false;
		const until = Number(v);
		if (!Number.isFinite(until)) return false;
		return Date.now() > until;
	} catch {
		return false;
	}
};

export const clearRemember = () => {
	removeEverywhere(REMEMBER_UNTIL_KEY);
};

export const AUTH_STORAGE_KEY = AUTH_KEY;

