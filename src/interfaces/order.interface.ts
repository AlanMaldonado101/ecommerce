export interface OrderInput {
	address: {
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		postalCode?: string;
		country: string;
	};
	cartItems: {
		variantId: string;
		quantity: number;
		price: number;
	}[];
	totalAmount: number;
}

export interface OrderItemSingle {
	created_at: string;
	id: number;
	status: string;
	total_amount: number;
}

export interface OrderWithCustomer {
	id: number;
	status: string;
	total_amount: number;
	created_at: string;
	customers: {
		full_name: string;
		email: string;
	} | null;
}

export interface MercadoPagoOrder {
	id: string;
	order_number: string;
	buyer_id: string;
	buyer_data: {
		name: string;
		email: string;
		phone: string;
		address: {
			street: string;
			number: string;
			zipCode: string;
			city: string;
			state: string;
		};
	};
	items: Array<{
		variant_id: string;
		quantity: number;
		unit_price: number;
		name: string;
		image: string;
	}>;
	total_amount: number;
	status: string;
	payment_method: string;
	created_at: string;
	paid_at: string | null;
}
