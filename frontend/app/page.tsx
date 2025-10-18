'use client';

import { withAuth } from '@/hoc/withAuth';

function Home() {
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
