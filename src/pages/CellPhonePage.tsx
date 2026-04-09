import { LuMinus, LuPlus } from 'react-icons/lu';
import { Separator } from '../components/shared/Separator';
import { formatPrice } from '../helpers';
import { CiDeliveryTruck } from 'react-icons/ci';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BsChatLeftText } from 'react-icons/bs';
import { ProductDescription } from '../components/one-product/ProductDescription';
import { GridImages } from '../components/one-product/GridImages';
import { ProductReviews } from '../components/products/ProductReviews';
import { RelatedProducts } from '../components/products/RelatedProducts';
import { useProduct } from '../hooks/products/useProduct';
import { useEffect, useMemo, useState } from 'react';
import { VariantProduct } from '../interfaces';
import { Tag } from '../components/shared/Tag';
import { Loader } from '../components/shared/Loader';
import { useCounterStore } from '../store/counter.store';
import { useCartStore } from '../store/cart.store';
import { useWishlistStore } from '../store/wishlist.store';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface Acc {
	[key: string]: {
		name: string;
		storages: string[];
	};
}

export const CellPhonePage = () => {
	const { slug } = useParams<{ slug: string }>();

	const [currentSlug, setCurrentSlug] = useState(slug);

	const { product, isLoading, isError } = useProduct(
		currentSlug || ''
	);

	const [selectedColor, setSelectedColor] = useState<string | null>(
		null
	);

	const [selectedStorage, setSelectedStorage] = useState<
		string | null
	>(null);

	const [selectedVariant, setSelectedVariant] =
		useState<VariantProduct | null>(null);

	const count = useCounterStore(state => state.count);
	const increment = useCounterStore(state => state.increment);
	const decrement = useCounterStore(state => state.decrement);
	const setCount = useCounterStore(state => state.setCount);

	const addItem = useCartStore(state => state.addItem);

	const { toggleItem, isInWishlist } = useWishlistStore();
	const isFavorite = currentSlug ? isInWishlist(currentSlug) : false;

	const navigate = useNavigate();

	// Agrupamos las variantes por color
	const colors = useMemo(() => {
		return (
			product?.variants.reduce(
				(acc: Acc, variant: VariantProduct) => {
					const { color, color_name, storage } = variant;
					if (!acc[color]) {
						acc[color] = {
							name: color_name,
							storages: [],
						};
					}

					if (!acc[color].storages.includes(storage)) {
						acc[color].storages.push(storage);
					}

					return acc;
				},
				{} as Acc
			) || {}
		);
	}, [product?.variants]);

	// Obtener el primer color predeterminado si no se ha seleccionado ninguno
	const availableColors = Object.keys(colors);
	useEffect(() => {
		if (!selectedColor && availableColors.length > 0) {
			setSelectedColor(availableColors[0]);
		}
	}, [availableColors, selectedColor, product]);

	// Actualizar el almacenamiento seleccionado cuando cambia el color
	useEffect(() => {
		if (selectedColor && colors[selectedColor] && !selectedStorage) {
			setSelectedStorage(colors[selectedColor].storages[0]);
		}
	}, [selectedColor, colors, selectedStorage]);

	// Obtener la variante seleccionada
	useEffect(() => {
		if (selectedColor && selectedStorage) {
			const variant = product?.variants.find(
				variant =>
					variant.color === selectedColor &&
					variant.storage === selectedStorage
			);

			setSelectedVariant(variant as VariantProduct);
		}
	}, [selectedColor, selectedStorage, product?.variants]);

	// Obtener el stock
	const stock = selectedVariant?.stock || 0;
	const isOutOfStock = selectedVariant ? stock === 0 : false;

	// Limitar la cantidad seleccionada si cambia el stock
	useEffect(() => {
		if (selectedVariant && count > stock && stock > 0) {
			setCount(stock);
		} else if (selectedVariant && isOutOfStock) {
			setCount(1);
		}
	}, [selectedVariant, count, stock, isOutOfStock, setCount]);

	// Calcular el precio actual basado en la cantidad
	const basePrice = selectedVariant?.price || product?.variants[0]?.price || 0;
	const wholesaleDiscountAmount = selectedVariant?.price_wholesale || product?.variants[0]?.price_wholesale || 0;
	const isWholesale = count >= 4 && wholesaleDiscountAmount > 0;
	const currentPrice = isWholesale ? wholesaleDiscountAmount : basePrice;

	// Función para añadir al carrito
	const addToCart = () => {
		if (selectedVariant) {
			addItem({
				variantId: selectedVariant.id,
				productId: product?.id || '',
				name: product?.name || '',
				image: product?.images[0] || '',
				color: selectedVariant.color_name,
				storage: selectedVariant.storage,
				price: currentPrice,
				quantity: count,
			});
			toast.success('Producto añadido al carrito', {
				position: 'bottom-right',
			});
		}
	};

	// Función para comprar ahora
	const buyNow = () => {
		if (selectedVariant) {
			addItem({
				variantId: selectedVariant.id,
				productId: product?.id || '',
				name: product?.name || '',
				image: product?.images[0] || '',
				color: selectedVariant.color_name,
				storage: selectedVariant.storage,
				price: currentPrice,
				quantity: count,
			});

			navigate('/checkout');
		}
	};

	const toggleFavorite = () => {
		if (product && currentSlug) {
			toggleItem({
				id: currentSlug,
				slug: currentSlug,
				name: product.name,
				price: selectedVariant?.price || product.variants[0].price,
				image: product.images[0],
				colors: Object.entries(colors).map(([colorHex, data]) => ({
					name: data.name,
					color: colorHex,
				})),
				variants: product.variants,
			});
		}
	};

	// Resetear el slug actual cuando cambia en la URL
	useEffect(() => {
		setCurrentSlug(slug);

		// Reiniciar color, almacenamiento y variante seleccionada
		setSelectedColor(null);
		setSelectedStorage(null);
		setSelectedVariant(null);
	}, [slug]);

	if (isLoading) return <Loader />;

	if (!product || isError)
		return (
			<div className='flex justify-center items-center h-[80vh]'>
				<p>Producto no encontrado</p>
			</div>
		);

	return (
		<>
			<div className='h-fit flex flex-col md:flex-row gap-16 mt-8'>
				{/* GALERÍA DE IMAGENES */}
				<GridImages images={product.images} />

				<div className='flex-1 space-y-5'>
					<div className="flex justify-between items-start">
						<h1 className='text-3xl font-bold tracking-tight'>
							{product.name}
						</h1>
						<button
							className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 ${isFavorite ? 'text-red-500' : 'text-slate-400'}`}
							onClick={toggleFavorite}
						>
							{isFavorite ? (
								<HiHeart className="text-xl" />
							) : (
								<HiOutlineHeart className="text-xl" />
							)}
						</button>
					</div>

					<div className='flex gap-5 items-center'>
						<div className='flex flex-col gap-2'>
							{wholesaleDiscountAmount > 0 ? (
								<div className="flex flex-col gap-1.5 mt-2">
									<div className="flex items-center gap-3">
										<span className={`tracking-wide font-bold ${!isWholesale ? 'text-3xl text-slate-800' : 'text-xl text-slate-400 line-through'}`}>
											{formatPrice(basePrice)}
										</span>
										<span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
											X menor
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span className={`tracking-wide font-bold ${isWholesale ? 'text-3xl text-black' : 'text-xl text-slate-700'}`}>
											{formatPrice(wholesaleDiscountAmount)}
										</span>
										<span className="text-[10px] uppercase font-bold tracking-wider bg-black text-white px-2 py-1 rounded-md">
											X mayor
										</span>
									</div>
								</div>
							) : (
								<span className='tracking-wide text-3xl font-bold'>
									{formatPrice(currentPrice)}
								</span>
							)}
						</div>

						<div className='relative'>
							{isOutOfStock && <Tag contentTag='agotado' />}
						</div>
					</div>

					<Separator />

					{/* Características */}
					<ul className='space-y-2 ml-7 my-10'>
						{Array.isArray(product.features) && (product.features as string[]).map((feature) => (
							<li
								key={feature}
								className='text-sm flex items-center gap-2 tracking-tight font-medium'
							>
								<span className='bg-black w-[5px] h-[5px] rounded-full' />
								{feature}
							</li>
						))}
					</ul>

					<div className='flex flex-col gap-3'>
						<p>
							Color: {selectedColor && colors[selectedColor].name}
						</p>
						<div className='flex gap-3'>
							{availableColors.map(color => (
								<button
									key={color}
									className={`w-8 h-8 rounded-full flex justify-center items-center ${selectedColor === color
										? 'border border-slate-800'
										: ''
										}`}
									onClick={() => setSelectedColor(color)}
								>
									<span
										className='w-[26px] h-[26px] rounded-full'
										style={{ backgroundColor: color }}
									/>
								</button>
							))}
						</div>
					</div>

					{/* OPCIONES / STOCK DISPONIBLE */}
					<div className='flex flex-col gap-3'>
						{selectedColor && colors[selectedColor].storages.length > 1 && (
							<>
								<p className='text-xs font-medium'>
									Variante
								</p>
								<select
									className='border border-gray-300 rounded-lg px-3 py-1 bg-white w-fit'
									value={selectedStorage || ''}
									onChange={e => setSelectedStorage(e.target.value)}
								>
									{colors[selectedColor].storages.map(storage => (
										<option value={storage} key={storage}>
											{storage}
										</option>
									))}
								</select>
							</>
						)}

						{selectedVariant && !isOutOfStock && (
							<p className='text-xs font-medium text-slate-600'>
								Stock disponible: <span className='font-bold text-black'>{stock} unidades</span>
							</p>
						)}
					</div>

					{/* COMPRAR */}
					{isOutOfStock ? (
						<button
							className='bg-[#f3f3f3] uppercase font-semibold tracking-widest text-xs py-4 rounded-full transition-all duration-300 hover:bg-[#e2e2e2] w-full'
							disabled
						>
							Agotado
						</button>
					) : (
						<>
							{/* Contador */}
							<div className='space-y-3'>
								<p className='text-sm font-medium'>Cantidad:</p>

								<div className='flex gap-8 px-5 py-3 border border-slate-200 w-fit rounded-full'>
									<button onClick={decrement} disabled={count === 1}>
										<LuMinus size={15} />
									</button>
									<span className='text-slate-500 text-sm'>
										{count}
									</span>
									<button onClick={increment} disabled={count >= stock}>
										<LuPlus size={15} />
									</button>
								</div>

								{wholesaleDiscountAmount > 0 && (
									<p className="text-xs text-slate-500 max-w-[200px]">
										* Precio por mayor a partir de 4 unidades
									</p>
								)}
							</div>

							{/* BOTONES ACCIÓN */}
							<div className='flex flex-col gap-3'>
								<button
									className='bg-[#f3f3f3] uppercase font-semibold tracking-widest text-xs py-4 rounded-full transition-all duration-300 hover:bg-[#e2e2e2]'
									onClick={addToCart}
								>
									Agregar al carro
								</button>
								<button
									className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full'
									onClick={buyNow}
								>
									Comprar ahora
								</button>
							</div>
						</>
					)}

					<div className='flex pt-2'>
						<div className='flex flex-col gap-1 flex-1 items-center'>
							<CiDeliveryTruck size={35} />
							<p className='text-xs font-semibold'>Envío gratis</p>
						</div>

						<Link
							to='#'
							className='flex flex-col gap-1 flex-1 items-center justify-center'
						>
							<BsChatLeftText size={30} />
							<p className='flex flex-col items-center text-xs'>
								<span className='font-semibold'>
									¿Necesitas ayuda?
								</span>
								Contáctanos aquí
							</p>
						</Link>
					</div>
				</div>
			</div>

			{/* DESCRIPCIÓN */}
			<ProductDescription content={product.description} />

			{/* RESEÑAS */}
			<ProductReviews productId={product.id} />

			{/* PRODUCTOS RELACIONADOS */}
			<RelatedProducts />
		</>
	);
};
