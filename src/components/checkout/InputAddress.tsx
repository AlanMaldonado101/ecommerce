import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { AddressFormValues } from '../../lib/validators';

interface Props {
	register: UseFormRegister<AddressFormValues>;
	errors: FieldErrors<AddressFormValues>;

	name: keyof AddressFormValues;
	className?: string;
	placeholder: string;
}

export const InputAddress = ({
	register,
	errors,
	name,
	className,
	placeholder,
}: Props) => {
	return (
		<>
			<div
				className={`soft-input overflow-hidden py-2.5 px-3 ${
					errors[name] ? 'border-red-400' : ''
				} ${className}`}
			>
				<input
					type='text'
					className='w-full bg-transparent text-sm text-[#292524] placeholder:text-[#64748b]/70 focus:outline-none'
					placeholder={placeholder}
					{...register(name)}
				/>
			</div>
			{errors[name] && (
				<p className='mt-1 text-xs text-red-500'>
					{errors[name].message}
				</p>
			)}
		</>
	);
};
