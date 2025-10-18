'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ROUTES } from '@/lib/routes';

export function withAuth<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	options?: {
		requireAuth?: boolean;
		allowedRoles?: Array<'admin' | 'manager' | 'viewer'>;
	},
) {
	return function WithAuthComponent(props: P) {
		const router = useRouter();
		const { user, isAuthenticated } = useAuthStore();
		const { requireAuth = true, allowedRoles } = options || {};

		useEffect(() => {
			if (requireAuth && !isAuthenticated) {
				router.push(ROUTES.LOGIN);
				return;
			}

			if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
				router.push(ROUTES.HOME);
				return;
			}
		}, [isAuthenticated, user, router]);

		// Show loading state while checking auth
		if (requireAuth && !isAuthenticated) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			);
		}

		// Render component if authentication check passes
		return <WrappedComponent {...props} />;
	};
}
