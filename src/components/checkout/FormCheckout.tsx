import { useForm } from 'react-hook-form';
import { InputAddress } from './InputAddress';
import {
	AddressFormValues,
	addressSchema,
} from '../../lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { ItemsCheckout } from './ItemsCheckout';
import { useCartStore } from '../../store/cart.store';
import { useUser } from '../../hooks/auth/useUser';
import { MercadoPagoCheckout } from './MercadoPagoCheckout';
import { useState } from 'react';

export const FormCheckout = () => {
	const {
		register,
		formState: { errors },
		handleSubmit,
		watch,
	} = useForm<AddressFormValues>({
		resolver: zodResolver(addressSchema),
	});

	const [addressData, setAddressData] = useState<AddressFormValues | null>(null);
	const { session } = useUser();

	const onSubmit = handleSubmit(data => {
		setAddressData(data);
	});

	return (
		<div className='glass-card p-6 md:p-8'>
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

				<div className='flex flex-col gap-3 rounded-2xl bg-white/90 p-5 text-[13px] text-[#64748b]'>
					{!addressData ? (
						<>
							<p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]'>
								3. Método de pago
							</p>
							<p className='text-sm text-[#292524]'>
								Completa la información de envío para continuar con el pago
							</p>
						</>
					) : (
						<MercadoPagoCheckout
							buyerData={{
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
							}}
						/>
					)}
				</div>

				<div className='flex flex-col gap-6'>
					<h3 className='text-xl font-semibold text-[#292524]'>
						Resumen del pedido
					</h3>

					<ItemsCheckout />
				</div>

				<button
					type='submit'
					className='btn-primary mt-2 w-full justify-center text-center'
					disabled={!!addressData}
				>
					{addressData ? 'Información de envío completada' : 'Continuar al pago'}
				</button>
			</form>
		</div>
	);
};
