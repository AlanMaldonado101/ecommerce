import { useQuery } from '@tanstack/react-query';
import { getRandomProducts } from '../../actions';
import { prepareProducts } from '../../helpers';
import { Product } from '../../interfaces';
import { CardProduct } from './CardProduct';

export const RelatedProducts = () => {
    const { data: randomProducts = [], isLoading } = useQuery({
        queryKey: ['related-products-random'],
        queryFn: getRandomProducts,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="mt-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
        );
    }

    if (!randomProducts || randomProducts.length === 0) {
        return null;
    }

    const preparedProducts = prepareProducts(randomProducts as unknown as Product[]);

    return (
        <div className="mt-20 border-t border-slate-100 pt-16">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#292524] md:text-3xl">
                    Productos que pueden gustarte
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {preparedProducts.map((product) => (
                    <CardProduct
                        key={product.id}
                        img={product.images[0] ?? ''}
                        name={product.name}
                        price={product.price}
                        slug={product.slug}
                        colors={product.colors}
                        variants={product.variants}
                    />
                ))}
            </div>
        </div>
    );
};
