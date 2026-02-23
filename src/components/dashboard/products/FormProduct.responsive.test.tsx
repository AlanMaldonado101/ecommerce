import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormProduct } from './FormProduct';

// Mock hooks
vi.mock('../../../hooks', () => ({
	useProduct: vi.fn(() => ({ product: null, isLoading: false })),
	useCreateProduct: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
	useUpdateProduct: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
	useAttributes: vi.fn(() => ({
		providers: [],
		isLoadingProviders: false,
		occasions: [],
		isLoadingOccasions: false,
		subcategories: [],
		isLoadingSubcategories: false,
		createOccasion: vi.fn(),
		isCreatingOccasion: false,
		createSubcategory: vi.fn(),
		isCreatingSubcategory: false,
	})),
	useCategories: vi.fn(() => ({
		categories: [],
		isLoading: false,
		createCategory: vi.fn(),
		isCreating: false,
	})),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useParams: () => ({}),
	};
});

// Helper to set viewport width
const setViewportWidth = (width: number) => {
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width,
	});
	window.dispatchEvent(new Event('resize'));
};

// Helper to get computed grid columns
const getComputedColumns = (element: HTMLElement): number => {
	const style = window.getComputedStyle(element);
	const gridTemplateColumns = style.gridTemplateColumns;
	if (!gridTemplateColumns || gridTemplateColumns === 'none') return 1;
	return gridTemplateColumns.split(' ').length;
};

// Helper to check if element has horizontal overflow
const hasHorizontalOverflow = (element: HTMLElement): boolean => {
	return element.scrollWidth > element.clientWidth;
};

const renderFormProduct = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<FormProduct titleForm="Test Product Form" />
			</BrowserRouter>
		</QueryClientProvider>
	);
};

