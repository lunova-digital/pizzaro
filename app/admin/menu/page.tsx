'use client';

import FileDropzone from '@/components/FileIDropzone';
import PizzaMenuCardAdmin from '@/components/menu/PizzaMenuCardAdmin';
import ModalWrapper from '@/components/ModalWrapper';
import { Plus, Search, X } from 'lucide-react';
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
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [pizzaData, setPizzaData] = useState<Pizza | null>();
	const [searchQuery, setSearchQuery] = useState('');
	const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
		[],
	);
	const [category, setCategory] = useState('');

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

	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});

		const { url } = await res.json();
		setForm((prev) => ({
			...prev,
			image: url!,
		}));
	};

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

	const createCategory = async () => {
		if (!category) return;

		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: category,
				name_bn: '',
				image:
					'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
			}),
		});
		if (res.ok) {
			const newCat = await res.json();
			setCategories((prev) => [...prev, newCat]);
			setShowAddCat(false);
		}
	};

	return (
		<div>
			<div className='flex items-center justify-between mb-8'>
				<h1 className='text-2xl font-bold text-dark'>Menu ({pizzas.length})</h1>
				<div className='flex items-center gap-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
						<input
							type='text'
							placeholder='Search pizzas...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary w-64'
						/>
					</div>
					<button
						onClick={() => setShowAddCat(true)}
						className='flex items-center gap-2 px-4 py-2 bg-orange-100 text-primary font-semibold rounded-xl hover:bg-orange-200 transition-colors'
					>
						+ Add Category
					</button>
					<button
						onClick={() => setShowAdd(true)}
						className='flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors'
					>
						<Plus className='h-4 w-4' />
						Add Pizza
					</button>
				</div>
			</div>

			{showAddCat && (
				<ModalWrapper size='lg'>
					<div className='bg-white rounded-2xl p-6  mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-bold text-dark'>New Category</h2>
							<button onClick={() => setShowAddCat(false)}>
								<X className='h-5 w-5 text-gray-400' />
							</button>
						</div>

						<input
							placeholder='Category Name'
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
						/>

						<button
							onClick={() => createCategory()}
							className={`mt-3 px-6 py-2 ${!category ? 'bg-primary/50' : 'bg-primary hover:bg-primary-dark'} text-white font-semibold rounded-xl  transition-colors text-sm`}
							disabled={!category}
						>
							Add Category
						</button>
					</div>
				</ModalWrapper>
			)}

			{/* Add form */}
			{showAdd && (
				<ModalWrapper size='4xl'>
					<div className='bg-white rounded-2xl p-6 mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-bold text-dark'>New Pizza</h2>
							<button onClick={() => setShowAdd(false)}>
								<X className='h-5 w-5 text-gray-400' />
							</button>
						</div>
						<div className='grid grid-cols-2 gap-3 mb-3'>
							<input
								placeholder='Pizza Name (EN)'
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							/>
							<input
								placeholder='পিৎজার নাম (বাংলা)'
								value={form.name_bn}
								onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
								className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
							/>
							<select
								value={form.category}
								onChange={(e) => setForm({ ...form, category: e.target.value })}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							>
								<option value=''>-- Select Category --</option>
								{categories.map((c) => (
									<option key={c._id} value={c.name}>
										{c.name}
									</option>
								))}
							</select>
						</div>
						<input
							placeholder='Description (EN)'
							value={form.description}
							onChange={(e) =>
								setForm({ ...form, description: e.target.value })
							}
							className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary mb-2'
						/>
						<input
							placeholder='বিবরণ (বাংলায় লিখুন)'
							value={form.description_bn}
							onChange={(e) =>
								setForm({ ...form, description_bn: e.target.value })
							}
							className='w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary mb-3'
						/>

						<FileDropzone uploadImage={uploadImage} image={pizzaData?.image!} />

						{/* Custom Sizes Section */}
						<div className='mt-4 mb-6 border border-gray-100 rounded-xl p-4 bg-gray-50/50'>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='font-semibold text-dark text-sm'>
									Pizza Sizes & Prices
								</h3>
								<button
									onClick={() =>
										setForm({
											...form,
											sizes: [...form.sizes, { name: '', price: 0 }],
										})
									}
									className='text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1'
								>
									<Plus className='h-3 w-3' /> Add Size
								</button>
							</div>
							{form.sizes.length === 0 ? (
								<p className='text-xs text-gray-400'>
									No sizes added. Please add at least one size.
								</p>
							) : (
								<div className='space-y-2'>
									{form.sizes.map((size, index) => (
										<div key={index} className='flex items-center gap-3'>
											<input
												placeholder='Size (e.g. 5 inc or Regular)'
												value={size.name}
												onChange={(e) => {
													const newSizes = [...form.sizes];
													newSizes[index].name = e.target.value;
													setForm({ ...form, sizes: newSizes });
												}}
												className='flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
											/>
											<div className='relative w-32'>
												<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
													৳
												</span>
												<input
													type='number'
													placeholder='Price'
													value={size.price || ''}
													onChange={(e) => {
														const newSizes = [...form.sizes];
														newSizes[index].price = Number(e.target.value);
														setForm({ ...form, sizes: newSizes });
													}}
													className='w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
												/>
											</div>
											<button
												onClick={() => {
													const newSizes = form.sizes.filter(
														(_, i) => i !== index,
													);
													setForm({ ...form, sizes: newSizes });
												}}
												className='w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors'
											>
												<X className='h-4 w-4' />
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						<button
							onClick={() => handleSubmitForm(pizzaData?._id!)}
							className='px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm'
						>
							{pizzaData?._id === editingId ? 'Update Pizza' : 'Add Pizza'}
						</button>
					</div>
				</ModalWrapper>
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
