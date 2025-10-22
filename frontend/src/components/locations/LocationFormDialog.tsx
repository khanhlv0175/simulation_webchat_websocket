import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const locationFormSchema = z.object({
	name: z.string().min(3, 'Location name must be at least 3 characters'),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface LocationFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: LocationFormData) => Promise<void>;
	title: string;
	defaultValues?: LocationFormData;
}

export function LocationFormDialog({ open, onOpenChange, onSubmit, title, defaultValues }: LocationFormDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<LocationFormData>({
		resolver: zodResolver(locationFormSchema),
		defaultValues,
	});

	const handleFormSubmit = async (data: LocationFormData) => {
		try {
			await onSubmit(data);
			reset();
		} catch (error) {
			toast.error('Failed to save location');
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Location Name</Label>
						<Input id="name" {...register('name')} placeholder="Enter location name" />
						{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
