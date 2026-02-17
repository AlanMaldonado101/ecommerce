import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';
import { useAttributes, useCategories } from '../../../hooks';
import toast from 'react-hot-toast';

interface Props {
    register: UseFormRegister<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    watch: UseFormWatch<ProductFormValues>;
}

export const SubcategorySelect = ({ register, setValue, watch }: Props) => {
    const {
        subcategories,
        isLoadingSubcategories,
        createSubcategory,
        isCreatingSubcategory,
    } = useAttributes();
    const { categories } = useCategories();

    const [showNewSubcategory, setShowNewSubcategory] = useState(false);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');

    const selectedCategorySlug = watch('category');
    const selectedCategory = categories.find(c => c.slug === selectedCategorySlug);

    // Si hay categoría seleccionada, filtrar. Si no, mostrar todas.
    const displayedSubcategories = selectedCategory
        ? subcategories.filter(sub => sub.category_id === selectedCategory.id)
        : subcategories;

    const handleCreateSubcategory = () => {
        const name = newSubcategoryName.trim();
        if (!name) {
            toast.error('El nombre de la subcategoría es requerido');
            return;
        }

        createSubcategory(
            { name, categoryId: selectedCategory?.id },
            {
                onSuccess: (data) => {
                    setValue('subcategory_id', data.id);
                    setShowNewSubcategory(false);
                    setNewSubcategoryName('');
                    toast.success('Subcategoría creada correctamente');
                },
                onError: (err: Error) => {
                    toast.error(err.message ?? 'Error al crear la subcategoría');
                },
            }
        );
    };

    return (
        <div>
            <label className='mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                Subcategoría
            </label>
            <div className='flex gap-2'>
                <select
                    {...register('subcategory_id')}
                    className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    disabled={isLoadingSubcategories}
                >
                    <option value=''>Seleccionar subcategoría...</option>
                    {displayedSubcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>
                            {sub.name}
                        </option>
                    ))}
                </select>
                <button
                    type='button'
                    onClick={() => setShowNewSubcategory(!showNewSubcategory)}
                    className='shrink-0 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10'
                >
                    + Nueva
                </button>
            </div>

            {showNewSubcategory && (
                <div className='mt-3 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3'>
                    <input
                        type='text'
                        value={newSubcategoryName}
                        onChange={e => setNewSubcategoryName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateSubcategory();
                            }
                        }}
                        placeholder='Nombre de la subcategoría'
                        className='flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                        disabled={isCreatingSubcategory}
                        autoFocus
                    />
                    <button
                        type='button'
                        onClick={handleCreateSubcategory}
                        disabled={isCreatingSubcategory || !newSubcategoryName.trim()}
                        className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
                    >
                        {isCreatingSubcategory ? 'Creando...' : 'Crear'}
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            setShowNewSubcategory(false);
                            setNewSubcategoryName('');
                        }}
                        className='rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100'
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};
