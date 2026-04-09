import { useForm } from 'react-hook-form';
import { InputAddress } from './InputAddress';
import {
	AddressFormValues,
	addressSchema,
} from '../../lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { ItemsCheckout } from './ItemsCheckout';
import { useUser } from '../../hooks/auth/useUser';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';
import { useState } from 'react';
import { useProcessPayment } from '../../hooks/payments/useProcessPayment';
import { useCartStore } from '../../store/cart.store';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';

export const FormCheckout = () => {
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<AddressFormValues>({
		resolver: zodResolver(addressSchema),
	});

	const [addressData, setAddressData] = useState<AddressFormValues | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('webpay');
	const { session } = useUser();
	const navigate = useNavigate();

	const cartItems = useCartStore(state => state.items);
	const totalAmount = useCartStore(state => state.totalAmount);
	const cleanCart = useCartStore(state => state.cleanCart);

	const { mutate: processPayment, isPending: isProcessingPayment } = useProcessPayment();

	const onSubmit = handleSubmit(data => {
		setAddressData(data);
	});

	const buyerData = addressData
		? {
			name: session?.user?.user_metadata?.full_name || '',
			email: session?.user?.email || '',
			phone: session?.user?.user_metadata?.phone || '',
			address: {
				street: addressData.addressLine1,
				number: addressData.addressLine2 || '',
				zipCode: addressData.postalCode || '',
				city: addressData.city,
				state: addressData.state,
			},
		}
		: null;

	const handlePayment = () => {
		if (!session?.user) {
			navigate('/login');
			return;
		}

		if (!buyerData) return;

		const items = cartItems.map(item => ({
			variantId: item.variantId,
			quantity: item.quantity,
			price: item.price,
			name: item.name,
			image: item.image,
		}));

		processPayment(
			{ items, totalAmount, buyerData, paymentMethod },
			{
				onSuccess: data => {
					cleanCart();
					if (paymentMethod === 'webpay') {
						if (!data.webpayUrl || !data.webpayToken) return;
						// Crear un formulario invisible y enviarlo vía POST a la URL de Transbank
						const form = document.createElement('form');
						form.method = 'POST';
						form.action = data.webpayUrl;
						
						const tokenInput = document.createElement('input');
						tokenInput.type = 'hidden';
						tokenInput.name = 'token_ws';
						tokenInput.value = data.webpayToken;
						
						form.appendChild(tokenInput);
						document.body.appendChild(form);
						form.submit();
					} else {
						// MercadoPago redirige directo al initPoint vía GET
						if (data.initPoint) window.location.href = data.initPoint;
					}
				},
				onError: error => {
					console.error('Error procesando pago:', error);
				},
			}
		);
	};

	return (
		<div className='glass-card p-6 md:p-8'>
			<div className='flex flex-col gap-8'>
				<form className='flex flex-col gap-8' onSubmit={onSubmit}>
					<div className='flex flex-col gap-4'>
						<div>
							<p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]'>
								1. Información de envío
							</p>
							<h3 className='mt-1 text-xl font-semibold text-[#292524]'>
								Datos de entrega
							</h3>
						</div>

						<InputAddress
							register={register}
							errors={errors}
							name='addressLine1'
							placeholder='Dirección principal'
						/>

						<InputAddress
							register={register}
							errors={errors}
							name='addressLine2'
							placeholder='Dirección adicional (Opcional)'
						/>

						<InputAddress
							register={register}
							errors={errors}
							name='state'
							placeholder='Estado / Provincia'
						/>

						<InputAddress
							register={register}
							errors={errors}
							name='city'
							placeholder='Ciudad'
						/>

						<InputAddress
							register={register}
							errors={errors}
							name='postalCode'
							placeholder='Código Postal (Opcional)'
						/>

						<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
							<select
								className='soft-input w-full px-3 py-2 text-sm text-[#292524] focus:outline-none'
								{...register('country')}
							>
								<option value='Chile'>Chile</option>
							</select>
							<div className='flex items-center justify-end text-[11px] text-[#64748b]'>
								<span>Solo envíos nacionales por ahora</span>
							</div>
						</div>
					</div>

					<div className='flex flex-col gap-4'>
						<p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]'>
							2. Método de envío
						</p>

						<div className='flex items-center justify-between rounded-2xl border border-[#DCD6F7] bg-[#fdf6fd] px-6 py-4 text-sm text-[#292524]'>
							<div>
								<p className='font-semibold'>Envío estándar</p>
								<p className='text-xs text-[#64748b]'>
									Entrega estimada en 3 - 5 días hábiles
								</p>
							</div>
							<span className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#64748b]'>
								GRATIS
							</span>
						</div>
					</div>

					{!addressData && (
						<button
							type='submit'
							className='btn-primary mt-2 w-full justify-center text-center'
						>
							Continuar al pago
						</button>
					)}
				</form>

				{/* Payment section - OUTSIDE the form to avoid nesting */}
				{addressData && buyerData && (
					<div className='flex flex-col gap-5 rounded-2xl bg-white/90 p-5'>
						<PaymentMethodSelector
							selectedMethod={paymentMethod}
							onMethodChange={setPaymentMethod}
						/>

						{isProcessingPayment ? (
							<div className='flex flex-col items-center justify-center gap-3 py-6'>
								<ImSpinner2 className='h-8 w-8 animate-spin text-[#424874]' />
								<p className='text-sm font-medium text-[#64748b]'>
									Procesando tu pago...
								</p>
							</div>
						) : (
							<button
								type='button'
								onClick={handlePayment}
								className='btn-primary mt-4 w-full justify-center text-center'
							>
								{paymentMethod === 'webpay' ? 'Pagar con Webpay' : 'Pagar con MercadoPago'}
							</button>
						)}

						{paymentMethod === 'checkout_pro' && (
							<div className='rounded-lg bg-blue-50 border border-blue-200 p-4 mt-2'>
								<p className='text-xs text-blue-800'>
									<strong>Nota:</strong> Serás redirigido a Mercado Pago donde podrás pagar con tarjeta, efectivo o dinero en cuenta.
								</p>
							</div>
						)}
					</div>
				)}

				<div className='flex flex-col gap-6'>
					<h3 className='text-xl font-semibold text-[#292524]'>
						Resumen del pedido
					</h3>

					<ItemsCheckout />
				</div>
			</div>
		</div>
	);
};
