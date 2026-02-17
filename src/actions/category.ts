import { supabase } from '../supabase/client';

export interface Category {
	id: string;
	name: string;
	slug: string;
	created_at?: string;
}

export const getCategories = async (): Promise<Category[]> => {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.order('name', { ascending: true });

	if (error) {
		console.error(error);
		throw new Error(error.message);
	}

	return data ?? [];
};

export const createCategory = async (name: string): Promise<Category> => {
	const slug = name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // quitar acentos
		.replace(/ñ/g, 'n')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const { data, error } = await supabase
		.from('categories')
		.insert({ name: name.trim(), slug })
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('Ya existe una categoría con ese nombre');
		}
		throw new Error(error.message);
	}

	return data;
};
