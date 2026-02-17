import { Color, Product, VariantProduct } from '../interfaces';

// Función para formatear el precio a dólares
export const formatPrice = (price: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price);
};

// Función para preparar los productos
export const prepareProducts = (products: Product[]) => {
	return products.map(product => {
		// Agrupar las variantes por color
		const colors = product.variants.reduce(
			(acc: Color[], variant: VariantProduct) => {
				const existingColor = acc.find(
					item => item.color === variant.color
				);

				if (existingColor) {
					// Si ya existe el color, comparamos los precios
					existingColor.price = Math.min(
						existingColor.price,
						variant.price
					);
				} // Mantenemos el precio mínimo
				else {
					acc.push({
						color: variant.color,
						price: variant.price,
						name: variant.color_name,
					});
				}

				return acc;
			},
			[]
		);

		// Obtener el precio más bajo de las variantes agrupadas
		const price = Math.min(...colors.map(item => item.price));

		// Devolver el producto formateado
		return {
			...product,
			price,
			colors: colors.map(({ name, color }) => ({ name, color })),
			variants: product.variants,
		};
	});
};

// Función para formatear la fecha a formato 3 de enero de 2022
export const formatDateLong = (date: string): string => {
	const dateObject = new Date(date);

	return dateObject.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

// Función para formatear la fecha a formato corto (Oct 24, 2023)
export const formatDateShort = (date: string): string => {
	const dateObject = new Date(date);
	return dateObject.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

// Función para formatear la fecha a formato dd/mm/yyyy
export const formatDate = (date: string): string => {
	const dateObject = new Date(date);
	return dateObject.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: '2-digit',
		day: 'numeric',
	});
};

// Función para obtener el estado del pedido en español
export const getStatus = (status: string): string => {
	switch (status) {
		case 'Pending':
			return 'Pendiente';
		case 'Paid':
			return 'Pagado';
		case 'Shipped':
			return 'Enviado';
		case 'Delivered':
			return 'Entregado';
		default:
			return status;
	}
};

// Clase CSS para el badge de estado
export const getStatusBadgeClass = (status: string): string => {
	switch (status) {
		case 'Delivered':
			return 'bg-emerald-100 text-emerald-700';
		case 'Shipped':
			return 'bg-blue-100 text-blue-700';
		case 'Paid':
			return 'bg-amber-100 text-amber-700';
		case 'Pending':
		default:
			return 'bg-amber-100 text-amber-700';
	}
};

// Función para formatear el ID del pedido
export const formatOrderId = (id: number): string => {
	return `#COT-${String(id).padStart(4, '0')}`;
};

// Función para generar el slug de un producto
export const generateSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
};

// Función para extraer el path relativo al bucket de una URL
export const extractFilePath = (url: string) => {
	const parts = url.split(
		'/storage/v1/object/public/product-images/'
	);
	// EJEMPLO PARTS: ['/storage/v1/ object/public/product-images/', '02930920302302030293023-iphone-12-pro-max.jpg']

	if (parts.length !== 2) {
		throw new Error(`URL de imagen no válida: ${url}`);
	}

	return parts[1];
};
