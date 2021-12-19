module.exports = {
	content: [ "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}" ],
	theme: {
		extend: {
			fontFamily: {
				sans: [ "'Open Sans'", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "'Noto Sans'", "sans-serif", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "'Noto Color Emoji'" ],
				heading: [ "'Source Code Pro'", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "'Noto Sans'", "sans-serif", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "'Noto Color Emoji'" ],
				special: [ "'Passion One'", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "'Noto Sans'", "sans-serif", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "'Noto Color Emoji'" ],
			},
			colors: {
				brand: "var(--brand-blue)",
				"brand-dark": "var(--brand-blue-dark)",
				"brand-secondary": "var(--brand-secondary)",
			},
		},
	},
	plugins: [
		require( "@tailwindcss/typography" ),
		require( "@tailwindcss/line-clamp" ),
		require( "@tailwindcss/forms" ),
	],
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
		defaultLineHeights: true,
		standardFontWeights: true,
	},
};