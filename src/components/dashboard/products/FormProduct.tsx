import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	ProductFormValues,
	productSchema,
} from '../../../lib/validators';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionFormProduct } from './SectionFormProduct';
import { InputForm } from './InputForm';
import { useEffect, useState } from 'react';
import { generateSlug } from '../../../helpers';
import { VariantsInput } from './VariantsInput';
import { CategorySelect } from './CategorySelect';
import { SubcategorySelect } from './SubcategorySelect';
import { UploaderImages } from './UploaderImages';
import { Editor } from './Editor';
import {
	useCreateProduct,
	useProduct,
	useUpdateProduct,
	useAttributes,
} from '../../../hooks';
import { Loader } from '../../shared/Loader';
import { JSONContent } from '@tiptap/react';
import { TagsInput } from './TagsInput';
import { OccasionsInput } from './OccasionsInput';
import toast from 'react-hot-toast';

interface Props {
	titleForm: string;
}

export const FormProduct = ({ titleForm }: Props) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		control,
	} = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			tags: [],
			occasion_ids: [],
		},
	});

	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();

	// Hooks de datos
	const { product, isLoading } = useProduct(slug || '');
	const {
		providers,
		isLoadingProviders,
		createOccasion,
		isCreatingOccasion
	} = useAttributes();

	// Mutaciones
	const { mutate: createProduct, isPending } = useCreateProduct();
	const { mutate: updateProduct, isPending: isUpdatePending } =
		useUpdateProduct(product?.id || '');

	// Estados locales
	const [internalCost, setInternalCost] = useState('');
	const [margin, setMargin] = useState('');

	const [metaTitle, setMetaTitle] = useState('');
	const [metaDescription, setMetaDescription] = useState('');

	// Estados para creación inline
	const [showNewOccasion, setShowNewOccasion] = useState(false);
	const [newOccasionName, setNewOccasionName] = useState('');



	const handleCreateOccasion = () => {
		if (!newOccasionName.trim()) {
			toast.error('El nombre de la temática es requerido');
			return;
		}

		createOccasion(newOccasionName, {
			onSuccess: (data) => {
				const current = watch('occasion_ids') || [];
				setValue('occasion_ids', [...current, data.id]);
				setShowNewOccasion(false);
				setNewOccasionName('');
				toast.success('Temática creada correctamente');
			},
			onError: (error) => {
				console.error(error);
				toast.error(error.message || 'Error al crear temática');
			}
		});
	};

	const suggestedPrice =
		internalCost && margin
			? (() => {
				const costNum = parseFloat(internalCost.replace(',', '.'));
				const marginNum = parseFloat(margin.replace(',', '.'));
				if (Number.isNaN(costNum) || Number.isNaN(marginNum))
					return '—';
				const result = costNum * (1 + marginNum / 100);
				return result > 0 ? `$${result.toFixed(2)}` : '—';
			})()
			: '—';

	// Cargar datos iniciales
	useEffect(() => {
		if (product && !isLoading) {
			setValue('name', product.name);
			setValue('slug', product.slug);
			setValue('category', (product as any).category ?? (product as any).brand ?? '');

			setValue('subcategory_id', (product as any).subcategory_id ?? '');
			setValue('provider_id', (product as any).provider_id ?? '');
			setValue('tags', (product as any).tags ?? []);

			const occasionIds = (product as any).product_occasions?.map((po: any) => po.occasion?.id).filter(Boolean) || [];
			setValue('occasion_ids', occasionIds);

			setValue('description', product.description as JSONContent);
			setValue('images', product.images);
			setValue(
				'variants',
				product.variants.map((v: any) => ({
					id: v.id,
					stock: v.stock,
					price: v.price,
					priceWholesale: v.price_wholesale ?? 0,
					storage: v.storage,
					color: v.color,
					colorName: v.color_name,
				}))
			);
		}
	}, [product, isLoading, setValue]);

	const onSubmit = handleSubmit(data => {
		const features: string[] = [];
		const payload = { ...data, features };

		if (slug) {
			updateProduct(payload);
		} else {
			createProduct(payload);
		}
	});

	const watchName = watch('name');

	useEffect(() => {
		if (!watchName || slug) return;
		const generatedSlug = generateSlug(watchName);
		setValue('slug', generatedSlug, { shouldValidate: true });
	}, [watchName, setValue, slug]);

	if (isPending || isUpdatePending || isLoading) return <Loader />;

	return (
		<div className='relative flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<div className='space-y-1'>
					<div className='flex items-center gap-3'>
						<button
							type='button'
							className='bg-white p-1.5 rounded-md shadow-sm border border-slate-200 transition-all group hover:scale-105'
							onClick={() => navigate(-1)}
						>
							<IoIosArrowBack
								size={18}
								className='transition-all group-hover:scale-125'
							/>
						</button>
						<h1 className='text-2xl font-extrabold tracking-tight'>
							{titleForm}
						</h1>
					</div>
					<p className='text-xs font-medium uppercase tracking-[0.22em] text-slate-400'>
						<span className='text-primary'>Productos</span>{' '}
						<span className='mx-1 text-slate-500'>/</span>{' '}
						{slug ? 'Editar' : 'Nuevo'}
					</p>
				</div>

				<div className='hidden gap-3 md:flex'>
					<button
						className='btn-secondary-outline'
						type='button'
						onClick={() => navigate(-1)}
					>
						Cancelar
					</button>
					<button className='btn-primary' type='submit' form='product-form'>
						Guardar producto
					</button>
				</div>
			</div>

			<form
				id='product-form'
				className='grid auto-rows-max flex-1 grid-cols-1 gap-6 lg:grid-cols-3'
				onSubmit={onSubmit}
			>
				<SectionFormProduct
					titleSection='Detalles del Producto'
					className='lg:col-span-2 lg:row-span-2'
				>
					<InputForm
						type='text'
						placeholder='Ejemplo: Pack Globos Pastel x50'
						label='Nombre'
						name='name'
						register={register}
						errors={errors}
						required
					/>
					<div className='grid gap-4 md:grid-cols-2'>
						<CategorySelect
							register={register}
							setValue={setValue}
							errors={errors}
						/>
						<InputForm
							type='text'
							label='Slug'
							name='slug'
							placeholder='pack-globos-pastel-x50'
							register={register}
							errors={errors}
						/>
					</div>

					<div className='mt-4 grid gap-4 md:grid-cols-2'>
						<SubcategorySelect
							register={register}
							setValue={setValue}
							watch={watch}
						/>

						<div className='flex flex-col gap-2'>
							<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
								Proveedor (BD)
							</label>
							<select
								{...register('provider_id')}
								className='w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
								disabled={isLoadingProviders}
							>
								<option value=''>Seleccionar proveedor...</option>
								{providers.map(prov => (
									<option key={prov.id} value={prov.id}>
										{prov.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className='mt-6 flex flex-col gap-2'>
						<div className='flex items-center justify-between'>
							<OccasionsInput watch={watch} setValue={setValue} />
							<button
								type='button'
								onClick={() => setShowNewOccasion(!showNewOccasion)}
								className='ml-2 shrink-0 rounded-md border border-primary/30 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10'
							>
								+ Crear Temática
							</button>
						</div>

						{showNewOccasion && (
							<div className='mt-2 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 w-fit'>
								<input
									type='text'
									value={newOccasionName}
									onChange={e => setNewOccasionName(e.target.value)}
									placeholder='Nueva temática'
									className='w-48 rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
								/>
								<button
									type='button'
									onClick={handleCreateOccasion}
									disabled={isCreatingOccasion}
									className='rounded-md bg-primary px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary/90'
								>
									Crear
								</button>
							</div>
						)}
					</div>
				</SectionFormProduct>

				<SectionFormProduct
					titleSection='Variantes del Producto'
					className='lg:col-span-2 h-fit'
				>
					<VariantsInput
						control={control}
						errors={errors}
						register={register}
						setValue={setValue}
					/>
				</SectionFormProduct>

				<SectionFormProduct titleSection='Imágenes del producto'>
					<UploaderImages
						errors={errors}
						setValue={setValue}
						watch={watch}
					/>
				</SectionFormProduct>

				<SectionFormProduct
					titleSection='Descripción del producto'
					className='col-span-full'
				>
					<Editor
						setValue={setValue}
						errors={errors}
						initialContent={product?.description as JSONContent}
					/>
				</SectionFormProduct>

				<SectionFormProduct
					titleSection='SEO y búsqueda'
					className='col-span-full'
				>
					<div className='grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]'>
						<div className='flex flex-col gap-2'>
							<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
								Slug (URL)
							</label>
							<div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500'>
								<span className='whitespace-nowrap'>
									tienditadejireh.com/p/
								</span>
								<span className='truncate font-semibold text-slate-800'>
									{watch('slug')}
								</span>
							</div>
						</div>
						<div className='flex flex-col gap-2'>
							<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
								Meta título (Para SEO)
							</label>
							<input
								type='text'
								placeholder='Ej: Pack Globos Pastel x50 — Tiendita de Jireh'
								value={metaTitle}
								onChange={e => setMetaTitle(e.target.value)}
								className='w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
							/>
							<p className='self-end text-[11px] text-slate-400'>
								{metaTitle.length}/60
							</p>
						</div>
					</div>

					<div className='mt-4 flex flex-col gap-2'>
						<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
							Meta descripción
						</label>
						<textarea
							rows={3}
							placeholder='Breve descripción para Google (hasta 160 caracteres)…'
							value={metaDescription}
							onChange={e =>
								setMetaDescription(e.target.value)
							}
							className='w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
						/>
						<p className='self-end text-[11px] text-slate-400'>
							{metaDescription.length}/160
						</p>
					</div>

					<div className='mt-6'>
						<TagsInput watch={watch} setValue={setValue} />
					</div>
				</SectionFormProduct>

				<SectionFormProduct titleSection='Costos (interno)'>
					<div className='flex flex-col gap-4'>
						<div className='grid gap-3 md:grid-cols-2'>
							<div className='flex flex-col gap-2'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
									Costo unitario ($)
								</label>
								<input
									type='number'
									min='0'
									step='0.01'
									value={internalCost}
									onChange={e =>
										setInternalCost(e.target.value)
									}
									placeholder='150.00'
									className='w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
								/>
							</div>
							<div className='flex flex-col gap-2'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
									% Ganancia
								</label>
								<input
									type='number'
									min='0'
									max='999'
									value={margin}
									onChange={e => setMargin(e.target.value)}
									placeholder='40'
									className='w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
								/>
							</div>
						</div>

						<div className='rounded-lg bg-primary/5 px-3 py-3 text-xs text-slate-600'>
							<p className='flex items-center gap-2'>
								<span className='text-base'>💡</span>
								<span>
									Precio sugerido de venta:{' '}
									<span className='font-extrabold text-primary'>
										{suggestedPrice}
									</span>
								</span>
							</p>
						</div>
					</div>
				</SectionFormProduct>

				<div className='mt-4 flex justify-end gap-3 md:hidden'>
					<button
						className='btn-secondary-outline w-full'
						type='button'
						onClick={() => navigate(-1)}
					>
						Cancelar
					</button>
					<button className='btn-primary w-full' type='submit'>
						Guardar producto
					</button>
				</div>
			</form>
		</div>
	);
};
