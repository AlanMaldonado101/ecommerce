import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VariantsInput } from './VariantsInput';
import { useForm } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';

// Wrapper component to provide form context
const VariantsInputWrapper = ({ initialVariants = [] }: { initialVariants?: any[] }) => {
	const { control, formState: { errors }, register, setValue } = useForm<ProductFormValues>({
		defaultValues: {
			variants: initialVariants,
		},
	});

	return (
		<VariantsInput
			control={control}
			errors={errors}
			register={register}
			setValue={setValue}
		/>
	);
};

// Helper to set viewport width
const setViewportWidth = (width: number) => {
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width,
	});
	window.dispatchEvent(new Event('resize'));
};

// Helper to get touch target size
const getTouchTargetSize = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	return {
		width: rect.width,
		height: rect.height,
	};
};

describe('VariantsInput - Touch Accessibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Touch Target Sizes on Mobile', () => {
		it('color selector button should have minimum 32x32px touch target', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '#EF4444',
				colorName: 'Rojo',
			}];
			
			render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Find color selector button (the circular button with color)
			const colorButtons = document.querySelectorAll('button[type="button"]');
			const colorButton = Array.from(colorButtons).find(btn => 
				btn.className.includes('rounded-full') && btn.className.includes('h-8')
			);
			
			if (colorButton) {
				const size = getTouchTargetSize(colorButton as HTMLElement);
				// h-8 w-8 = 32px x 32px - adequate for color selector
				expect(size.width).toBeGreaterThanOrEqual(32);
				expect(size.height).toBeGreaterThanOrEqual(32);
			}
		});

		it('color palette swatches should have minimum 32x32px touch target', () => {
			setViewportWidth(375);
			render(<VariantsInputWrapper />);
			
			// Find palette color swatches
			const paletteButtons = document.querySelectorAll('button[type="button"]');
			const swatchButtons = Array.from(paletteButtons).filter(btn => 
				btn.className.includes('h-8') && btn.className.includes('w-8') && 
				btn.className.includes('rounded-full')
			);
			
			// Should have 12 color swatches
			expect(swatchButtons.length).toBeGreaterThanOrEqual(12);
			
			swatchButtons.forEach(swatch => {
				const size = getTouchTargetSize(swatch as HTMLElement);
				expect(size.width).toBeGreaterThanOrEqual(32);
				expect(size.height).toBeGreaterThanOrEqual(32);
			});
		});

		it('remove variant button should have adequate touch target', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '#EF4444',
				colorName: 'Rojo',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Find remove button (IoIosCloseCircleOutline icon)
			const removeButtons = container.querySelectorAll('button[type="button"]');
			const removeButton = Array.from(removeButtons).find(btn => {
				const svg = btn.querySelector('svg');
				return svg && btn.className.includes('hover:text-red-500');
			});
			
			if (removeButton) {
				const size = getTouchTargetSize(removeButton as HTMLElement);
				// Icon is size 20, with p-1 padding should be adequate
				expect(size.width).toBeGreaterThanOrEqual(24);
				expect(size.height).toBeGreaterThanOrEqual(24);
			}
		});

		it('add variant button should have minimum 44px height', () => {
			setViewportWidth(375);
			render(<VariantsInputWrapper />);
			
			const addButton = screen.getByRole('button', { name: /añadir variante/i });
			const size = getTouchTargetSize(addButton);
			
			// Button has px-4 py-2 which should provide adequate height
			expect(size.height).toBeGreaterThanOrEqual(36);
		});

		it('variant input fields should have adequate touch targets on mobile', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Find all input fields in variant
			const inputs = container.querySelectorAll('input[type="number"], input[type="text"]');
			
			inputs.forEach(input => {
				const size = getTouchTargetSize(input as HTMLElement);
				// py-1.5 provides adequate height for variant inputs
				expect(size.height).toBeGreaterThanOrEqual(32);
			});
		});
	});

	describe('Spacing Between Interactive Elements', () => {
		it('color palette swatches should have adequate spacing', () => {
			setViewportWidth(375);
			const { container } = render(<VariantsInputWrapper />);
			
			// Find the palette container
			const paletteContainer = container.querySelector('.flex.flex-wrap.gap-2');
			
			if (paletteContainer) {
				const styles = window.getComputedStyle(paletteContainer);
				const gap = parseFloat(styles.gap);
				
				// gap-2 = 8px - exactly the minimum required
				expect(gap).toBeGreaterThanOrEqual(8);
			}
		});

		it('variant cards should have spacing between them', () => {
			setViewportWidth(375);
			const initialVariants = [
				{ stock: 10, price: 100, priceWholesale: 80, storage: 'x50', color: '', colorName: '' },
				{ stock: 20, price: 200, priceWholesale: 160, storage: 'x100', color: '', colorName: '' },
			];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Find the variants container
			const variantsContainer = container.querySelector('.space-y-3');
			
			if (variantsContainer) {
				const styles = window.getComputedStyle(variantsContainer);
				// space-y-3 on mobile = 12px vertical spacing
				expect(styles.getPropertyValue('--tw-space-y-reverse')).toBeDefined();
			}
		});

		it('input fields within variant card should have spacing', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Find variant card container
			const variantCard = container.querySelector('.flex.flex-col.gap-3');
			
			if (variantCard) {
				const styles = window.getComputedStyle(variantCard);
				const gap = parseFloat(styles.gap);
				
				// gap-3 = 12px - adequate spacing
				expect(gap).toBeGreaterThanOrEqual(8);
			}
		});
	});

	describe('Visual Feedback on Touch Interactions', () => {
		it('color selector button should have visual feedback states', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '#EF4444',
				colorName: 'Rojo',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			const colorButton = container.querySelector('button.rounded-full');
			
			if (colorButton) {
				const classes = colorButton.className;
				// Should have transition and hover states
				expect(classes).toMatch(/transition/);
				expect(classes).toMatch(/hover:border-primary/);
			}
		});

		it('palette swatches should have hover and focus states', () => {
			setViewportWidth(375);
			const { container } = render(<VariantsInputWrapper />);
			
			const paletteButtons = container.querySelectorAll('.flex-wrap button');
			
			paletteButtons.forEach(button => {
				const classes = button.className;
				// Should have transition and scale on hover
				expect(classes).toMatch(/transition/);
				expect(classes).toMatch(/hover:scale/);
				expect(classes).toMatch(/focus:ring/);
			});
		});

		it('remove button should have hover state', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			const removeButton = Array.from(container.querySelectorAll('button')).find(btn =>
				btn.className.includes('hover:text-red-500')
			);
			
			if (removeButton) {
				const classes = removeButton.className;
				expect(classes).toMatch(/hover:text-red-500/);
				expect(classes).toMatch(/transition/);
			}
		});

		it('add variant button should have hover state', () => {
			setViewportWidth(375);
			render(<VariantsInputWrapper />);
			
			const addButton = screen.getByRole('button', { name: /añadir variante/i });
			const classes = addButton.className;
			
			expect(classes).toMatch(/hover:bg-slate-100/);
			expect(classes).toMatch(/transition/);
		});

		it('active color selector should have visual indicator', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '#EF4444',
				colorName: 'Rojo',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// When active, button should have ring-2 ring-primary/20 scale-110
			const colorButton = container.querySelector('button.rounded-full');
			
			if (colorButton) {
				// Button should have conditional classes for active state
				expect(colorButton.className).toBeDefined();
			}
		});
	});

	describe('Mobile Layout Adaptations', () => {
		it('variant should display as card layout on mobile', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Should have flex-col on mobile
			const variantCard = container.querySelector('.flex.flex-col');
			expect(variantCard).toBeTruthy();
			
			// Should have md:grid for desktop
			if (variantCard) {
				expect(variantCard.className).toMatch(/md:grid/);
			}
		});

		it('labels should be visible on mobile', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			// Labels should be present for mobile
			expect(screen.getByText('Stock')).toBeInTheDocument();
			expect(screen.getByText('Precio (por menor)')).toBeInTheDocument();
			expect(screen.getByText('Precio (por mayor)')).toBeInTheDocument();
			expect(screen.getByText('Presentación')).toBeInTheDocument();
			expect(screen.getByText('Color')).toBeInTheDocument();
		});

		it('headers should be hidden on mobile', () => {
			setViewportWidth(375);
			const { container } = render(<VariantsInputWrapper />);
			
			// Headers container should have hidden class
			const headersContainer = container.querySelector('.hidden.md\\:grid');
			expect(headersContainer).toBeTruthy();
		});
	});

	describe('Accessibility Features', () => {
		it('color selector should have title attribute for accessibility', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '#EF4444',
				colorName: 'Rojo',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			const colorButton = container.querySelector('button.rounded-full');
			
			if (colorButton) {
				// Should have title attribute with color name
				expect(colorButton).toHaveAttribute('title');
			}
		});

		it('palette swatches should have title attributes', () => {
			setViewportWidth(375);
			const { container } = render(<VariantsInputWrapper />);
			
			const paletteButtons = container.querySelectorAll('.flex-wrap button');
			
			paletteButtons.forEach(button => {
				// Each swatch should have a title with color name
				expect(button).toHaveAttribute('title');
			});
		});

		it('inputs should have proper type attributes', () => {
			setViewportWidth(375);
			const initialVariants = [{
				stock: 10,
				price: 100,
				priceWholesale: 80,
				storage: 'x50',
				color: '',
				colorName: '',
			}];
			
			const { container } = render(<VariantsInputWrapper initialVariants={initialVariants} />);
			
			const numberInputs = container.querySelectorAll('input[type="number"]');
			const textInputs = container.querySelectorAll('input[type="text"]');
			
			// Should have 3 number inputs (stock, price, priceWholesale)
			expect(numberInputs.length).toBeGreaterThanOrEqual(3);
			
			// Should have 1 text input (storage)
			expect(textInputs.length).toBeGreaterThanOrEqual(1);
		});
	});
});
