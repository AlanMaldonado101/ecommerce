import {
	FieldErrors,
	UseFormSetValue,
	UseFormWatch,
} from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';
import { useEffect, useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';

interface ImagePreview {
	file?: File;
	previewUrl: string;
}

interface Props {
	setValue: UseFormSetValue<ProductFormValues>;
	watch: UseFormWatch<ProductFormValues>;
	errors: FieldErrors<ProductFormValues>;
}

export const UploaderImages = ({
	setValue,
	errors,
	watch,
}: Props) => {
	const [images, setImages] = useState<ImagePreview[]>([]);

	// Verificar si hay errores con las imágenes
	const formImages = watch('images');

	// Cargar imágenes existentes si las hay en el formulario
	useEffect(() => {
		if (formImages && formImages.length > 0 && images.length == 0) {
			const existingImages = formImages.map(url => ({
				previewUrl: url,
			}));
			setImages(existingImages);

			// Actualizar el valor del formulario
			setValue('images', formImages);
		}
	}, [formImages, images.length, setValue]);

	const handleImageChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files) {
			const newImages = Array.from(e.target.files).map(file => ({
				file,
				previewUrl: URL.createObjectURL(file),
			}));

			const updatedImages = [...images, ...newImages];

			setImages(updatedImages);

			setValue(
				'images',
				updatedImages.map(img => img.file || img.previewUrl)
			);
		}
	};

	const handleRemoveImage = (index: number) => {
		const updatedImages = images.filter((_, i) => i !== index);
		setImages(updatedImages);

		setValue(
			'images',
			updatedImages.map(img => img.file || img.previewUrl)
		);
	};

	return (
		<>
			<label className='relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 md:py-8 text-center transition hover:border-primary hover:bg-primary/5'>
				<span className='mb-2 text-3xl'>📸</span>
				<p className='text-sm font-semibold text-slate-700'>
					Haz clic o arrastra imágenes
				</p>
				<p className='mt-1 text-xs text-slate-500'>
					PNG, JPG, WEBP — máx. 5MB c/u
				</p>
				<input
					type='file'
					accept='image/*'
					multiple
					onChange={handleImageChange}
					className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
				/>
			</label>

			<div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 md:gap-4'>
				{images.map((image, index) => (
					<div key={index}>
						<div className='relative h-24 md:h-20 lg:h-28 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm'>
							<img
								src={image.previewUrl}
								alt={`Preview ${index}`}
								className='h-full w-full rounded-md object-contain'
							/>
							<button
								type='button'
								onClick={() => handleRemoveImage(index)}
								className='absolute -right-2 -top-2 z-10 flex h-11 w-11 items-center justify-center transition-all hover:scale-110'
								aria-label={`Eliminar imagen ${index + 1}`}
							>
								<IoIosCloseCircleOutline
									size={28}
									className='text-red-500'
								/>
							</button>
						</div>
					</div>
				))}
			</div>

			{formImages?.length === 0 && errors.images && (
				<p className='text-red-500 text-xs mt-1'>
					{errors.images.message}
				</p>
			)}
		</>
	);
};
