import {
	Control,
	useFieldArray,
	FieldErrors,
	UseFormRegister,
	useWatch,
	UseFormSetValue,
} from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';
import {
	IoIosAddCircleOutline,
	IoIosCloseCircleOutline,
} from 'react-icons/io';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
	control: Control<ProductFormValues>;
	errors: FieldErrors<ProductFormValues>;
	register: UseFormRegister<ProductFormValues>;
	setValue: UseFormSetValue<ProductFormValues>;
}

const headersVariants = [
	'Stock',
	'Precio (por menor)',
	'Precio (por mayor)',
	'Presentación',
	'Color',
	'',
];

const colorSwatches = [
	{ code: '#EF4444', name: 'Rojo' },
	{ code: '#F97316', name: 'Naranja' },
	{ code: '#EAB308', name: 'Amarillo' },
	{ code: '#22C55E', name: 'Verde' },
	{ code: '#3B82F6', name: 'Azul' },
	{ code: '#8B5CF6', name: 'Violeta' },
	{ code: '#EC4899', name: 'Rosa' },
	{ code: '#FFFFFF', name: 'Blanco' },
	{ code: '#111827', name: 'Negro' },
	{ code: '#F9A8D4', name: 'Rosa Pastel' },
	{ code: '#93C5FD', name: 'Azul Pastel' },
	{ code: '#6EE7B7', name: 'Verde Pastel' },
];

export const VariantsInput = ({
	control,
	errors,
	register,
	setValue,
}: Props) => {
	const { fields, remove, append } = useFieldArray({
		control,
		name: 'variants',
	});

	const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);

	const addVariant = () => {
		append({
			stock: 0,
			price: 0,
			priceWholesale: 0,
			storage: '',
			color: '',
			colorName: '',
		});
	};

	const removeVariant = (index: number) => {
		remove(index);
		if (activeVariantIndex === index) setActiveVariantIndex(null);
	};

	const toggleColorActive = (index: number) => {
		setActiveVariantIndex(prev => (prev === index ? null : index));
	};

	const handleSelectColor = (colorCode: string, colorName: string) => {
		if (activeVariantIndex !== null) {
			setValue(`variants.${activeVariantIndex}.color`, colorCode);
			setValue(`variants.${activeVariantIndex}.colorName`, colorName);
			// Opcional: Cerrar dropdown al seleccionar
			// toggleColorActive(activeVariantIndex);
		} else {
			toast('Selecciona "Añadir" en una variante para aplicar el color.', {
				icon: '🎨',
			});
		}
	};

	const colorValues = useWatch({
		control,
		name: fields.map(
			(_, index) => `variants.${index}.color` as const
		),
	});

	const colorNameValues = useWatch({
		control,
		name: fields.map(
			(_, index) => `variants.${index}.colorName` as const
		),
	});

	const variantsValues = useWatch({
		control,
		name: 'variants',
	});

	const totalStock =
		variantsValues?.reduce(
			(acc, current) => acc + (current?.stock || 0),
			0
		) ?? 0;

	const getFirstError = (
		variantErros: FieldErrors<ProductFormValues['variants'][number]>
	) => {
		if (variantErros) {
			const keys = Object.keys(
				variantErros
			) as (keyof typeof variantErros)[];
			if (keys.length > 0) {
				return variantErros[keys[0]]?.message;
			}
		}
	};

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs sm:text-sm'>
				<span className='font-medium text-slate-600'>
					Stock total
				</span>
				<span className='font-extrabold text-emerald-700'>
					{totalStock} unidades
				</span>
			</div>

			<div className='space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4'>
				<div className='grid grid-cols-6 justify-start gap-4'>
					{headersVariants.map((header, index) => (
						<p
							key={index}
							className='text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500'
						>
							{header}
						</p>
					))}
				</div>
				{fields.map((field, index) => (
					<div key={field.id}>
						<div className='grid grid-cols-6 items-center gap-4'>
							<input
								type='number'
								placeholder='Stock'
								{...register(`variants.${index}.stock`, {
									valueAsNumber: true,
								})}
								className='border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold placeholder:font-normal focus:outline-none appearance-none bg-white'
							/>

							<input
								type='number'
								step='0.01'
								placeholder='Por menor'
								{...register(`variants.${index}.price`, {
									valueAsNumber: true,
								})}
								className='border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold placeholder:font-normal focus:outline-none appearance-none bg-white'
							/>

							<input
								type='number'
								step='0.01'
								placeholder='Por mayor'
								{...register(`variants.${index}.priceWholesale`, {
									valueAsNumber: true,
								})}
								className='border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold placeholder:font-normal focus:outline-none appearance-none bg-white'
							/>

							<input
								type='text'
								placeholder='x50, Pack 10...'
								{...register(`variants.${index}.storage`)}
								className='border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold placeholder:font-normal focus:outline-none appearance-none bg-white'
							/>

							<div className='flex relative justify-center'>
								<button
									className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all ${activeVariantIndex === index
										? 'border-primary ring-2 ring-primary/20 scale-110'
										: 'border-slate-200 hover:border-primary/50'
										} ${!colorValues[index] ? 'bg-slate-50' : ''}`}
									style={{ backgroundColor: colorValues[index] }}
									type='button'
									onClick={() => toggleColorActive(index)}
									title={colorNameValues[index] || 'Seleccionar color'}
								>
									{!colorValues[index] && (
										<span className='text-[10px] text-slate-400'>?</span>
									)}
								</button>

								{activeVariantIndex === index && (
									<div className='absolute top-10 z-10 w-fit whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg'>
										Seleccionando...
									</div>
								)}
							</div>

							<div className='flex justify-end'>
								<button
									type='button'
									onClick={() => removeVariant(index)}
									className='p-1 text-slate-400 hover:text-red-500 transition-colors'
								>
									<IoIosCloseCircleOutline size={20} />
								</button>
							</div>
						</div>

						{errors.variants && errors.variants[index] && (
							<p className='text-red-500 text-xs mt-1'>
								{getFirstError(errors.variants[index])}
							</p>
						)}
					</div>
				))}
			</div>

			<button
				type='button'
				onClick={addVariant}
				className='flex items-center gap-1 self-center rounded-md px-4 py-2 text-sm font-semibold tracking-tight text-slate-800 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm'
			>
				<IoIosAddCircleOutline size={16} />
				Añadir Variante
			</button>

			{fields.length === 0 && errors.variants && (
				<p className='text-red-500 text-xs mt-1 self-center'>
					Debes añadir al menos una variante
				</p>
			)}

			<div className='mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3'>
				<p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
					Paleta rápida (Click para aplicar al selector activo)
				</p>
				<div className='flex flex-wrap gap-2'>
					{colorSwatches.map(swatch => (
						<button
							key={swatch.code}
							type='button'
							onClick={() => handleSelectColor(swatch.code, swatch.name)}
							className={`group relative h-8 w-8 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${activeVariantIndex !== null && colorValues[activeVariantIndex] === swatch.code
								? 'ring-2 ring-primary ring-offset-2'
								: ''
								}`}
							title={swatch.name}
							style={{ backgroundColor: swatch.code }}
						>
							{activeVariantIndex !== null && colorValues[activeVariantIndex] === swatch.code && (
								<span className='absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold shadow-sm'>
									✓
								</span>
							)}
						</button>
					))}
				</div>
				{activeVariantIndex === null && (
					<p className='text-[10px] text-slate-400 italic'>
						* Abre el selector de una variante primero
					</p>
				)}
			</div>
		</div>
	);
};
