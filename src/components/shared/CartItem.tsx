import { LuMinus, LuPlus } from 'react-icons/lu';
import { formatPrice } from '../../helpers';
import { useCartStore } from '../../store/cart.store';
import type { ComponentCategory } from '../../interfaces/arrangement.interface';

export interface ICartItem {
	variantId: string;
	productId: string;
	name: string;
	color: string;
	storage: string;
	price: number;
	quantity: number;
	image: string;
	// Metadata para arreglos personalizados
	arrangementGroupId?: string;
	isArrangementComponent?: boolean;
	componentCategory?: ComponentCategory;
}

interface Props {
	item: ICartItem;
}

export const CartItem = ({ item }: Props) => {
	const removeItem = useCartStore(state => state.removeItem);
	const updateQuantity = useCartStore(state => state.updateQuantity);

	const increment = () => {
		updateQuantity(item.variantId, item.quantity + 1);
	};

	const decrement = () => {
		if (item.quantity > 1) {
			updateQuantity(item.variantId, item.quantity - 1);
		}
	};

	// Detectar si es componente de arreglo
	const isArrangementComponent = item.isArrangementComponent === true;

	// Mapeo de categorías a emojis y colores
	const categoryConfig = {
		BASE: { emoji: '📦', color: 'bg-blue-100 text-blue-800' },
		FLORES: { emoji: '🌸', color: 'bg-pink-100 text-pink-800' },
		GLOBOS: { emoji: '🎈', color: 'bg-purple-100 text-purple-800' },
		EXTRAS: { emoji: '✨', color: 'bg-yellow-100 text-yellow-800' },
	};

	const categoryInfo = item.componentCategory 
		? categoryConfig[item.componentCategory]
		: null;

	return (
		<li className='flex justify-between items-center gap-5'>
			<div className='flex'>
				<img
					src={item.image}
					alt={item.name}
					className='w-20 h-20 object-contain'
				/>
			</div>

			<div className='flex-1 space-y-3'>
				<div className='flex justify-between items-start'>
					<div className='flex-1'>
						<p className='font-semibold'>{item.name}</p>
						{/* Badge de categoría para componentes de arreglo */}
						{isArrangementComponent && categoryInfo && (
							<span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
								{categoryInfo.emoji} {item.componentCategory}
							</span>
						)}
					</div>
					<p className='text-sm font-medium text-gray-600 mt-1'>
						{formatPrice(item.price)}
					</p>
				</div>

				{/* Mostrar color/storage solo para productos regulares */}
				{!isArrangementComponent && (
					<div className='flex gap-3'>
						<p className='text-[13px] text-gray-600'>
							{item.storage} / {item.color}
						</p>
					</div>
				)}

				<div className='flex gap-4'>
					{/* Controles de cantidad solo para productos regulares */}
					{!isArrangementComponent && (
						<div className='flex items-center gap-5 px-2 py-1 border border-slate-200 w-fit rounded-full'>
							<button
								onClick={decrement}
								disabled={item.quantity === 1}
							>
								<LuMinus size={15} />
							</button>
							<span className='text-slate-500 text-sm'>
								{item.quantity}
							</span>
							<button onClick={increment}>
								<LuPlus size={15} />
							</button>
						</div>
					)}

					{/* Para componentes de arreglo, mostrar cantidad fija */}
					{isArrangementComponent && (
						<div className='flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full'>
							<span className='text-slate-500 text-sm'>
								Cantidad: {item.quantity}
							</span>
						</div>
					)}

					<button
						className='underline font-medium text-[10px]'
						onClick={() => removeItem(item.variantId)}
						title={isArrangementComponent ? 'Eliminar este componente del arreglo' : 'Eliminar del carrito'}
					>
						Eliminar
					</button>
				</div>
			</div>
		</li>
	);
};
