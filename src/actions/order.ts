import { OrderInput } from '../interfaces';
import { supabase } from '../supabase/client';

export const createOrder = async (order: OrderInput) => {
	// 1. Obtener el usuario autenticado + Cliente de tabla customer
	const { data, error: errorUser } = await supabase.auth.getUser();

	if (errorUser) {
		console.log(errorUser);
		throw new Error(errorUser.message);
	}

	const userId = data.user.id;

	const { data: customer, error: errorCustomer } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', userId)
		.single();

	if (errorCustomer) {
		console.log(errorCustomer);
		throw new Error(errorCustomer.message);
	}

	const customerId = customer.id;

	// 2. Verificar que haya stock suficiente para cada variante en el carrito
	for (const item of order.cartItems) {
		const { data: variantData, error: variantError } = await supabase
			.from('variants')
			.select('stock')
			.eq('id', item.variantId)
			.single();

		if (variantError) {
			console.log(variantError);
			throw new Error(variantError.message);
		}

		if (variantData.stock < item.quantity) {
			throw new Error(
				'No hay stock suficiente los artículos seleccionados'
			);
		}
	}

	// 3. Guardar la dirección del envío (tabla en BD: andresses, columnas con typo)
	const { data: addressData, error: addressError } = await supabase
		.from('andresses')
		.insert({
			adress_line1: order.address.addressLine1,
			adress_line2: order.address.addressLine2,
			city: order.address.city,
			state: order.address.state,
			posta_code: order.address.postalCode,
			country: order.address.country,
			customer_od: customerId,
		})
		.select()
		.single();

	if (addressError) {
		console.log(addressError);
		throw new Error(addressError.message);
	}

	// 4. Crear la orden (columnas en BD: customers_id, adress_id)
	const { data: orderData, error: orderError } = await supabase
		.from('orders')
		.insert({
			customers_id: customerId,
			adress_id: addressData.id,
			total_amount: order.totalAmount,
			status: 'Pending',
		})
		.select()
		.single();

	if (orderError) {
		console.log(orderError);
		throw new Error(orderError.message);
	}

	// 5. Guardar los detalles de la orden
	const orderItems = order.cartItems.map(item => ({
		order_id: orderData.id,
		variant_id: item.variantId,
		quantity: item.quantity,
		price: item.price,
	}));

	const { error: orderItemsError } = await supabase
		.from('order_items')
		.insert(orderItems);

	if (orderItemsError) {
		console.log(orderItemsError);
		throw new Error(orderItemsError.message);
	}

	// 6. Actualizar el stock de  las variantes
	for (const item of order.cartItems) {
		// Obtener el stock actual
		const { data: variantData } = await supabase
			.from('variants')
			.select('stock')
			.eq('id', item.variantId)
			.single();

		if (!variantData) {
			throw new Error('No se encontró la variante');
		}

		const newStock = variantData.stock - item.quantity;

		const { error: updatedStockError } = await supabase
			.from('variants')
			.update({
				stock: newStock,
			})
			.eq('id', item.variantId);

		if (updatedStockError) {
			console.log(updatedStockError);
			throw new Error(
				`No se pudo actualizar el stock de la variante`
			);
		}
	}

	return orderData;
};

export const getOrdersByCustomerId = async () => {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	const { data: customer, error: customerError } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', data.user.id)
		.single();

	if (customerError) {
		console.log(customerError);
		throw new Error(customerError.message);
	}

	const customerId = customer.id;

	const { data: orders, error: ordersError } = await supabase
		.from('orders')
		.select('id, total_amount, status, created_at')
		.eq('customers_id', customerId)
		.order('created_at', {
			ascending: false,
		});

	if (ordersError) {
		console.log(ordersError);
		throw new Error(ordersError.message);
	}

	return orders;
};

