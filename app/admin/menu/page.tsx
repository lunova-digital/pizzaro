'use client';

import FileDropzone from '@/components/FileIDropzone';
import PizzaMenuCardAdmin from '@/components/menu/PizzaMenuCardAdmin';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Pizza {
	_id: string;
	name: string;
	description: string;
	image: string;
	category: string;
	sizes: { name: string; price: number }[];
	isAvailable: boolean;
}

export default function AdminMenuPage() {
	const [pizzas, setPizzas] = useState<Pizza[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [pizzaData, setPizzaData] = useState<Pizza | null>();

	const [showAdd, setShowAdd] = useState(false);
	const [form, setForm] = useState<{
		name?: string;
		image?: string;
		description?: string;
		category?: string;
	}>({
		name: '',
		description: '',
		image: '',
		category: '',
	});

	useEffect(() => {
		fetch('/api/pizzas')
			.then((r) => r.json())
			.then(setPizzas)
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		setForm({
			name: pizzaData?.name!,
			category: pizzaData?.category!,
			description: pizzaData?.description!,
			image: pizzaData?.image!,
		});
	}, [pizzaData]);

	async function toggleAvailability(pizzaId: string, isAvailable: boolean) {
		const res = await fetch(`/api/pizzas/${pizzaId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isAvailable: !isAvailable }),
		});
		if (res.ok) {
			setPizzas((prev) =>
				prev.map((p) =>
					p._id === pizzaId ? { ...p, isAvailable: !p.isAvailable } : p,
				),
			);
		}
	}

	const createPizza = async () => {
		console.log('in');
		if (!form.name || !form.category) return;
		const res = await fetch('/api/pizzas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...form,
				sizes: [
					{ name: 'Small', price: 9.99 },
					{ name: 'Medium', price: 12.99 },
					{ name: 'Large', price: 15.99 },
				],
				toppings: [],
			}),
		});
		if (res.ok) {
			const pizza = await res.json();
			setPizzas((prev) => [pizza, ...prev]);
			setForm({ name: '', description: '', image: '', category: '' });
			setShowAdd(false);
		}
	};

	async function updatePizza(pizza: Pizza) {
		const res = await fetch(`/api/pizzas/${pizza._id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...form,
			}),
		});

		if (res.ok) {
			const updatedPizza = await res.json(); // assuming API returns updated item

			setPizzas((prev) =>
				prev.map((p) => (p._id === updatedPizza._id ? updatedPizza : p)),
			);

			setForm({ name: '', description: '', image: '', category: '' });
			setShowAdd(false);
			setPizzaData(null);
			setEditingId(null);
		}
	}

	const handleSubmitForm = (pizzaId?: string) => {
		if (pizzaId === pizzaData?._id && pizzaId) {
			console.log('object');
			updatePizza({ ...form, ...pizzaData! });
		} else {
			console.log('object2');
			createPizza();
		}
	};

	async function deletePizza(id: string) {
		setDeletingId(id);
		const res = await fetch(`/api/pizzas/${id}`, { method: 'DELETE' });
		if (res.ok) {
			setPizzas((prev) => prev.filter((p) => p._id !== id));
		}
		setDeletingId(null);
	}

	// upload image
	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});

		const { url } = await res.json();
		setForm({
			image: url!,
			category: form?.category,
			description: form?.description,
			name: form?.name,
		});
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div>
			<div className='flex items-center justify-between mb-8'>
				<h1 className='text-2xl font-bold text-dark'>Menu ({pizzas.length})</h1>
				<button
					onClick={() => setShowAdd(true)}
					className='flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors'
				>
					<Plus className='h-4 w-4' />
					Add Pizza
				</button>
			</div>

			{/* Add form */}
			{showAdd && (
				<div className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='font-bold text-dark'>New Pizza</h2>
						<button onClick={() => setShowAdd(false)}>
							<X className='h-5 w-5 text-gray-400' />
						</button>
					</div>
					<div className='grid grid-cols-2 gap-3 mb-3'>
						<input
							placeholder='Pizza Name'
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
						<input
							placeholder='Category'
							value={form.category}
							onChange={(e) => setForm({ ...form, category: e.target.value })}
							className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>
					</div>
					<input
						placeholder='Description'
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
						className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary mb-3'
					/>
					{/* <input
						placeholder='Image URL'
						value={form.image}
						onChange={(e) => setForm({ ...form, image: e.target.value })}
						className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary mb-4'
					/> */}
					<FileDropzone uploadImage={uploadImage} image={pizzaData?.image!} />

					<button
						onClick={() => handleSubmitForm(pizzaData?._id!)}
						className='px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm'
					>
						{pizzaData?._id === editingId ? 'Update Pizza' : 'Add Pizza'}
					</button>
				</div>
			)}

			<div className='grid gap-4'>
				{pizzas.map((pizza) => (
					<PizzaMenuCardAdmin
						pizza={pizza}
						toggleAvailability={toggleAvailability}
						onEditPizza={() => {
							setPizzaData(pizza);
							setEditingId(pizza._id);
							setShowAdd(true);
						}}
						onDeletePizza={() => deletePizza(pizza?._id)}
					/>
				))}
			</div>
		</div>
	);
}
