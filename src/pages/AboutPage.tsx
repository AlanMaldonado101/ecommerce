export const AboutPage = () => {
	return (
		<div className='space-y-5'>
			<h1 className='text-center text-4xl font-semibold tracking-tight mb-5'>
				Nuestra empresa
			</h1>

			<img
				src='https://plus.unsplash.com/premium_photo-1682716270464-9a91cbbcf3b7?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWRpZmljaW8lMjBkZSUyMGxhJTIwZW1wcmVzYXxlbnwwfHwwfHx8MA%3D%3D'
				alt='Imagen de fondo'
				className='h-[500px] w-full object-cover'
			/>

			<div className='flex flex-col gap-4 tracking-tighter leading-7 text-sm font-medium text-slate-800'>
				<p>
					Tiendita Jireh es una tienda en línea dedicada a la venta de artículos para fiestas, fundada en 2021. Nuestro objetivo es ofrecer la mejor calidad y precio en globos, decoración y todo lo que necesitas para celebrar. Contamos con un equipo que selecciona los mejores productos para tu fiesta.
				</p>

				<p>
					En Tiendita Jireh encontrarás una amplia variedad de productos para cumpleaños, eventos y celebraciones. Además, promociones y descuentos exclusivos para que armes tu fiesta al mejor precio.
				</p>

				<h2 className='text-3xl font-semibold tracking-tight mt-8 mb-4'>
					¡No esperes más y compra en Tiendita Jireh!
				</h2>

				<p>
					Para más información, contáctanos por correo:{' '}
					<a href='mailto:contacto@tienditadejireh.com'>
						contacto@tienditadejireh.com
					</a>{' '}
					o al <a href='tel:333333333'>3333333333</a>
				</p>
			</div>
		</div>
	);
};
