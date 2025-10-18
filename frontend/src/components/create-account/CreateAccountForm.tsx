'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { InputGroup, InputGroupInput } from '../ui/input-group';

const roleOptions = ['admin', 'manager', 'viewer'] as const;

const createAccountSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	username: z.string().min(3, 'Username must be at least 3 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	role: z.enum(roleOptions),
	locationLevel1: z.string(),
	locationLevel2: z.string(),
	locationLevel3: z.string(),
	locationLevel4: z.string(),
	locationLevel5: z.string(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

interface Location {
	id: string;
	name: string;
	parentId?: string;
}

interface LocationLevel {
	level: number;
	label: string;
	dependsOn?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const locationLevels: LocationLevel[] = [
	{ level: 1, label: 'Location Level 1' },
	{ level: 2, label: 'Location Level 2', dependsOn: 1 },
	{ level: 3, label: 'Location Level 3', dependsOn: 2 },
	{ level: 4, label: 'Location Level 4', dependsOn: 3 },
	{ level: 5, label: 'Location Level 5', dependsOn: 4 },
];

export function CreateAccountForm() {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CreateAccountFormData>({
		resolver: zodResolver(createAccountSchema),
	});

	const [selectedLocations, setSelectedLocations] = useState({
		level1: '',
		level2: '',
		level3: '',
		level4: '',
		level5: '',
	});

	// Fetch locations for each level
	const locationQueries = locationLevels.map((level) => {
		const shouldFetch = level.dependsOn
			? selectedLocations[`level${level.dependsOn}` as keyof typeof selectedLocations]
			: true;

		const url = shouldFetch
			? `/api/list-locations?level=${level.level}${
					level.dependsOn
						? `&parentId=${selectedLocations[`level${level.dependsOn}` as keyof typeof selectedLocations]}`
						: ''
				}`
			: null;

		return useSWR<{ locations: Location[] }>(url, fetcher);
	});

	const handleLocationChange = (level: number, value: string) => {
		const newSelectedLocations = { ...selectedLocations };
		newSelectedLocations[`level${level}` as keyof typeof selectedLocations] = value;

		// Reset lower levels when a higher level changes
		for (let i = level + 1; i <= 5; i++) {
			newSelectedLocations[`level${i}` as keyof typeof selectedLocations] = '';
			setValue(`locationLevel${i}`, '');
		}

		setSelectedLocations(newSelectedLocations);
		setValue(`locationLevel${level}`, value);
	};

	const onSubmit = async (data: CreateAccountFormData) => {
		try {
			const response = await fetch('/api/create-account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error('Failed to create account');
			}

			// Handle success
		} catch (error) {
			console.error('Error creating account:', error);
		}
	};

	// Replace individual location renders with dynamic rendering
	const renderLocationSelects = () => {
		return locationLevels.map((level, index) => {
			const { data, error } = locationQueries[index];
			const showSelect = level.dependsOn
				? selectedLocations[`level${level.dependsOn}` as keyof typeof selectedLocations]
				: true;

			if (!showSelect || !data?.locations?.length) return null;

			return (
				<div key={level.level} className="space-y-2">
					<Label>{level.label}</Label>
					<Select
						onValueChange={(value) => handleLocationChange(level.level, value)}
						value={selectedLocations[`level${level.level}` as keyof typeof selectedLocations]}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select location" />
						</SelectTrigger>
						<SelectContent>
							{data.locations.map((location) => (
								<SelectItem key={location.id} value={location.id}>
									{location.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input id="name" {...register('name')} placeholder="Enter name" />
				{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
			</div>

			<div className="space-y-2">
				<Label htmlFor="username">Username</Label>
				<Input autoComplete="new-user" {...register('username')} placeholder="Enter username" />
				{errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<InputGroup>
					<InputGroupInput
						type="password"
						placeholder="Enter password"
						autoComplete="new-password"
						{...register('password')}
					/>
				</InputGroup>
				{/* <Input type="text" className="hidden" /> */}
				{/* <Input
					id="password"
					type="password"
					autoComplete="new-password"
					{...register('password')}
					placeholder="Enter your password"
					className="h-12 hidden"
				/> */}
				{errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
			</div>

			<div className="space-y-2">
				<Label htmlFor="role">Role</Label>
				<Select onValueChange={(value) => setValue('role', value as CreateAccountFormData['role'])}>
					<SelectTrigger>
						<SelectValue placeholder="Select role" />
					</SelectTrigger>
					<SelectContent>
						{roleOptions.map((role) => (
							<SelectItem key={role} value={role}>
								{role.charAt(0).toUpperCase() + role.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
			</div>

			{/* Replace all location select elements with dynamic rendering */}
			{renderLocationSelects()}

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Account'}
			</Button>
		</form>
	);
}
