module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: 'var(--brand-blue)',
				'brand-dark': 'var(--brand-blue-dark)',
				'brand-extra-dark': 'var(--brand-blue-extra-dark)',
				'brand-secondary': 'var(--brand-secondary)',
				'brand-maroon': 'var(--brand-maroon)',
				'brand-maroon-dark': 'var(--brand-maroon-dark)',
			},
			transitionTimingFunction: {
				'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/line-clamp'),
		require('@tailwindcss/forms'),
	],
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
		defaultLineHeights: true,
		standardFontWeights: true,
	},
};
