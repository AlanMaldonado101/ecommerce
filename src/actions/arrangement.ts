/**
 * Acciones de Supabase para componentes de arreglos personalizados
 * 
 * Este archivo contiene las funciones para consultar componentes del sistema
 * "Arma tu Arreglo" desde la base de datos.
 */

import { ComponentCategory, ComponentItem } from '../interfaces/arrangement.interface';
import { supabase } from '../supabase/client';

/**
 * Obtiene todos los componentes de arreglos
 * Filtra por category = 'componente-arreglo'
 * Ordena por component_order ascendente
 * 
 * @returns Array de componentes ordenados
 * @throws Error si la consulta falla
 */
export const getArrangementComponents = async (): Promise<ComponentItem[]> => {
	const { data, error } = await supabase
		.from('products')
		.select('id, name, component_category, component_order, images, variants(price)')
		.eq('category', 'componente-arreglo')
		.order('component_order', { ascending: true });

	if (error) {
		console.error('Error al cargar componentes de arreglo:', error.message);
		throw new Error(error.message);
	}

	// Transformar los datos de productos a ComponentItem
	const components: ComponentItem[] = data.map(product => ({
		id: product.id,
		name: product.name,
		category: product.component_category as ComponentCategory,
		price: product.variants?.[0]?.price ?? 0,
		image: product.images?.[0] ?? '',
		order: product.component_order ?? 0,
	}));

	return components;
};

/**
 * Obtiene componentes filtrados por categoría específica
 * Filtra por category = 'componente-arreglo' y component_category
 * Ordena por component_order ascendente
 * 
 * @param category - Categoría de componente a filtrar (BASE, FLORES, GLOBOS, EXTRAS)
 * @returns Array de componentes de la categoría especificada
 * @throws Error si la consulta falla
 */
export const getArrangementComponentsByCategory = async (
	category: ComponentCategory
): Promise<ComponentItem[]> => {
	const { data, error } = await supabase
		.from('products')
		.select('id, name, component_category, component_order, images, variants(price)')
		.eq('category', 'componente-arreglo')
		.eq('component_category', category)
		.order('component_order', { ascending: true });

	if (error) {
		console.error(`Error al cargar componentes de categoría ${category}:`, error.message);
		throw new Error(error.message);
	}

	// Transformar los datos de productos a ComponentItem
	const components: ComponentItem[] = data.map(product => ({
		id: product.id,
		name: product.name,
		category: product.component_category as ComponentCategory,
		price: product.variants?.[0]?.price ?? 0,
		image: product.images?.[0] ?? '',
		order: product.component_order ?? 0,
	}));

	return components;
};
