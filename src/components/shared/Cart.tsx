import { HiOutlineShoppingBag } from 'react-icons/hi';
import { useGlobalStore } from '../../store/global.store';
import { IoMdClose } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { CartItem, type ICartItem } from './CartItem';
import { ArrangementGroup } from './ArrangementGroup';
import { useCartStore } from '../../store/cart.store';
import { useMemo } from 'react';

export const Cart = () => {
	const closeSheet = useGlobalStore(state => state.closeSheet);

	const cartItems = useCartStore(state => state.items);
	const cleanCart = useCartStore(state => state.cleanCart);
	const totalItemsInCart = useCartStore(
		state => state.totalItemsInCart
	);

	/**
	 * Agrupa items del carrito por tipo:
	 * - Arreglos personalizados agrupados por arrangementGroupId
	 * - Productos regulares sin agrupar
	 * 
	 * Validates: Requirements 13.5
	 */
	const groupedItems = useMemo(() => {
		const arrangements: Record<string, ICartItem[]> = {};
		const regularItems: ICartItem[] = [];

		cartItems.forEach(item => {
			if (item.isArrangementComponent && item.arrangementGroupId) {
				// Agrupar componentes de arreglo por arrangementGroupId
				if (!arrangements[item.arrangementGroupId]) {
					arrangements[item.arrangementGroupId] = [];
				}
				arrangements[item.arrangementGroupId].push(item);
			} else {
				// Items regulares no se agrupan
				regularItems.push(item);
			}
		});

		return { arrangements, regularItems };
	}, [cartItems]);

	return (
		<div className='flex flex-col h-full'>
			<div className='relative px-5 py-7 pr-14 flex items-center border-b border-slate-200'>
				<span className='flex gap-3 items-center font-semibold'>
					<HiOutlineShoppingBag size={20} />
					{totalItemsInCart} artículos
				</span>
				<button onClick={closeSheet} className='absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-colors'>
					<IoMdClose size={22} className='text-slate-700' />
				</button>
			</div>

			{totalItemsInCart > 0 ? (
				<>
					{/* LISTA DE PRODUCTOS AÑADIDOS AL CARRITO */}
					<div className='p-7 overflow-auto flex-1'>
						<ul className='space-y-6'>
							{/* Renderizar arreglos agrupados */}
							{Object.entries(groupedItems.arrangements).map(([groupId, items]) => (
								<ArrangementGroup
									key={groupId}
									items={items}
								/>
							))}

							{/* Renderizar productos regulares */}
							{groupedItems.regularItems.map(item => (
								<CartItem item={item} key={item.variantId} />
							))}
						</ul>
					</div>

					{/* BOTONES ACCIÓN */}
					<div className='mt-4 p-7'>
						<Link
							to='/checkout'
							className='w-full bg-black text-white py-3.5 rounded-full flex items-center justify-center gap-3'
						>
							<RiSecurePaymentLine size={24} />
							Continuar con la compra
						</Link>

						<button
							className='mt-3 w-full text-black border border-black rounded-full py-3'
							onClick={cleanCart}
						>
							Limpiar Carrito
						</button>
					</div>
				</>
			) : (
				<div className='flex flex-col items-center justify-center h-full gap-7'>
					<p className='text-sm font-medium tracking-tight'>
						Su carro esta vacío
					</p>
					<Link
						to='/productos'
						className='py-4 bg-black rounded-full text-white px-7 text-xs uppercase tracking-widest font-semibold'
						onClick={closeSheet}
					>
						Empezar a comprar
					</Link>
				</div>
			)}
		</div>
	);
};
