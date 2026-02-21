import { Link } from 'react-router-dom';

interface Props {
	isDashboard?: boolean;
}

export const Logo = ({ isDashboard }: Props) => {
	return (
		<Link
			to="/"
			className={`flex flex-shrink-0 items-center gap-3 transition-all ${
				isDashboard ? 'hover:scale-105' : ''
			}`}
		>
			<div className="flex h-12 w-12 items-center justify-center overflow-hidden sm:h-14 sm:w-14">
				<img
					src="/logo-jireh.png"
					alt="Logo Tiendita Jireh"
					className="h-full w-full object-contain"
				/>
			</div>
			{isDashboard && (
				<span className="text-2xl font-extrabold tracking-tight text-primary">
					Tiendita Jireh
				</span>
			)}
		</Link>
	);
};
