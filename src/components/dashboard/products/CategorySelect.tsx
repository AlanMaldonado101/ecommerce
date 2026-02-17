import { useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';
import { useCategories } from '../../../hooks';
import toast from 'react-hot-toast';

interface Props {
	register: UseFormRegister<ProductFormValues>;
	setValue: UseFormSetValue<ProductFormValues>;
	errors: { category?: { message?: string } };
}

export const CategorySelect = ({ register, setValue, errors }: Props) => {
	const { categories, createCategory, isCreating } = useCategories();
	const [showNewCategory, setShowNewCategory] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');

	const handleCreateCategory = () => {
		const name = newCategoryName.trim();
		if (!name) return;

		createCategory(name, {
			onSuccess: (data) => {
				setValue('category', data.slug);
				setShowNewCategory(false);
				setNewCategoryName('');
				toast.success('Categoría creada correctamente');
			},
			onError: (err: Error) => {
				toast.error(err.message ?? 'Error al crear la categoría');
			},
		});
	};

	return (
		<div>
			<label className='mb-2 block text-sm font-semibold text-slate-800'>
				Categoría
			</label>
			<div className='flex gap-2'>
				<select
					{...register('category')}
					className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				>
					<option value=''>Selecciona una categoría</option>
					{categories.map(cat => (
						<option key={cat.id} value={cat.slug}>
							{cat.name}
						</option>
					))}
				</select>
				<button
					type='button'
					onClick={() => setShowNewCategory(!showNewCategory)}
					className='shrink-0 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10'
				>
					+ Nueva
				</button>
			</div>

			{showNewCategory && (
				<div className='mt-3 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3'>
					<input
						type='text'
						value={newCategoryName}
						onChange={e => setNewCategoryName(e.target.value)}
						onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
						placeholder='Nombre de la categoría'
						className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
						disabled={isCreating}
						autoFocus
					/>
					<button
						type='button'
						onClick={handleCreateCategory}
						disabled={isCreating || !newCategoryName.trim()}
						className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
					>
						{isCreating ? 'Creando...' : 'Crear'}
					</button>
					<button
						type='button'
						onClick={() => {
							setShowNewCategory(false);
							setNewCategoryName('');
						}}
						className='rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100'
					>
						Cancelar
					</button>
				</div>
			)}

			{errors.category && (
				<p className='mt-1 text-xs text-red-500'>{errors.category.message}</p>
			)}
		</div>
	);
};
