'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			// TODO: Implement actual login logic here
			localStorage.setItem('username', data.username);
			router.push('/');
		} catch (error) {
			console.error('Login failed:', error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-white">
			<div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
				<h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							{...register('username')}
							placeholder="Enter your username"
							className="h-12"
							autoFocus
						/>
						{errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="new-password"
							{...register('password')}
							placeholder="Enter your password"
							className="h-12"
						/>
						{errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
					</div>

					<Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>
			</div>
		</div>
	);
}
