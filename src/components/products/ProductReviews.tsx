import { useState, useMemo } from 'react';
import { useReviewsStore } from '../../store/reviews.store';
import { formatDateShort } from '../../helpers';
import toast from 'react-hot-toast';
import { HiStar, HiOutlineStar } from 'react-icons/hi';

interface Props {
    productId: string;
}

export const ProductReviews = ({ productId }: Props) => {
    const { reviews, addReview, getReviewsByProduct, getAverageRating } = useReviewsStore();
    const productReviews = useMemo(() => getReviewsByProduct(productId), [reviews, productId, getReviewsByProduct]);
    const averageRating = useMemo(() => getAverageRating(productId), [reviews, productId, getAverageRating]);

    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Por favor selecciona una calificación', { position: 'bottom-right' });
            return;
        }

        if (!author.trim() || !comment.trim()) {
            toast.error('Por favor completa todos los campos', { position: 'bottom-right' });
            return;
        }

        setIsSubmitting(true);

        // Simulate network delay for better UX
        setTimeout(() => {
            addReview({
                productId,
                author: author.trim(),
                rating,
                comment: comment.trim(),
            });

            setAuthor('');
            setRating(0);
            setComment('');
            setIsSubmitting(false);

            toast.success('Reseña publicada con éxito!', { position: 'bottom-right' });
        }, 600);
    };

    const renderStars = (ratingValue: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    star <= ratingValue ? (
                        <HiStar key={star} className="text-yellow-400 text-lg" />
                    ) : (
                        <HiOutlineStar key={star} className="text-yellow-400 text-lg" />
                    )
                ))}
            </div>
        );
    };

    return (
        <div className="mt-16 rounded-2xl border border-primary/10 bg-white p-6 md:p-10 shadow-sm">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#292524] flex items-center gap-2">
                        Reseñas del Producto
                        <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                            {productReviews.length}
                        </span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                star <= Math.round(averageRating) ? (
                                    <HiStar key={star} className="text-yellow-400 text-2xl" />
                                ) : (
                                    <HiOutlineStar key={star} className="text-yellow-400 text-2xl" />
                                )
                            ))}
                        </div>
                        <span className="text-xl font-bold text-[#292524]">{averageRating.toFixed(1)}</span>
                        <span className="text-sm text-[#64748b]">de 5 estrellas</span>
                    </div>
                </div>
                <p className="text-sm text-[#64748b] max-w-sm">
                    Las opiniones de nuestros clientes nos ayudan a mejorar. ¡Comparte tu experiencia!
                </p>
            </div>

            <div className="grid gap-10 md:grid-cols-[1fr_400px]">
                {/* Lista de Reseñas */}
                <div className="space-y-6">
                    {productReviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
                            <span className="material-icons-outlined text-4xl text-primary/40 mb-3">rate_review</span>
                            <h3 className="text-lg font-semibold text-[#292524] mb-1">Aún no hay reseñas</h3>
                            <p className="text-sm text-[#64748b]">
                                Sé el primero en calificar este producto y contarle a otros tu experiencia.
                            </p>
                        </div>
                    ) : (
                        productReviews.map((review) => (
                            <div key={review.id} className="rounded-xl border border-slate-100 p-6 transition-colors hover:bg-slate-50">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                            {review.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#292524] leading-none mb-1">{review.author}</p>
                                            <p className="text-xs text-[#64748b]">{formatDateShort(review.date)}</p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-[#475569] leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Formulario de Reseña */}
                <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 h-fit">
                    <h3 className="mb-4 text-lg font-bold text-[#292524]">Escribe una reseña</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#64748b]">
                                Tu calificación *
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        {star <= (hoverRating || rating) ? (
                                            <HiStar className="text-yellow-400 text-3xl" />
                                        ) : (
                                            <HiOutlineStar className="text-yellow-400 text-3xl" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-[#64748b]">
                                Nombre *
                            </label>
                            <input
                                id="author"
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Ej: María Gómez"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-[#64748b]">
                                Comentario *
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="¿Qué te pareció el producto? ¿Lo recomendarías?"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-3 flex justify-center items-center h-12"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                'Publicar Reseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
