import { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';

interface Props {
    watch: UseFormWatch<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
}

export const TagsInput = ({ watch, setValue }: Props) => {
    const [tagInput, setTagInput] = useState('');
    const tags = watch('tags') || [];

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (!trimmed) return;
        if (!tags.includes(trimmed)) {
            setValue('tags', [...tags, trimmed]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (value: string) => {
        setValue(
            'tags',
            tags.filter(t => t !== value)
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <label className='text-xs font-bold tracking-tight capitalize text-slate-900'>
                Palabras clave / Tags
            </label>
            <div className='flex flex-col gap-2 sm:flex-row'>
                <input
                    type='text'
                    placeholder='Escribe una etiqueta y presiona Agregar…'
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                />
                <button
                    type='button'
                    onClick={handleAddTag}
                    className='mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:mt-0'
                >
                    Agregar
                </button>
            </div>
            {tags.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                    {tags.map(tag => (
                        <span
                            key={tag}
                            className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'
                        >
                            <span>{tag}</span>
                            <button
                                type='button'
                                onClick={() => handleRemoveTag(tag)}
                                className='text-[11px] hover:text-primary/80'
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
