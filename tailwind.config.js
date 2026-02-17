/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#424874',
				'accent-pink': '#D9ACF5',
				'accent-peach': '#FFCEFE',
				'accent-blue': '#bbb9e9',
				'background-light': '#F4EEFF',
				'background-dark': '#120f23',
			},
			container: {
				center: true,
				padding: '1rem',
			},
			fontFamily: {
				montserrat: ['Montserrat', 'sans-serif'],
				display: ['Plus Jakarta Sans', 'sans-serif'],
			},
			borderRadius: {
				DEFAULT: '0.5rem',
				lg: '1rem',
				xl: '1.5rem',
				full: '9999px',
			},

			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'slide-in': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
			},

			animation: {
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'spin-slow': 'spin 2s linear infinite',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
