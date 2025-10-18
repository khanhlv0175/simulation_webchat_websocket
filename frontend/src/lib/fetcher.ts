export default async function fetcher<JSON = any>(url: string, init?: RequestInit): Promise<JSON> {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

	// use the Headers class so we can call .set and .has without indexing a union type
	const headers = new Headers(init?.headers as HeadersInit);

	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(`${baseUrl}${url}`, {
		...init,
		headers,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || response.statusText);
	}

	return response.json() as Promise<JSON>;
}
