'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import fetcher from '@/lib/fetcher';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { z } from 'zod';

const roleOptions = ['admin', 'manager', 'viewer'] as const;

interface LocationRow {
	level1: string;
	level2: string;
	level3: string;
	level4: string;
	level5: string;
}

const createAccountSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	username: z.string().min(3, 'Username must be at least 3 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	role: z.string(),
	locations: z.array(
		z.object({
			level1: z.string(),
			level2: z.string(),
			level3: z.string(),
			level4: z.string(),
			level5: z.string(),
		}),
	),
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

const locationLevels: LocationLevel[] = [
	{ level: 1, label: 'Location Level 1' },
	{ level: 2, label: 'Location Level 2', dependsOn: 1 },
	{ level: 3, label: 'Location Level 3', dependsOn: 2 },
	{ level: 4, label: 'Location Level 4', dependsOn: 3 },
	{ level: 5, label: 'Location Level 5', dependsOn: 4 },
];

export function CreateAccountForm() {
	const { mutate } = useSWRConfig();
	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateAccountFormData>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			name: '',
			username: '',
			password: '',
			role: '',
			locations: [{ level1: '', level2: '', level3: '', level4: '', level5: '' }],
		},
	});

	const [locationRows, setLocationRows] = useState<LocationRow[]>([
		{ level1: '', level2: '', level3: '', level4: '', level5: '' },
	]);

	const handleAddLocationRow = () => {
		setLocationRows([...locationRows, { level1: '', level2: '', level3: '', level4: '', level5: '' }]);
		const currentLocations = watch('locations') || [];
		setValue('locations', [...currentLocations, { level1: '', level2: '', level3: '', level4: '', level5: '' }]);
	};

	const handleLocationChange = (rowIndex: number, level: number, value: string) => {
		const newLocationRows = [...locationRows];
		const row = { ...newLocationRows[rowIndex] };
		row[`level${level}` as keyof LocationRow] = value;

		// Reset lower levels in this row
		for (let i = level + 1; i <= 5; i++) {
			row[`level${i}` as keyof LocationRow] = '';
		}

		newLocationRows[rowIndex] = row;
		setLocationRows(newLocationRows);

		// Update form values
		const locations = watch('locations');
		locations[rowIndex] = row;
		setValue('locations', locations);
	};

	const onSubmit = async (data: CreateAccountFormData) => {
		try {
			// toast('Account created successfully');

			await fetcher('/api/register', {
				method: 'POST',
				body: JSON.stringify(data),
			});

			toast.success('Account created successfully');

			// Reset form
			// form.reset();
			reset();

			// Clear all selected locations
			setLocationRows([{ level1: '', level2: '', level3: '', level4: '', level5: '' }]);

			// Revalidate any user lists if they exist
			mutate((key) => typeof key === 'string' && key.startsWith('/api/users'));
		} catch (error) {
			console.error('Error creating account:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create account');
		}
	};

	// Replace individual location renders with dynamic rendering
	const renderLocationRow = (rowIndex: number) => {
		return locationLevels.map((level, levelIndex) => {
			const parentLevel = level.dependsOn;
			const parentValue = parentLevel ? locationRows[rowIndex][`level${parentLevel}` as keyof LocationRow] : null;

			const shouldShow = !parentLevel || parentValue;

			const { data } = useSWR<{ locations: Location[] }>(
				shouldShow ? `/api/list-locations?level=${level.level}${parentValue ? `&parentId=${parentValue}` : ''}` : null,
				fetcher,
			);

			if (!shouldShow || !data?.locations?.length) return null;

			return (
				<Select
					key={`${rowIndex}-${level.level}`}
					value={locationRows[rowIndex][`level${level.level}` as keyof LocationRow]}
					onValueChange={(value) => handleLocationChange(rowIndex, level.level, value)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={`Select ${level.label}`} />
					</SelectTrigger>
					<SelectContent>
						{data.locations.map((location) => (
							<SelectItem key={location.id} value={location.id}>
								{location.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
				<Controller
					control={control}
					name="role"
					render={({ field }) => (
						<Select {...field} onValueChange={field.onChange}>
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
					)}
				/>
				{errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label>Locations</Label>
					<Button type="button" variant="outline" size="sm" onClick={handleAddLocationRow}>
						Add Location
					</Button>
				</div>

				{locationRows.map((_, index) => (
					<div key={index} className="grid grid-cols-5 gap-2.5">
						{renderLocationRow(index)}
					</div>
				))}
			</div>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Account'}
			</Button>
		</form>
	);
}
