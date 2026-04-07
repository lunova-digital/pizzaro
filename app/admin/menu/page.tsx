'use client';

import CategoryModal from '@/components/admin/menu/CategoryModal';
import MenuHeader from '@/components/admin/menu/MenuHeader';
import PizzaFormModal from '@/components/admin/menu/PizzaFormModal';
import PizzaMenuCardAdmin from '@/components/menu/PizzaMenuCardAdmin';
import { useEffect, useState } from 'react';

interface Pizza {
	_id: string;
	name: string;
	name_bn?: string;
	description: string;
	description_bn?: string;
	image: string;
	category: string;
	sizes: { name: string; price: number }[];
	isAvailable: boolean;
}

export default function AdminMenuPage() {
	const [pizzas, setPizzas] = useState<Pizza[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [pizzaData, setPizzaData] = useState<Pizza | null>();
	const [searchQuery, setSearchQuery] = useState('');
	const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
		[],
	);

	const [showAdd, setShowAdd] = useState(false);
	const [showAddCat, setShowAddCat] = useState(false);

	const [form, setForm] = useState<{
		name?: string;
		name_bn?: string;
		image?: string;
		description?: string;
		description_bn?: string;
		category?: string;
		sizes: { name: string; price: number }[];
	}>({
		name: '',
		name_bn: '',
		description: '',
		description_bn: '',
		image: '',
		category: '',
		sizes: [],
	});

	useEffect(() => {
		fetch('/api/pizzas')
			.then((r) => r.json())
			.then(setPizzas)
			.catch(() => {})
			.finally(() => setLoading(false));

		fetch('/api/categories')
			.then((r) => r.json())
			.then(setCategories)
			.catch(() => {});
	}, []);

	useEffect(() => {
		setForm({
			name: pizzaData?.name!,
			name_bn: pizzaData?.name_bn || '',
			category: pizzaData?.category!,
			description: pizzaData?.description!,
			description_bn: pizzaData?.description_bn || '',
			image: pizzaData?.image!,
			sizes: pizzaData?.sizes ? [...pizzaData.sizes] : [],
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
		if (!form.name || !form.category || form.sizes.length === 0) {
			alert('Name, category, and at least one size are required.');
			return;
		}
		const res = await fetch('/api/pizzas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...form,
				toppings: [],
			}),
		});
		if (res.ok) {
			const pizza = await res.json();
			setPizzas((prev) => [pizza, ...prev]);
			setForm({
				name: '',
				name_bn: '',
				description: '',
				description_bn: '',
				image: '',
				category: '',
				sizes: [],
			});
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
			const updatedPizza = await res.json();
			setPizzas((prev) =>
				prev.map((p) => (p._id === updatedPizza._id ? updatedPizza : p)),
			);
			setForm({
				name: '',
				name_bn: '',
				description: '',
				description_bn: '',
				image: '',
				category: '',
				sizes: [],
			});
			setShowAdd(false);
			setPizzaData(null);
			setEditingId(null);
		}
	}

	async function deletePizza(id: string) {
		const res = await fetch(`/api/pizzas/${id}`, { method: 'DELETE' });
		if (res.ok) {
			setPizzas((prev) => prev.filter((p) => p._id !== id));
		}
	}

	const filteredPizzas = pizzas.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(p.name_bn && p.name_bn.includes(searchQuery)),
	);

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div>
			<MenuHeader
				count={pizzas?.length}
				onAddCategory={() => setShowAddCat(true)}
				onAddPizza={() => setShowAdd(true)}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>

			{showAddCat && (
				<CategoryModal
					onClose={() => setShowAddCat(false)}
					setCategories={setCategories}
				/>
			)}

			{/* Add form */}
			{showAdd && (
				<PizzaFormModal
					categories={categories}
					setShowAdd={setShowAdd}
					setPizzas={setPizzas}
					editingId={editingId!}
					createPizza={createPizza}
					updatePizza={updatePizza}
					pizzaData={pizzaData!}
					form={form}
					setForm={setForm}
				/>
			)}

			<div className='grid gap-4'>
				{filteredPizzas.map((pizza) => (
					<PizzaMenuCardAdmin
						key={pizza._id}
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
