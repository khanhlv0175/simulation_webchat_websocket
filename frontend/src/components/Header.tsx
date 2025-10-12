'use client';
import { useAuthStore } from '@/stores/useAuthStore';
import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from './ToggleTheme';

export function Header() {
	const { user, isAuthenticated, logout } = useAuthStore();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center mx-auto">
				<Link href="/" className="mr-6 flex items-center space-x-2">
					<span className="hidden font-bold sm:inline-block">Chat App</span>
				</Link>

				<div className="flex flex-1 items-center justify-end gap-3">
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link href="/">Home</Link>

						{(user?.role === 'admin' || user?.role === 'manager') && <Link href="/manage">Manage</Link>}

						{user?.role === 'admin' && <Link href="/create-account">Create Account</Link>}
					</nav>
					{/* <ThemeToggle /> */}
					{isAuthenticated ? (
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
								<DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
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
