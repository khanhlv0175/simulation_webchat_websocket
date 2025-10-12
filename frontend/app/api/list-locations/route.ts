import { NextResponse } from 'next/server';

// Define location structure
interface Location {
	id: string;
	name: string;
	level: number;
	parentId?: string;
}

// Dummy data with hierarchical structure
const locations: Location[] = [
	// Level 1 - Cities
	{ id: '1', name: 'Hà Nội', level: 1 },
	{ id: '2', name: 'Hồ Chí Minh', level: 1 },
	{ id: '3', name: 'Đà Nẵng', level: 1 },

	// Level 2 - Districts (Hà Nội)
	{ id: '101', name: 'Cầu Giấy', level: 2, parentId: '1' },
	{ id: '102', name: 'Ba Đình', level: 2, parentId: '1' },
	{ id: '103', name: 'Hoàn Kiếm', level: 2, parentId: '1' },

	// Level 2 - Districts (Hồ Chí Minh)
	{ id: '201', name: 'Quận 1', level: 2, parentId: '2' },
	{ id: '202', name: 'Quận 2', level: 2, parentId: '2' },
	{ id: '203', name: 'Quận 3', level: 2, parentId: '2' },

	// Level 3 - Wards (Cầu Giấy)
	{ id: '1011', name: 'Dịch Vọng', level: 3, parentId: '101' },
	{ id: '1012', name: 'Mai Dịch', level: 3, parentId: '101' },
	{ id: '1013', name: 'Yên Hòa', level: 3, parentId: '101' },

	// Level 3 - Wards (Quận 1)
	{ id: '2011', name: 'Bến Nghé', level: 3, parentId: '201' },
	{ id: '2012', name: 'Bến Thành', level: 3, parentId: '201' },

	// Level 4 - Neighborhoods (Dịch Vọng)
	{ id: '10111', name: 'Tổ 1', level: 4, parentId: '1011' },
	{ id: '10112', name: 'Tổ 2', level: 4, parentId: '1011' },
	{ id: '10113', name: 'Tổ 3', level: 4, parentId: '1011' },

	// Level 5 - Buildings (Tổ 1)
	{ id: '101111', name: 'Chung cư A', level: 5, parentId: '10111' },
	{ id: '101112', name: 'Chung cư B', level: 5, parentId: '10111' },
	{ id: '101113', name: 'Chung cư C', level: 5, parentId: '10111' },
];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const level = searchParams.get('level');
	const parentId = searchParams.get('parentId');

	// Filter locations based on level and parentId
	let filteredLocations = locations;

	if (level) {
		filteredLocations = filteredLocations.filter((loc) => loc.level === parseInt(level));
	}

	if (parentId) {
		filteredLocations = filteredLocations.filter((loc) => loc.parentId === parentId);
	}

	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	return NextResponse.json({ locations: filteredLocations });
}
