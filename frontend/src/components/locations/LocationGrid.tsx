import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import fetcher from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import { Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { preload } from 'swr';
import { LocationFormDialog } from './LocationFormDialog';

export interface Location {
	_id: string;
	name: string;
	level: number;
	parentId?: string;
}

interface LocationGridProps {
	locations: Location[];
	onLocationClick: (location: Location) => void;
	refresh: () => void;
	onDelete?: (locationId: string) => void;
}

export default function LocationGrid({ locations, onLocationClick, refresh, onDelete }: LocationGridProps) {
	const { user } = useAuthStore();
	const canManageLocations = user?.role === 'admin' || user?.role === 'manager';
	const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
	const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);

	const handleDeleteClick = (e: React.MouseEvent, location: Location) => {
		e.stopPropagation();
		setLocationToDelete(location);
	};

	const handleConfirmDelete = async () => {
		if (!locationToDelete) return;

		try {
			await fetcher(`/api/locations/${locationToDelete._id}`, {
				method: 'DELETE',
			});
			onDelete?.(locationToDelete._id);
			// Mutate the current locations list
			refresh();
			toast.success(`Deleted location "${locationToDelete.name}" successfully`);
		} catch (error) {
			toast.error(`Failed to delete location "${locationToDelete.name}"`);
		} finally {
			setLocationToDelete(null);
		}
	};

	const handleEditClick = (e: React.MouseEvent, location: Location) => {
		e.stopPropagation();
		setLocationToEdit(location);
	};

	const handleEditSubmit = async (data: { name: string }) => {
		if (!locationToEdit) return;

		try {
			await fetcher(`/api/locations/${locationToEdit._id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name: data.name }),
			});

			// Mutate the current locations list
			refresh();
			toast.success('Location updated successfully');
			setLocationToEdit(null);
		} catch (error) {
			throw error;
		}
	};

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{locations.map((location) => (
					<Card
						key={location._id}
						className="cursor-pointer hover:shadow-xl transition-shadow relative group"
						onClick={() => onLocationClick(location)}
						onMouseEnter={() => {
							// setHoveredId(location._id);
							preload(`/api/list-locations?parentId=${location._id}`, fetcher);
						}}
						// onMouseLeave={() => setHoveredId(null)}
					>
						<div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							{canManageLocations && (
								<>
									<Button variant="default" size="icon" onClick={(e) => handleEditClick(e, location)}>
										<Edit2 size={16} />
									</Button>
									<Button variant="destructive" size="icon" onClick={(e) => handleDeleteClick(e, location)}>
										<Trash2 size={16} />
									</Button>
								</>
							)}
						</div>
						<CardHeader>
							<Image
								src={`https://picsum.photos/300?${location.name}`}
								alt={location.name}
								width={300}
								height={300}
								className="rounded-md mb-2"
								loading="eager"
								fetchPriority="high"
							/>
							<CardTitle className="text-lg">{location.name}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the location{' '}
							<strong>"{locationToDelete?.name}"</strong> and remove its data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						{/* <AlertDialogAction asChild> */}
						<Button variant="destructive" onClick={handleConfirmDelete}>
							Delete
						</Button>
						{/* </AlertDialogAction> */}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{!!locationToEdit && (
				<LocationFormDialog
					open
					onOpenChange={(open) => !open && setLocationToEdit(null)}
					onSubmit={handleEditSubmit}
					title="Edit Location"
					defaultValues={{ name: locationToEdit?.name || '' }}
				/>
			)}
		</>
	);
}
