'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	name: string;
	role: 'admin' | 'manager' | 'viewer';
}

interface AuthStore {
	user: User | null;
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			setUser: (user) => set({ user, isAuthenticated: !!user }),
			logout: () => set({ user: null, isAuthenticated: false }),
		}),
		{
			name: 'auth-storage',
		},
	),
);
