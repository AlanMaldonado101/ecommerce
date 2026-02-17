import { JSONContent } from '@tiptap/react';
import { Json } from '../supabase/supabase';

export interface Color {
	name: string;
	color: string;
	price: number;
}

export interface VariantProduct {
	id: string;
	stock: number;
	price: number;
	price_wholesale?: number;
	storage: string;
	color: string;
	color_name: string;
}

export interface Subcategory {
	id: string;
	name: string;
	slug: string;
	category_id?: string;
}

export interface Provider {
	id: string;
	name: string;
	contact_info?: string;
}

export interface Occasion {
	id: string;
	name: string;
	slug: string;
}

export interface Product {
	id: string;
	name: string;
	category: string;
	subcategory_id: string | null;
	provider_id: string | null;
	tags: string[] | null;
	slug: string;
	features: Json;
	description: Json;
	images: string[];
	created_at: string;
	variants: VariantProduct[];
	product_occasions?: {
		occasion: Occasion;
	}[];
}

export interface PreparedProducts {
	id: string;
	name: string;
	category: string;
	subcategory_id: string | null;
	provider_id: string | null;
	tags: string[] | null;
	slug: string;
	features: Json;
	description: Json;
	images: string[];
	created_at: string;
	price: number;
	colors: {
		name: string;
		color: string;
	}[];
	variants: VariantProduct[];
}

export interface ProductInput {
	name: string;
	category: string;
	subcategory_id?: string;
	provider_id?: string;
	tags?: string[];
	occasion_ids?: string[];
	slug: string;
	features: string[];
	description: JSONContent;
	images: File[];
	variants: VariantInput[];
}

export interface VariantInput {
	id?: string;
	stock: number;
	price: number;
	priceWholesale: number;
	color: string;
	storage: string;
	colorName: string;
}