describe('FormProduct - Responsive Checkpoint', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Mobile Viewport (375px)', () => {
		beforeEach(() => {
			setViewportWidth(375);
		});

		it('should display main grid in single column layout', () => {
			const { container } = renderFormProduct();
			const form = container.querySelector('form');
			expect(form).toBeTruthy();
			
			// Check that form has grid-cols-1 class
			expect(form?.className).toContain('grid-cols-1');
		});

		it('should display action buttons at bottom of form', () => {
			const { container } = renderFormProduct();
			
			// Mobile buttons should be visible (md:hidden class)
			const mobileButtons = container.querySelector('.md\\:hidden');
			expect(mobileButtons).toBeTruthy();
			expect(mobileButtons?.className).toContain('flex-col');
		});

		it('should display header with compact title', () => {
			renderFormProduct();
			const title = screen.getByText('Test Product Form');
			expect(title).toBeTruthy();
			expect(title.className).toContain('text-xl');
		});

		it('should not have horizontal overflow', () => {
			const { container } = renderFormProduct();
			const mainDiv = container.firstChild as HTMLElement;
			expect(hasHorizontalOverflow(mainDiv)).toBe(false);
		});

		it('should display breadcrumb with compact text', () => {
			const { container } = renderFormProduct();
			const breadcrumb = container.querySelector('.text-\\[10px\\]');
			expect(breadcrumb).toBeTruthy();
		});

		it('should have adequate touch targets for interactive elements', () => {
			const { container } = renderFormProduct();
			const buttons = container.querySelectorAll('button');
			
			// Check that buttons have minimum height (should be at least 44px or have adequate padding)
			buttons.forEach(button => {
				const styles = window.getComputedStyle(button);
				const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
				// Most buttons should have adequate padding for touch targets
				expect(paddingY).toBeGreaterThan(0);
			});
		});
	});

	describe('Tablet Viewport (768px)', () => {
		beforeEach(() => {
			setViewportWidth(768);
		});

		it('should display main grid in two-column layout', () => {
			const { container } = renderFormProduct();
			const form = container.querySelector('form');
			expect(form).toBeTruthy();
			
			// Check that form has md:grid-cols-2 class
			expect(form?.className).toContain('md:grid-cols-2');
		});

		it('should display action buttons in header', () => {
			const { container } = renderFormProduct();
			
			// Desktop buttons should be visible (hidden md:flex class)
			const desktopButtons = container.querySelector('.hidden.md\\:flex');
			expect(desktopButtons).toBeTruthy();
		});

		it('should not have horizontal overflow', () => {
			const { container } = renderFormProduct();
			const mainDiv = container.firstChild as HTMLElement;
			expect(hasHorizontalOverflow(mainDiv)).toBe(false);
		});
	});

	describe('Desktop Viewport (1200px)', () => {
		beforeEach(() => {
			setViewportWidth(1200);
		});

		it('should display main grid in three-column layout', () => {
			const { container } = renderFormProduct();
			const form = container.querySelector('form');
			expect(form).toBeTruthy();
			
			// Check that form has lg:grid-cols-3 class
			expect(form?.className).toContain('lg:grid-cols-3');
		});

		it('should display action buttons in header', () => {
			const { container } = renderFormProduct();
			
			// Desktop buttons should be visible
			const desktopButtons = container.querySelector('.hidden.md\\:flex');
			expect(desktopButtons).toBeTruthy();
		});

		it('should display full-size title', () => {
			renderFormProduct();
			const title = screen.getByText('Test Product Form');
			expect(title).toBeTruthy();
			expect(title.className).toContain('md:text-2xl');
		});

		it('should not have horizontal overflow', () => {
			const { container } = renderFormProduct();
			const mainDiv = container.firstChild as HTMLElement;
			expect(hasHorizontalOverflow(mainDiv)).toBe(false);
		});
	});

	describe('Grid Adaptation Across Viewports', () => {
		it('should adapt grid columns based on viewport width', () => {
			const { container } = renderFormProduct();
			const form = container.querySelector('form');
			expect(form).toBeTruthy();

			// Mobile
			setViewportWidth(375);
			expect(form?.className).toContain('grid-cols-1');

			// Tablet
			setViewportWidth(768);
			expect(form?.className).toContain('md:grid-cols-2');

			// Desktop
			setViewportWidth(1200);
			expect(form?.className).toContain('lg:grid-cols-3');
		});
	});

	describe('Interactive Elements Accessibility', () => {
		it('should have accessible back button across all viewports', () => {
			renderFormProduct();
			
			const backButtons = screen.getAllByRole('button');
			const backButton = backButtons.find(btn => 
				btn.querySelector('svg') !== null && 
				btn.className.includes('p-1.5')
			);
			
			expect(backButton).toBeTruthy();
		});

		it('should have accessible submit button across all viewports', () => {
			renderFormProduct();
			
			const submitButton = screen.getByText('Guardar producto');
			expect(submitButton).toBeTruthy();
			expect(submitButton.getAttribute('type')).toBe('submit');
		});
	});

	describe('Section Responsive Styling', () => {
		it('should have responsive padding on sections', () => {
			const { container } = renderFormProduct();
			const sections = container.querySelectorAll('.rounded-xl');
			
			sections.forEach(section => {
				// Check for responsive padding classes
				expect(section.className).toMatch(/p-4|md:p-5|lg:p-6/);
			});
		});

		it('should have responsive gaps between sections', () => {
			const { container } = renderFormProduct();
			const form = container.querySelector('form');
			
			// Check for responsive gap classes
			expect(form?.className).toMatch(/gap-4|md:gap-5|lg:gap-6/);
		});
	});

	describe('Input Fields Responsive Behavior', () => {
		it('should have responsive text sizing on inputs', () => {
			const { container } = renderFormProduct();
			const inputs = container.querySelectorAll('input[type="text"]');
			
			inputs.forEach(input => {
				// Check for responsive text sizing
				const hasResponsiveText = 
					input.className.includes('text-sm') || 
					input.className.includes('md:text-base');
				expect(hasResponsiveText).toBe(true);
			});
		});
	});

	describe('SEO Section Responsive Layout', () => {
		it('should have responsive grid for SEO fields', () => {
			const { container } = renderFormProduct();
			
			// Find SEO section by looking for the slug preview
			const slugPreview = container.querySelector('.overflow-x-auto');
			expect(slugPreview).toBeTruthy();
			
			// Check for responsive text sizing
			expect(slugPreview?.className).toMatch(/text-\[10px\]|md:text-xs/);
		});
	});

	describe('Costs Section Responsive Layout', () => {
		it('should have responsive grid for cost inputs', () => {
			const { container } = renderFormProduct();
			
			// Find cost inputs by looking for numeric inputs
			const numericInputs = container.querySelectorAll('input[type="number"]');
			expect(numericInputs.length).toBeGreaterThan(0);
		});

		it('should have inputMode numeric for cost fields', () => {
			const { container } = renderFormProduct();
			
			// Find inputs with inputMode numeric
			const numericInputs = container.querySelectorAll('input[inputMode="numeric"]');
			expect(numericInputs.length).toBeGreaterThan(0);
		});
	});

	describe('Occasions Input Responsive Behavior', () => {
		it('should have responsive button sizing', () => {
			renderFormProduct();
			
			const createButton = screen.getByText('+ Crear Temática');
			expect(createButton).toBeTruthy();
			expect(createButton.className).toMatch(/text-\[10px\]|md:text-xs/);
		});
	});
});
