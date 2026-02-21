import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useGlobalStore } from '../../store/global.store';
import { useCartStore } from '../../store/cart.store';
import '@testing-library/jest-dom';

// Mock the hooks
vi.mock('../../hooks', () => ({
	useUser: () => ({
		session: null,
		isLoading: false,
	}),
	useCustomer: () => ({
		data: null,
	}),
}));

// Helper to render Navbar with Router
const renderNavbar = () => {
	return render(
		<BrowserRouter>
			<Navbar />
		</BrowserRouter>
	);
};

describe('Navbar - Zustand Store Integration', () => {
	beforeEach(() => {
		// Reset stores before each test
		useGlobalStore.setState({
			isSheetOpen: false,
			sheetContent: null,
			activeNavMobile: false,
		});
		useCartStore.setState({
			items: [],
			totalItemsInCart: 0,
			totalAmount: 0,
		});
	});

	describe('openSheet integration for search', () => {
		it('should call openSheet with "search" when search icon is clicked', async () => {
			const user = userEvent.setup();
			renderNavbar();

			// Get initial state
			const initialState = useGlobalStore.getState();
			expect(initialState.isSheetOpen).toBe(false);
			expect(initialState.sheetContent).toBe(null);

			// Find and click search button
			const searchButton = screen.getByTitle('Buscar');
			await user.click(searchButton);

			// Verify store was updated
			await waitFor(() => {
				const state = useGlobalStore.getState();
				expect(state.isSheetOpen).toBe(true);
				expect(state.sheetContent).toBe('search');
			});
		});

		it('should update store state reactively when search icon is clicked multiple times', async () => {
			const user = userEvent.setup();
			renderNavbar();

			const searchButton = screen.getByTitle('Buscar');

			// Click search button
			await user.click(searchButton);
			await waitFor(() => {
				expect(useGlobalStore.getState().sheetContent).toBe('search');
			});

			// Close the sheet manually
			useGlobalStore.getState().closeSheet();
			await waitFor(() => {
				expect(useGlobalStore.getState().isSheetOpen).toBe(false);
			});

			// Click again
			await user.click(searchButton);
			await waitFor(() => {
				expect(useGlobalStore.getState().isSheetOpen).toBe(true);
				expect(useGlobalStore.getState().sheetContent).toBe('search');
			});
		});
	});

	describe('openSheet integration for cart', () => {
		it('should call openSheet with "cart" when cart icon is clicked', async () => {
			const user = userEvent.setup();
			renderNavbar();

			// Get initial state
			const initialState = useGlobalStore.getState();
			expect(initialState.isSheetOpen).toBe(false);
			expect(initialState.sheetContent).toBe(null);

			// Find and click cart button
			const cartButton = screen.getByTitle('Carrito');
			await user.click(cartButton);

			// Verify store was updated
			await waitFor(() => {
				const state = useGlobalStore.getState();
				expect(state.isSheetOpen).toBe(true);
				expect(state.sheetContent).toBe('cart');
			});
		});

		it('should update store state reactively when cart icon is clicked multiple times', async () => {
			const user = userEvent.setup();
			renderNavbar();

			const cartButton = screen.getByTitle('Carrito');

			// Click cart button
			await user.click(cartButton);
			await waitFor(() => {
				expect(useGlobalStore.getState().sheetContent).toBe('cart');
			});

			// Close the sheet manually
			useGlobalStore.getState().closeSheet();
			await waitFor(() => {
				expect(useGlobalStore.getState().isSheetOpen).toBe(false);
			});

			// Click again
			await user.click(cartButton);
			await waitFor(() => {
				expect(useGlobalStore.getState().isSheetOpen).toBe(true);
				expect(useGlobalStore.getState().sheetContent).toBe('cart');
			});
		});
	});

	describe('totalItemsInCart reactive updates', () => {
		it('should not display badge when cart is empty', () => {
			renderNavbar();

			// Verify badge is not visible
			const badge = screen.queryByText('0');
			expect(badge).not.toBeInTheDocument();
		});

		it('should display badge when totalItemsInCart is updated', async () => {
			renderNavbar();

			// Update cart store
			useCartStore.setState({
				items: [
					{
						variantId: '1',
						productId: 'prod-1',
						name: 'Test Product',
						price: 100,
						quantity: 3,
						image: 'test.jpg',
						color: 'Black',
						storage: '128GB',
					},
				],
				totalItemsInCart: 3,
				totalAmount: 300,
			});

			// Verify badge is visible with correct count
			await waitFor(() => {
				const badge = screen.getByText('3');
				expect(badge).toBeInTheDocument();
			});
		});

		it('should update badge reactively when items are added to cart', async () => {
			renderNavbar();

			// Initially empty
			expect(screen.queryByText('1')).not.toBeInTheDocument();

			// Add item to cart
			useCartStore.getState().addItem({
				variantId: '1',
				productId: 'prod-1',
				name: 'Test Product',
				price: 100,
				quantity: 1,
				image: 'test.jpg',
				color: 'Black',
				storage: '128GB',
			});

			// Verify badge appears
			await waitFor(() => {
				expect(screen.getByText('1')).toBeInTheDocument();
			});

			// Add another item
			useCartStore.getState().addItem({
				variantId: '2',
				productId: 'prod-2',
				name: 'Test Product 2',
				price: 200,
				quantity: 2,
				image: 'test2.jpg',
				color: 'White',
				storage: '256GB',
			});

			// Verify badge updates
			await waitFor(() => {
				expect(screen.getByText('3')).toBeInTheDocument();
			});
		});

		it('should update badge reactively when items are removed from cart', async () => {
			// Start with items in cart
			useCartStore.setState({
				items: [
					{
						variantId: '1',
						productId: 'prod-1',
						name: 'Test Product',
						price: 100,
						quantity: 2,
						image: 'test.jpg',
						color: 'Black',
						storage: '128GB',
					},
					{
						variantId: '2',
						productId: 'prod-2',
						name: 'Test Product 2',
						price: 200,
						quantity: 1,
						image: 'test2.jpg',
						color: 'White',
						storage: '256GB',
					},
				],
				totalItemsInCart: 3,
				totalAmount: 400,
			});

			renderNavbar();

			// Verify initial count
			await waitFor(() => {
				expect(screen.getByText('3')).toBeInTheDocument();
			});

			// Remove an item
			useCartStore.getState().removeItem('2');

			// Verify badge updates
			await waitFor(() => {
				expect(screen.getByText('2')).toBeInTheDocument();
			});

			// Remove all items
			useCartStore.getState().cleanCart();

			// Verify badge disappears
			await waitFor(() => {
				expect(screen.queryByText('2')).not.toBeInTheDocument();
			});
		});

		it('should update badge reactively when item quantity is updated', async () => {
			// Start with items in cart
			useCartStore.setState({
				items: [
					{
						variantId: '1',
						productId: 'prod-1',
						name: 'Test Product',
						price: 100,
						quantity: 2,
						image: 'test.jpg',
						color: 'Black',
						storage: '128GB',
					},
				],
				totalItemsInCart: 2,
				totalAmount: 200,
			});

			renderNavbar();

			// Verify initial count
			await waitFor(() => {
				expect(screen.getByText('2')).toBeInTheDocument();
			});

			// Update quantity
			useCartStore.getState().updateQuantity('1', 5);

			// Verify badge updates
			await waitFor(() => {
				expect(screen.getByText('5')).toBeInTheDocument();
			});
		});
	});

	describe('setActiveNavMobile integration', () => {
		it('should call setActiveNavMobile when hamburger menu is clicked', async () => {
			const user = userEvent.setup();
			renderNavbar();

			// Get initial state
			const initialState = useGlobalStore.getState();
			expect(initialState.activeNavMobile).toBe(false);

			// Find and click hamburger menu (only visible on mobile)
			const buttons = screen.getAllByRole('button');
			const hamburger = buttons.find(btn => 
				btn.querySelector('svg') && 
				btn.className.includes('md:hidden')
			);

			expect(hamburger).toBeDefined();
			await user.click(hamburger!);

			// Verify store was updated
			await waitFor(() => {
				const state = useGlobalStore.getState();
				expect(state.activeNavMobile).toBe(true);
			});
		});

		it('should update store state reactively when hamburger is clicked multiple times', async () => {
			const user = userEvent.setup();
			renderNavbar();

			const buttons = screen.getAllByRole('button');
			const hamburger = buttons.find(btn => 
				btn.querySelector('svg') && 
				btn.className.includes('md:hidden')
			);

			// Click hamburger
			await user.click(hamburger!);
			await waitFor(() => {
				expect(useGlobalStore.getState().activeNavMobile).toBe(true);
			});

			// Close manually
			useGlobalStore.getState().setActiveNavMobile(false);
			await waitFor(() => {
				expect(useGlobalStore.getState().activeNavMobile).toBe(false);
			});

			// Click again
			await user.click(hamburger!);
			await waitFor(() => {
				expect(useGlobalStore.getState().activeNavMobile).toBe(true);
			});
		});
	});

	describe('Store integration - Combined scenarios', () => {
		it('should handle multiple store interactions correctly', async () => {
			const user = userEvent.setup();
			renderNavbar();

			// Add items to cart
			useCartStore.getState().addItem({
				variantId: '1',
				productId: 'prod-1',
				name: 'Test Product',
				price: 100,
				quantity: 2,
				image: 'test.jpg',
				color: 'Black',
				storage: '128GB',
			});

			// Verify badge appears
			await waitFor(() => {
				expect(screen.getByText('2')).toBeInTheDocument();
			});

			// Open search sheet
			const searchButton = screen.getByTitle('Buscar');
			await user.click(searchButton);

			await waitFor(() => {
				const state = useGlobalStore.getState();
				expect(state.isSheetOpen).toBe(true);
				expect(state.sheetContent).toBe('search');
			});

			// Close and open cart sheet
			useGlobalStore.getState().closeSheet();
			const cartButton = screen.getByTitle('Carrito');
			await user.click(cartButton);

			await waitFor(() => {
				const state = useGlobalStore.getState();
				expect(state.isSheetOpen).toBe(true);
				expect(state.sheetContent).toBe('cart');
			});

			// Badge should still be visible
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		it('should maintain cart count while toggling mobile nav', async () => {
			const user = userEvent.setup();
			renderNavbar();

			// Add items to cart
			useCartStore.setState({
				items: [
					{
						variantId: '1',
						productId: 'prod-1',
						name: 'Test Product',
						price: 100,
						quantity: 5,
						image: 'test.jpg',
						color: 'Black',
						storage: '128GB',
					},
				],
				totalItemsInCart: 5,
				totalAmount: 500,
			});

			await waitFor(() => {
				expect(screen.getByText('5')).toBeInTheDocument();
			});

			// Toggle mobile nav
			const buttons = screen.getAllByRole('button');
			const hamburger = buttons.find(btn => 
				btn.querySelector('svg') && 
				btn.className.includes('md:hidden')
			);

			await user.click(hamburger!);

			await waitFor(() => {
				expect(useGlobalStore.getState().activeNavMobile).toBe(true);
			});

			// Cart count should still be visible
			expect(screen.getByText('5')).toBeInTheDocument();
		});
	});
});
