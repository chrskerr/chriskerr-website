module.exports = {
	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [440, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
	},
	swcMinify: true,
	experimental: {
		concurrentFeatures: true,
		serverComponents: false,
	},
	reactStrictMode: true,
};
