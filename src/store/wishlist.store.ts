import { StateCreator, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { VariantProduct } from '../interfaces';

export interface WishlistItem {
    id: string; // We'll use the product slug as the ID
    slug: string;
    name: string;
    price: number;
    image: string;
    colors: { name: string; color: string }[];
    variants: VariantProduct[];
}

export interface WishlistState {
    items: WishlistItem[];
    totalItems: number;

    addItem: (item: WishlistItem) => void;
    removeItem: (slug: string) => void;
    toggleItem: (item: WishlistItem) => void;
    cleanWishlist: () => void;
    isInWishlist: (slug: string) => boolean;
}

const storeApi: StateCreator<WishlistState> = (set, get) => ({
    items: [],
    totalItems: 0,

    addItem: item => {
        set(state => {
            const existingItem = state.items.find(i => i.slug === item.slug);
            if (existingItem) return state; // Already in wishlist

            const updatedItems = [...state.items, item];
            return {
                items: updatedItems,
                totalItems: updatedItems.length,
            };
        });
    },

    removeItem: slug => {
        set(state => {
            const updatedItems = state.items.filter(i => i.slug !== slug);
            return {
                items: updatedItems,
                totalItems: updatedItems.length,
            };
        });
    },

    toggleItem: item => {
        const state = get();
        const exists = state.items.some(i => i.slug === item.slug);
        if (exists) {
            state.removeItem(item.slug);
        } else {
            state.addItem(item);
        }
    },

    cleanWishlist: () => {
        set({ items: [], totalItems: 0 });
    },

    isInWishlist: slug => {
        return get().items.some(i => i.slug === slug);
    },
});

export const useWishlistStore = create<WishlistState>()(
    devtools(
        persist(storeApi, {
            name: 'wishlist-store',
        })
    )
);
