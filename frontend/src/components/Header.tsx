'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import fetcher from '@/lib/fetcher';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UserInfo {
	name: string;
	role: 'admin' | 'manager' | 'viewer';
}

export function Header() {
	const router = useRouter();
	const { user, isAuthenticated, setUser, logout } = useAuthStore();

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				// Only fetch if we have a token but no user info
				if (!user && localStorage.getItem('token')) {
					const userInfo = await fetcher<UserInfo>('/api/me/information');
					setUser(userInfo);
				}
			} catch (error) {
				console.error('Failed to fetch user info:', error);
				// If API call fails, clear auth state and redirect to login
				localStorage.removeItem('token');
				logout();
				router.push(ROUTES.LOGIN);
			}
		};

		fetchUserInfo();
	}, [user, setUser, logout, router]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		logout();
		router.push(ROUTES.LOGIN);
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center mx-auto">
				<Link href="/" className="mr-6 flex items-center space-x-2">
					<span className="hidden font-bold sm:inline-block">Chat App</span>
				</Link>

				<div className="flex flex-1 items-center justify-end gap-3">
					<nav className="flex items-center space-x-6 text-sm font-medium">
						{/* <Link href="/">Home</Link> */}
						<Link href="/locations">Locations</Link>
						{(user?.role === 'admin' || user?.role === 'manager') && <Link href="/manage">Manage</Link>}

						{user?.role === 'admin' && <Link href="/create-account">Create Account</Link>}
					</nav>

					{isAuthenticated && user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-8 w-8 rounded-full">
									<Avatar className="h-8 w-8">
										<AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem className="font-normal">{user.name}</DropdownMenuItem>
								<DropdownMenuItem className="text-muted-foreground">{user.role}</DropdownMenuItem>
								<DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link href="/login">
							<Button>Sign In</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
