import { NextResponse } from 'next/server';

export async function GET() {
	// In a real app, you would validate the session/token here
	return NextResponse.json({
		name: 'Current User',
		role: 'admin',
	});
}
