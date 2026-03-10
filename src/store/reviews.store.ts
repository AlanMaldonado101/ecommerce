import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface Review {
    id: string;
    productId: string;
    author: string;
    rating: number; // 1 to 5
    comment: string;
    date: string;
}

interface ReviewsState {
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'date'>) => void;
    getReviewsByProduct: (productId: string) => Review[];
    getAverageRating: (productId: string) => number;
}

export const useReviewsStore = create<ReviewsState>()(
    devtools(
        persist(
            (set, get) => ({
                reviews: [],

                addReview: (reviewData) => {
                    // Add an artificial delay to simulate network request
                    const newReview: Review = {
                        ...reviewData,
                        id: Math.random().toString(36).substring(2, 9), // Simple generic ID generator
                        date: new Date().toISOString(),
                    };

                    set((state) => ({
                        reviews: [newReview, ...state.reviews], // Prepend to show newest first
                    }), false, 'ADD_REVIEW');
                },

                getReviewsByProduct: (productId) => {
                    return get().reviews.filter(review => review.productId === productId);
                },

                getAverageRating: (productId) => {
                    const productReviews = get().reviews.filter(review => review.productId === productId);
                    if (productReviews.length === 0) return 0;

                    const sum = productReviews.reduce((acc, current) => acc + current.rating, 0);
                    return Number((sum / productReviews.length).toFixed(1));
                }
            }),
            {
                name: 'reviews-storage', // name of the item in the storage (must be unique)
            }
        )
    )
);
