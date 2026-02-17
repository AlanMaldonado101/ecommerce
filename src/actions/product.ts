import { extractFilePath } from '../helpers';
import { ProductInput } from '../interfaces';
import { supabase } from '../supabase/client';

export const getProducts = async (page: number) => {
	const itemsPerPage = 10;
	const from = (page - 1) * itemsPerPage;
	const to = from + itemsPerPage - 1;

	const {
		data: products,
		error,
		count,
	} = await supabase
		.from('products')
		.select('*, variants(*)', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return { products, count };
};

export const getFilteredProducts = async ({
	page = 1,
	categories = [],
}: {
	page: number;
	categories: string[];
}) => {
	const itemsPerPage = 10;
	const from = (page - 1) * itemsPerPage;
	const to = from + itemsPerPage - 1;

	let query = supabase
		.from('products')
		.select('*, variants(*)', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (categories.length > 0) {
		query = query.in('category', categories);
	}

	const { data, error, count } = await query;

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return { data, count };
};

export const getRecentProducts = async () => {
	const { data: products, error } = await supabase
		.from('products')
		.select('*, variants(*)')
		.order('created_at', { ascending: false })
		.limit(4);

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return products;
};

export const getRandomProducts = async () => {
	const { data: products, error } = await supabase
		.from('products')
		.select('*, variants(*)')
		.limit(20);

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	// Seleccionar 4 productos al azar
	const randomProducts = products
		.sort(() => 0.5 - Math.random())
		.slice(0, 4);

	return randomProducts;
};

export const getProductBySlug = async (slug: string) => {
	if (!slug?.trim()) {
		return null;
	}

	const { data, error } = await supabase
		.from('products')
		.select(
			'*, variants(*), product_occasions(occasion:occasions(name, slug, id))'
		)
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return data;
};

export const searchProducts = async (searchTerm: string) => {
	const { data, error } = await supabase
		.from('products')
		.select('*, variants(*)')
		.ilike('name', `%${searchTerm}%`); //Buscar productos cuyo nombre contenga el término de búsqueda

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return data;
};

/* ********************************** */
/*            ADMINISTRADOR           */
/* ********************************** */
export const createProduct = async (productInput: ProductInput) => {
	try {
		// 1. Crear el producto para obtener el ID
		const { data: product, error: productError } = await supabase
			.from('products')
			.insert({
				name: productInput.name,
				category: productInput.category,
				subcategory_id: productInput.subcategory_id,
				provider_id: productInput.provider_id,
				tags: productInput.tags ?? [],
				slug: productInput.slug,
				feature: productInput.features ?? [],
				features: productInput.features ?? [],
				description: productInput.description,
				images: [],
			})
			.select()
			.single();

		if (productError) throw new Error(productError.message);

		// 2. Subir las imágenes al bucket dentro de una carpeta que se creará a partir del producto
		const folderName = product.id;

		const uploadedImages = await Promise.all(
			productInput.images.map(async image => {
				const { data, error } = await supabase.storage
					.from('product-images')
					.upload(`${folderName}/${product.id}-${image.name}`, image);

				if (error) throw new Error(error.message);

				const imageUrl = `${supabase.storage
					.from('product-images')
					.getPublicUrl(data.path).data.publicUrl
					}`;

				return imageUrl;
			})
		);

		// 3. Actualizar el producto con las imágenes subidas
		const { error: updatedError } = await supabase
			.from('products')
			.update({
				images: uploadedImages,
			})
			.eq('id', product.id);

		if (updatedError) throw new Error(updatedError.message);

		// 4. Crear las variantes del producto
		const variants = productInput.variants.map(variant => ({
			product_id: product.id,
			stock: variant.stock,
			price: variant.price,
			price_wholesale: variant.priceWholesale ?? 0,
			storage: variant.storage,
			color: variant.color,
			color_name: variant.colorName,
		}));

		const { error: variantsError } = await supabase
			.from('variants')
			.insert(variants);

		if (variantsError) throw new Error(variantsError.message);

		// 5. Vincular ocasiones (tags de ocasión)
		if (productInput.occasion_ids && productInput.occasion_ids.length > 0) {
			const occasionInserts = productInput.occasion_ids.map(
				occasionId => ({
					product_id: product.id,
					occasion_id: occasionId,
				})
			);

			const { error: occasionError } = await supabase
				.from('product_occasions')
				.insert(occasionInserts);

			if (occasionError) throw new Error(occasionError.message);
		}

		return product;
	} catch (error) {
		console.log(error);
		throw new Error('Error inesperado, Vuelva a intentarlo');
	}
};

export const deleteProduct = async (productId: string) => {
	// 1. Eliminar las variantes del producto
	const { error: variantsError } = await supabase
		.from('variants')
		.delete()
		.eq('product_id', productId);

	if (variantsError) throw new Error(variantsError.message);

	// 2. Obtener las imágenes del producto antes de eliminarlo
	const { data: productImages, error: productImagesError } =
		await supabase
			.from('products')
			.select('images')
			.eq('id', productId)
			.single();

	if (productImagesError) throw new Error(productImagesError.message);

	// 3. Eliminar el producto
	const { error: productDeleteError } = await supabase
		.from('products')
		.delete()
		.eq('id', productId);

	if (productDeleteError) throw new Error(productDeleteError.message);

	// 4. Eliminar las imágenes del bucket
	if (productImages.images.length > 0) {
		const folderName = productId;

		const paths = productImages.images.map(image => {
			const fileName = image.split('/').pop();
			return `${folderName}/${fileName}`;
		});

		const { error: storageError } = await supabase.storage
			.from('product-images')
			.remove(paths);

		if (storageError) throw new Error(storageError.message);
	}

	return true;
};

export const updateProduct = async (
	productId: string,
	productInput: ProductInput
) => {
	// 1. Obtener las imágenes actuales del producto
	const { data: currentProduct, error: currentProductError } =
		await supabase
			.from('products')
			.select('images')
			.eq('id', productId)
			.single();

	if (currentProductError)
		throw new Error(currentProductError.message);

	const existingImages = currentProduct.images || [];

	// 2. Actualizar la información individual del producto
	const { data: updatedProduct, error: productError } = await supabase
		.from('products')
		.update({
			name: productInput.name,
			category: productInput.category,
			subcategory_id: productInput.subcategory_id,
			provider_id: productInput.provider_id,
			tags: productInput.tags ?? [],
			slug: productInput.slug,
			feature: productInput.features ?? [],
			features: productInput.features ?? [],
			description: productInput.description,
		})
		.eq('id', productId)
		.select()
		.single();

	if (productError) throw new Error(productError.message);

	// 2.5 Sincronizar Ocasiones (Eliminar existentes y crear nuevas)
	if (productInput.occasion_ids) {
		// Eliminar relaciones existentes
		const { error: deleteOccasionsError } = await supabase
			.from('product_occasions')
			.delete()
			.eq('product_id', productId);

		if (deleteOccasionsError) throw new Error(deleteOccasionsError.message);

		// Insertar nuevas relaciones si hay alguna
		if (productInput.occasion_ids.length > 0) {
			const occasionInserts = productInput.occasion_ids.map(
				occasionId => ({
					product_id: productId,
					occasion_id: occasionId,
				})
			);

			const { error: insertOccasionsError } = await supabase
				.from('product_occasions')
				.insert(occasionInserts);

			if (insertOccasionsError)
				throw new Error(insertOccasionsError.message);
		}
	}

	// 3. Manejo de imágenes (SUBIR NUEVAS y ELIMINAR ANTIGUAS SI ES NECESARIO)
	const folderName = productId;

	const validImages = productInput.images.filter(image => image) as [
		File | string
	];

	// 3.1 Identificar las imágenes que han sido eliminadas
	const imagesToDelete = existingImages.filter(
		image => !validImages.includes(image)
	);

	// 3.2 Obtener los paths de los archivos a eliminar
	const filesToDelete = imagesToDelete.map(extractFilePath);

	// 3.3 Eliminar las imágenes del bucket
	if (filesToDelete.length > 0) {
		const { error: deleteImagesError } = await supabase.storage
			.from('product-images')
			.remove(filesToDelete);

		if (deleteImagesError) {
			console.log(deleteImagesError);
			throw new Error(deleteImagesError.message);
		} else {
			console.log(`Imagenes eliminadas: ${filesToDelete.join(', ')}`);
		}
	}

	// 3.4 Subir las nuevas imágenes y construir el array de imágenes actualizado
	const uploadedImages = await Promise.all(
		validImages.map(async image => {
			if (image instanceof File) {
				// Si la imagen no es una URL (es un archivo), entonces subela al bucket
				const { data, error } = await supabase.storage
					.from('product-images')
					.upload(`${folderName}/${productId}-${image.name}`, image);

				if (error) throw new Error(error.message);

				const imageUrl = supabase.storage
					.from('product-images')
					.getPublicUrl(data.path).data.publicUrl;

				return imageUrl;
			} else if (typeof image === 'string') {
				return image;
			} else {
				throw new Error('Tipo de imagen no soportado');
			}
		})
	);

	// 4. Actualizar el productos con las imagenes actualizadas
	const { error: updateImagesError } = await supabase
		.from('products')
		.update({ images: uploadedImages })
		.eq('id', productId);

	if (updateImagesError) throw new Error(updateImagesError.message);

	// 5. Actualizar las variantes del producto
	const existingVariants = productInput.variants.filter(v => v.id);
	const newVariants = productInput.variants.filter(v => !v.id);

	// 5.1 Modificar las variantes existentes
	if (existingVariants.length > 0) {
		const { error: updateVariantsError } = await supabase
			.from('variants')
			.upsert(
				existingVariants.map(variant => ({
					id: variant.id,
					product_id: productId,
					stock: variant.stock,
					price: variant.price,
					price_wholesale: variant.priceWholesale ?? 0,
					storage: variant.storage,
					color: variant.color,
					color_name: variant.colorName,
				})),
				{
					onConflict: 'id',
				}
			);

		if (updateVariantsError)
			throw new Error(updateVariantsError.message);
	}

	// 5.2 Crear y guardar las nuevas variantes
	let newVariantIds: string[] = [];

	if (newVariants.length > 0) {
		const { data, error: insertVariantsError } = await supabase
			.from('variants')
			.insert(
				newVariants.map(variant => ({
					product_id: productId,
					stock: variant.stock,
					price: variant.price,
					price_wholesale: variant.priceWholesale ?? 0,
					storage: variant.storage,
					color: variant.color,
					color_name: variant.colorName,
				}))
			)
			.select();

		if (insertVariantsError)
			throw new Error(insertVariantsError.message);

		newVariantIds = data.map(variant => variant.id);
	}

	// 5.3 Combinar los IDs de las variantes existentes y las nuevas
	const currentVariantIds = [
		...existingVariants.map(v => v.id),
		...newVariantIds,
	];

	// 5.4 Eliminar las variantes que no están en la lista de IDs
	const { error: deleteVariantsError } = await supabase
		.from('variants')
		.delete()
		.eq('product_id', productId)
		.not(
			'id',
			'in',
			`(${currentVariantIds ? currentVariantIds.join(',') : 0})` // (UIWE2030230-2230000, UIWE2030230-2230001, ...)
		);

	if (deleteVariantsError)
		throw new Error(deleteVariantsError.message);

	return updatedProduct;
};

export const getSubcategories = async () => {
	const { data, error } = await supabase
		.from('subcategories')
		.select('*')
		.order('name');

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return data;
};

export const getProviders = async () => {
	const { data, error } = await supabase
		.from('providers')
		.select('*')
		.order('name');

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return data;
};

export const getOccasions = async () => {
	const { data, error } = await supabase
		.from('occasions')
		.select('*')
		.order('name');

	if (error) {
		console.log(error.message);
		throw new Error(error.message);
	}

	return data;
};

export const createSubcategory = async (
	name: string,
	categoryId?: string
) => {
	const slug = name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/ñ/g, 'n')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const { data, error } = await supabase
		.from('subcategories')
		.insert({ name: name.trim(), slug, category_id: categoryId ?? null })
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('Ya existe una subcategoría con ese nombre');
		}
		throw new Error(error.message);
	}

	return data;
};

export const createOccasion = async (name: string) => {
	const slug = name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/ñ/g, 'n')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const { data, error } = await supabase
		.from('occasions')
		.insert({ name: name.trim(), slug })
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('Ya existe una ocasión con ese nombre');
		}
		throw new Error(error.message);
	}

	return data;
};
