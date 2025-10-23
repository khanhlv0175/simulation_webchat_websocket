import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	// redirects: async () => {
	// 	return [
	// 		{
	// 			source: '/',
	// 			destination: '/locations',
	// 			permanent: true,
	// 		},
	// 	];
	// },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
