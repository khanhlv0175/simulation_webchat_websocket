import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	const body = await request.json();

	// Dummy authentication logic
	if (body.username === 'admin' && body.password === 'admin123') {
		return NextResponse.json({ name: 'Admin User', role: 'admin' });
	} else if (body.username === 'manager' && body.password === 'manager123') {
		return NextResponse.json({ name: 'Manager User', role: 'manager' });
	} else if (body.username === 'viewer' && body.password === 'viewer123') {
		return NextResponse.json({ name: 'Viewer User', role: 'viewer' });
	}

	return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
