import { PreparedProducts } from '../../interfaces';
import { CardProduct } from '../products/CardProduct';

interface Props {
	title: string;
	products: PreparedProducts[];
}

export const ProductGrid = ({ title, products }: Props) => {
	return (
		<section className="py-12">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900">
					{title}
				</h2>
				<p className="text-slate-500">
					Lo más vendido y las últimas novedades.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
				{products.map(product => (
					<CardProduct
						key={product.id}
						name={product.name}
						price={product.price}
						colors={product.colors}
						img={product.images[0]}
						slug={product.slug}
						variants={product.variants}
					/>
				))}
			</div>
		</section>
	);
};
