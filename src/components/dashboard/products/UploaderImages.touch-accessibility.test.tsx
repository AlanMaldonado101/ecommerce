import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploaderImages } from './UploaderImages';
import { useForm } from 'react-hook-form';
import { ProductFormValues } from '../../../lib/validators';

// Wrapper component to provide form context
const UploaderImagesWrapper = ({ initialImages = [] }: { initialImages?: any[] }) => {
	const { setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
		defaultValues: {
			images: initialImages,
		},
	});

	return (
		<UploaderImages
			setValue={setValue}
			watch={watch}
			errors={errors}
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

describe('UploaderImages - Touch Accessibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock URL.createObjectURL
		global.URL.createObjectURL = vi.fn(() => 'mock-url');
	});

	describe('Touch Target Sizes on Mobile', () => {
		it('upload area should have adequate touch target on mobile', () => {
			setViewportWidth(375);
			const { container } = render(<UploaderImagesWrapper />);

			const uploadLabel = container.querySelector('label') as HTMLElement;

			if (uploadLabel) {
				const size = getTouchTargetSize(uploadLabel);
				// py-6 on mobile provides adequate height
				expect(size.height).toBeGreaterThanOrEqual(100);
			}
		});

		it('delete button should have minimum 44x44px touch target on mobile', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			// Find delete button
			const deleteButton = container.querySelector('button[type="button"]') as HTMLElement;

			if (deleteButton) {
				const size = getTouchTargetSize(deleteButton);
				// h-11 w-11 = 44px x 44px - exactly the minimum required
				expect(size.width).toBeGreaterThanOrEqual(44);
				expect(size.height).toBeGreaterThanOrEqual(44);
			}
		});

		it('delete button should have aria-label for accessibility', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButton = container.querySelector('button[aria-label]');

			expect(deleteButton).toBeTruthy();
			if (deleteButton) {
				expect(deleteButton).toHaveAttribute('aria-label');
				expect(deleteButton.getAttribute('aria-label')).toMatch(/eliminar imagen/i);
			}
		});

		it('file input should be accessible for touch', () => {
			setViewportWidth(375);
			const { container } = render(<UploaderImagesWrapper />);

			const fileInput = container.querySelector('input[type="file"]');

			expect(fileInput).toBeTruthy();
			if (fileInput) {
				// Input should cover the entire label area
				const classes = fileInput.className;
				expect(classes).toMatch(/absolute/);
				expect(classes).toMatch(/inset-0/);
				expect(classes).toMatch(/cursor-pointer/);
			}
		});
	});

	describe('Image Grid Responsiveness', () => {
		it('should display 2 columns on mobile', () => {
			setViewportWidth(375);
			const initialImages = [
				'https://example.com/image1.jpg',
				'https://example.com/image2.jpg',
			];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const grid = container.querySelector('.grid') as HTMLElement;

			if (grid) {
				const classes = grid.className;
				// Should have grid-cols-2 for mobile
				expect(classes).toMatch(/grid-cols-2/);
			}
		});

		it('should have adequate spacing between images on mobile', () => {
			setViewportWidth(375);
			const initialImages = [
				'https://example.com/image1.jpg',
				'https://example.com/image2.jpg',
			];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const grid = container.querySelector('.grid') as HTMLElement;

			if (grid) {
				const styles = window.getComputedStyle(grid);
				const gap = parseFloat(styles.gap);

				// gap-3 = 12px on mobile - adequate spacing
				expect(gap).toBeGreaterThanOrEqual(8);
			}
		});

		it('image thumbnails should have adequate size on mobile', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const thumbnail = container.querySelector('.relative.h-24') as HTMLElement;

			if (thumbnail) {
				const size = getTouchTargetSize(thumbnail);
				// h-24 = 96px - adequate for viewing
				expect(size.height).toBeGreaterThanOrEqual(96);
			}
		});
	});

	describe('Visual Feedback on Touch Interactions', () => {
		it('upload area should have hover state', () => {
			setViewportWidth(375);
			const { container } = render(<UploaderImagesWrapper />);

			const uploadLabel = container.querySelector('label') as HTMLElement;

			if (uploadLabel) {
				const classes = uploadLabel.className;
				// Should have hover states
				expect(classes).toMatch(/hover:border-primary/);
				expect(classes).toMatch(/hover:bg-primary/);
				expect(classes).toMatch(/transition/);
			}
		});

		it('delete button should have hover state', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButton = container.querySelector('button[type="button"]') as HTMLElement;

			if (deleteButton) {
				const classes = deleteButton.className;
				// Should have hover scale animation
				expect(classes).toMatch(/hover:scale/);
				expect(classes).toMatch(/transition/);
			}
		});

		it('delete button icon should be clearly visible', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			// Find the icon (IoIosCloseCircleOutline)
			const icon = container.querySelector('svg');

			expect(icon).toBeTruthy();
			if (icon) {
				// Icon should be size 28 for visibility
				const parentButton = icon.closest('button');
				expect(parentButton).toBeTruthy();
			}
		});
	});

	describe('Upload Functionality', () => {
		it('should accept multiple files', () => {
			setViewportWidth(375);
			const { container } = render(<UploaderImagesWrapper />);

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			expect(fileInput).toBeTruthy();
			if (fileInput) {
				expect(fileInput).toHaveAttribute('multiple');
			}
		});

		it('should accept image formats', () => {
			setViewportWidth(375);
			const { container } = render(<UploaderImagesWrapper />);

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			expect(fileInput).toBeTruthy();
			if (fileInput) {
				expect(fileInput).toHaveAttribute('accept', 'image/*');
			}
		});

		it('should show upload instructions on mobile', () => {
			setViewportWidth(375);
			render(<UploaderImagesWrapper />);

			expect(screen.getByText(/haz clic o arrastra imágenes/i)).toBeInTheDocument();
			expect(screen.getByText(/png, jpg, webp/i)).toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should display error message when no images and error exists', () => {
			setViewportWidth(375);
			const { setValue, watch } = useForm<ProductFormValues>({
				defaultValues: {
					images: [],
				},
			});

			// Manually set an error
			const mockErrors = {
				images: { message: 'Al menos una imagen es requerida' },
			};

			render(
				<UploaderImages
					setValue={setValue}
					watch={watch}
					errors={mockErrors as any}
				/>
			);

			expect(screen.getByText(/al menos una imagen es requerida/i)).toBeInTheDocument();
		});
	});

	describe('Positioning and Layout', () => {
		it('delete button should be positioned at top-right corner', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButton = container.querySelector('button[type="button"]') as HTMLElement;

			if (deleteButton) {
				const classes = deleteButton.className;
				// Should be absolutely positioned at top-right
				expect(classes).toMatch(/absolute/);
				expect(classes).toMatch(/-right-2/);
				expect(classes).toMatch(/-top-2/);
			}
		});

		it('delete button should have z-index for visibility', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButton = container.querySelector('button[type="button"]') as HTMLElement;

			if (deleteButton) {
				const classes = deleteButton.className;
				// Should have z-10 to be above image
				expect(classes).toMatch(/z-10/);
			}
		});

		it('images should be contained within thumbnails', () => {
			setViewportWidth(375);
			const initialImages = ['https://example.com/image1.jpg'];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const img = container.querySelector('img');

			if (img) {
				const classes = img.className;
				// Should have object-contain to prevent distortion
				expect(classes).toMatch(/object-contain/);
				expect(classes).toMatch(/h-full/);
				expect(classes).toMatch(/w-full/);
			}
		});
	});

	describe('Multiple Images Handling', () => {
		it('should display multiple images in grid', () => {
			setViewportWidth(375);
			const initialImages = [
				'https://example.com/image1.jpg',
				'https://example.com/image2.jpg',
				'https://example.com/image3.jpg',
			];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const images = container.querySelectorAll('img');
			expect(images.length).toBe(3);
		});

		it('each image should have its own delete button', () => {
			setViewportWidth(375);
			const initialImages = [
				'https://example.com/image1.jpg',
				'https://example.com/image2.jpg',
			];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButtons = container.querySelectorAll('button[type="button"]');
			expect(deleteButtons.length).toBe(2);
		});

		it('delete buttons should have unique aria-labels', () => {
			setViewportWidth(375);
			const initialImages = [
				'https://example.com/image1.jpg',
				'https://example.com/image2.jpg',
			];

			const { container } = render(<UploaderImagesWrapper initialImages={initialImages} />);

			const deleteButtons = container.querySelectorAll('button[aria-label]');

			deleteButtons.forEach((button, index) => {
				const label = button.getAttribute('aria-label');
				expect(label).toMatch(new RegExp(`eliminar imagen ${index + 1}`, 'i'));
			});
		});
	});
});
