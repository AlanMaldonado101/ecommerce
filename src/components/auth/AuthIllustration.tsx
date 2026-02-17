interface Props {
	title: React.ReactNode;
	subtitle: string;
	avatarLabel: string;
}

const ILLUSTRATION_URL =
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCLBu8JXIYY2TnVrEZ_vYx6W7IhuH49xRAye8RYiZj2aRp1qJf8oF9ZUou6FR1hvIRGHNMrp-9uh6DeLkSgmir5Hx5tUwCVjlVMRdixNC-TU7AAxdTN2rSt6D-X-u-JGYJ17FO0j0mYKwivUuOd8c7r44_cqyTcxnEqrpRyGMMPzFy9X3kp6mWrglZ0pdepkFeSL8hsD3hsde_O_4nDpDvNRN8pSA-pIahEECzRoFzI00YCNvIzcZFnHmrJxh-_hzmO92dJy9YE5Jc';

export const AuthIllustration = ({ title, subtitle, avatarLabel }: Props) => (
	<div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-primary/10 px-12 py-20 text-center">
		<div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-accent-pink/20 blur-2xl" />
		<div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
		<div className="relative z-10 flex flex-col items-center">
			<div className="-rotate-3 mb-12 inline-flex transform items-center justify-center rounded-2xl bg-white p-5 shadow-lg transition-transform duration-300 hover:rotate-0">
				<img
					src={ILLUSTRATION_URL}
					alt="Tiendita de Jireh"
					className="h-72 w-72 rounded-lg object-cover"
				/>
			</div>
			<h2 className="mb-6 text-4xl font-extrabold tracking-tight">{title}</h2>
			<p className="mx-auto max-w-sm text-lg leading-relaxed opacity-80">
				{subtitle}
			</p>
			<div className="mt-16 flex justify-center gap-4">
				<div className="flex -space-x-4">
					<div className="h-10 w-10 rounded-full border-2 border-white bg-primary/30" />
					<div className="h-10 w-10 rounded-full border-2 border-white bg-primary/40" />
					<div className="h-10 w-10 rounded-full border-2 border-white bg-primary/50" />
					<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-accent-pink text-xs font-bold text-white">
						+5k
					</div>
				</div>
				<span className="self-center text-sm font-medium opacity-70">
					{avatarLabel}
				</span>
			</div>
		</div>
	</div>
);
