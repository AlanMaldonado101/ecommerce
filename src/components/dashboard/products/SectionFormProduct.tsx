import { ReactNode } from 'react';

interface Props {
	className?: string;
	titleSection?: string;
	children: ReactNode;
}

export const SectionFormProduct = ({
	className,
	titleSection,
	children,
}: Props) => {
	return (
		<div
			className={`flex h-fit flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-primary/5 ${className}`}
		>
			{titleSection && (
				<div className='flex items-center gap-2'>
					<span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/5 text-sm'>
						<span className='material-icons-outlined text-primary text-base'>
							auto_awesome
						</span>
					</span>
					<h2 className='text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500'>
						{titleSection}
					</h2>
				</div>
			)}
			{children}
		</div>
	);
};
