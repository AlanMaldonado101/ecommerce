import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';
import { useAttributes } from '../../../hooks';
import { Loader } from '../../shared/Loader';

interface Props {
    watch: UseFormWatch<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
}

export const OccasionsInput = ({ watch, setValue }: Props) => {
    const { occasions, isLoadingOccasions } = useAttributes();
    const selectedOccasions = watch('occasion_ids') || [];

    const handleToggleOccasion = (id: string) => {
        const current = selectedOccasions;
        if (current.includes(id)) {
            setValue(
                'occasion_ids',
                current.filter(item => item !== id)
            );
        } else {
            setValue('occasion_ids', [...current, id]);
        }
    };

    if (isLoadingOccasions) return <Loader />;

    return (
        <div className='flex flex-col gap-2'>
            <label className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                Ocasión / Temática
            </label>
            <div className='flex flex-wrap gap-2'>
                {occasions.map(occasion => {
                    const isActive = selectedOccasions.includes(occasion.id);
                    return (
                        <button
                            key={occasion.id}
                            type='button'
                            onClick={() => handleToggleOccasion(occasion.id)}
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive
                                    ? 'border-primary bg-primary text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-primary/5'
                                }`}
                        >
                            {occasion.name}
                        </button>
                    );
                })}
            </div>
            {occasions.length === 0 && (
                <p className='text-xs text-slate-400'>
                    No hay ocasiones disponibles.
                </p>
            )}
        </div>
    );
};
