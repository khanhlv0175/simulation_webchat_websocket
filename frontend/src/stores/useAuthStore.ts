import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'admin' | 'manager' | 'viewer';

interface UserInfo {
	name: string;
	role: Role;
}

interface AuthStore {
	user: UserInfo | null;
	isAuthenticated: boolean;
	setUser: (user: UserInfo | null) => void;
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