export const getOrderById = async (orderId: number) => {
	const { data, error: errorUser } = await supabase.auth.getUser();

	if (errorUser) {
		console.log(errorUser);
		throw new Error(errorUser.message);
	}

	const { data: customer, error: customerError } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', data.user.id)
		.single();

	if (customerError) {
		console.log(customerError);
		throw new Error(customerError.message);
	}

	const customerId = customer.id;

	const { data: order, error } = await supabase
		.from('orders')
		.select('*')
		.eq('customers_id', customerId)
		.eq('id', orderId)
		.single();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	const { data: orderItems, error: orderItemsError } = await supabase
		.from('order_items')
		.select('id, quantity, price')
		.eq('order_id', orderId);

	if (orderItemsError) {
		console.log(orderItemsError);
		throw new Error(orderItemsError.message);
	}

	return {
		customer: {
			email: (order as any).customer_email ?? '',
			full_name: (order as any).customer_name ?? '',
		},
		totalAmount: order.total_amount,
		status: order.status,
		created_at: order.created_at,
		address: {
			addressLine1: (order as any).address_line1 ?? '',
			addressLine2: (order as any).address_line2 ?? '',
			city: (order as any).city ?? '',
			state: (order as any).state ?? '',
			postalCode: (order as any).postal_code ?? '',
			country: (order as any).country ?? '',
		},
		orderItems:
			orderItems?.map(item => ({
				quantity: item.quantity,
				price: item.price,
				color_name: '',
				storage: '',
				productName: 'Artículo de tu pedido',
				productImage: '',
			})) ?? [],
	};
};

/* ********************************** */
/*            ADMINISTRADOR           */
/* ********************************** */
export const getAllOrders = async () => {
	const { data, error } = await supabase
		.from('orders')
		.select(
			'id, total_amount, status, created_at, customers_id'
		)
		.order('created_at', { ascending: false });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	// Fetch customer details for each order
	const customerIds = [...new Set(data.map(o => o.customers_id))];
	const { data: customers } = await supabase
		.from('customers')
		.select('id, full_name, email')
		.in('id', customerIds);

	const customerMap = new Map(
		(customers ?? []).map(c => [c.id, { full_name: c.full_name, email: c.email }])
	);

	return data.map(order => ({
		id: order.id,
		total_amount: order.total_amount,
		status: order.status,
		created_at: order.created_at,
		customers: customerMap.get(order.customers_id) ?? null,
	}));
};

export const updateOrderStatus = async ({
	id,
	status,
}: {
	id: number;
	status: string;
}) => {
	const { error } = await supabase
		.from('orders')
		.update({ status })
		.eq('id', id);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}
};

export const getOrderByIdAdmin = async (id: number) => {
	const { data: order, error } = await supabase
		.from('orders')
		.select(
			'*, andresses(*), customers(full_name, email), order_items(quantity, price, variants(color_name, storage, products(name, images)))'
		)
		.eq('id', id)
		.single();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	// Cast to any because Supabase generated types are missing Relationships for orders.
	// Fix properly by running: npx supabase gen types typescript --project-id <id> > src/supabase/supabase.ts
	const o = order as any;
	const addr = o?.andresses;
	return {
		customer: {
			email: o?.customers?.email,
			full_name: o?.customers?.full_name,
		},
		totalAmount: o.total_amount,
		status: o.status,
		created_at: o.created_at,
		address: {
			addressLine1: addr?.adress_line1 ?? null,
			addressLine2: addr?.adress_line2 ?? null,
			city: addr?.city ?? null,
			state: addr?.state ?? null,
			postalCode: addr?.posta_code ?? null,
			country: addr?.country ?? null,
		},
		orderItems: (o.order_items ?? []).map((item: any) => ({
			quantity: item.quantity,
			price: item.price,
			color_name: item.variants?.color_name,
			storage: item.variants?.storage,
			productName: item.variants?.products?.name,
			productImage: item.variants?.products?.images[0],
		})),
	};
};
