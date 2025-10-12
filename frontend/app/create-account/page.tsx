import { CreateAccountForm } from '@/components/create-account/CreateAccountForm';

export default function CreateAccountPage() {
	return (
		<div className="container mx-auto max-w-2xl py-8">
			<h1 className="text-2xl font-bold mb-6">Create New Account</h1>
			<CreateAccountForm />
		</div>
	);
}
