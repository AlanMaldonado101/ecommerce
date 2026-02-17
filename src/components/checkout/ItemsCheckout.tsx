import { formatPrice } from '../../helpers';
import { useCartStore } from '../../store/cart.store';

export const ItemsCheckout = () => {
	const cartItems = useCartStore(state => state.items);
	const totalAmount = useCartStore(state => state.totalAmount);

	return (
		<div>
			<ul className='space-y-5'>
				{cartItems.map(item => (
					<li
						key={item.variantId}
						className='flex items-center justify-between gap-5'
					>
						<div className='relative flex rounded-2xl border border-[#DCD6F7] bg-[#fdf6fd]'>
							<img
								src={item.image}
								alt={item.name}
								className='h-20 w-20 object-contain'
							/>
							<span className='absolute -right-1 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#424874] text-xs font-semibold text-white'>
								{item.quantity}
							</span>
						</div>

						<div className='flex-1 space-y-2'>
							<div className='flex justify-between'>
								<p className='text-sm font-semibold text-[#292524]'>
									{item.name}
								</p>
								<p className='mt-1 text-sm font-semibold text-[#64748b]'>
									{formatPrice(item.price)}
								</p>
							</div>
							<div className='flex gap-3'>
								<p className='text-[12px] text-[#64748b]'>
									{item.storage} /{item.color}
								</p>
							</div>
						</div>
					</li>
				))}
			</ul>

			<div className='mt-6 space-y-3 rounded-2xl bg-white/90 p-6 text-sm text-[#64748b] shadow-inner'>
				<div className='flex justify-between'>
					<p>Subtotal</p>
					<p>{formatPrice(totalAmount)}</p>
				</div>
				<div className='flex justify-between'>
					<p>Envío</p>
					<p className='font-medium uppercase text-[#64748b]'>
						Gratis
					</p>
				</div>
				<div className='flex justify-between pt-3 text-base font-semibold text-[#292524]'>
					<p>Total</p>
					<p>{formatPrice(totalAmount)}</p>
				</div>
			</div>
		</div>
	);
};
