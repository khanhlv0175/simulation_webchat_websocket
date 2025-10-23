'use client';

import { withAuth } from '@/hoc/withAuth';
import { useRouter } from 'next/dist/client/components/navigation';
import { useEffect, useId } from 'react';

function Home() {
	const router = useRouter();
	const roomId = useId();

	useEffect(() => {
		const createAndJoinRoom = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						// mode: "no-cors",
					},
					body: JSON.stringify({
						name: `Room ${roomId}`,
					}),
				});

				const data = await response.json();
				if (data.roomId) {
					router.push(`/room/${data.roomId}`);
				}
			} catch (error) {
				console.error('Failed to create room:', error);
			}
		};

		createAndJoinRoom();
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="bg-white p-8 rounded-lg shadow-md">
				<div className="flex items-center space-x-4">
					<div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
					<p className="text-lg text-gray-600">Creating new chat room...</p>
				</div>
			</div>
		</div>
	);
}

export default withAuth(Home);
