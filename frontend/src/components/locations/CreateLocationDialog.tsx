'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import fetcher from '@/lib/fetcher';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { z } from 'zod';

const createLocationSchema = z.object({
	name: z.string().min(3, 'Location name must be at least 3 characters'),
});

type CreateLocationData = z.infer<typeof createLocationSchema>;

interface CreateLocationDialogProps {
	level: number;
	parentId?: string;
}

export function CreateLocationDialog({ level, parentId }: CreateLocationDialogProps) {
	const [open, setOpen] = useState(false);
	const { mutate } = useSWRConfig();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateLocationData>({
		resolver: zodResolver(createLocationSchema),
	});

	const onSubmit = async (data: CreateLocationData) => {
		try {
			const res = await fetcher('/api/locations', {
				method: 'POST',
				body: JSON.stringify({
					name: data.name,
					level,
					parentId,
				}),
			});
			console.log('Create location response:', res);
			if (res.createdAt) {
				toast.success(`Created location "${data.name}" successfully`);
				// Revalidate the locations list
				mutate((key) => typeof key === 'string' && key.startsWith('/api/list-locations'));
			} else {
				toast.error(res.error || `Failed to create location "${data.name}"`);
			}

			setOpen(false);
			reset();
		} catch (error) {
			console.error('Error creating location:', error);
			setOpen(false);
			toast.error('Failed to create location');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="lg">
					<Plus size={20} className="mr-2" />
					Add Location
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Location</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Location Name</Label>
						<Input id="name" {...register('name')} placeholder="Enter location name" />
						{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Creating...' : 'Create Location'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
