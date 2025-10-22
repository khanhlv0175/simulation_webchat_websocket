'use client';

import { CreateLocationDialog } from '@/components/locations/CreateLocationDialog';
import LocationGrid, { type Location } from '@/components/locations/LocationGrid';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import fetcher from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import { Home } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';

interface LocationPath {
	_id: string;
	name: string;
	level: number;
	parentId?: string;
}

export default function LocationsPage() {
	const [currentLevel, setCurrentLevel] = useState(1);
	const [locationPath, setLocationPath] = useState<LocationPath[]>([]);

	const { data, error, isLoading, mutate } = useSWR<{ locations: Location[] }>(
		`/api/list-locations?level=${currentLevel}${
			locationPath.length > 0 ? `&parentId=${locationPath[locationPath.length - 1]._id}` : ''
		}`,
		fetcher,
	);

	const { user } = useAuthStore();
	const canManageLocations = user?.role === 'admin' || user?.role === 'manager';

	const handleLocationClick = (location: Location) => {
		setLocationPath([
			...locationPath,
			{
				_id: location._id,
				name: location.name,
				level: location.level,
			},
		]);
		setCurrentLevel(location.level + 1);
	};

	const handleBreadcrumbClick = (index: number) => {
		setLocationPath(locationPath.slice(0, index + 1));
		setCurrentLevel(index + 1 + 1);
	};

	if (error) return <div>Failed to load locations</div>;
	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Locations</h1>
				{canManageLocations && (
					<CreateLocationDialog
						level={currentLevel}
						parentId={locationPath.length > 0 ? locationPath[locationPath.length - 1]._id : undefined}
					/>
				)}
			</div>

			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							onClick={() => {
								setCurrentLevel(1);
								setLocationPath([]);
							}}
							className="flex gap-x-1"
						>
							<Home size={16} />
							<span className="sr-only">Home</span>
							<span>Locations</span>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{locationPath.map((item, index) => (
						<BreadcrumbItem key={item._id}>
							<BreadcrumbSeparator />
							<BreadcrumbLink onClick={() => handleBreadcrumbClick(index)}>{item.name}</BreadcrumbLink>
						</BreadcrumbItem>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			<LocationGrid locations={data?.locations || []} onLocationClick={handleLocationClick} refresh={mutate} />
		</div>
	);
}
