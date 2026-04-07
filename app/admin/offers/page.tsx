'use client';

import OfferList from '@/components/admin/offers/OfferList';
import FileDropzone from '@/components/FileIDropzone';
import ModalWrapper from '@/components/ModalWrapper';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Offer {
	_id: string;
	title: string;
	title_bn: string;
	description: string;
	description_bn: string;
	type: 'percentage' | 'flat' | 'combo';
	discountValue: number;
	targetType: 'all' | 'category' | 'pizza';
	targetId?: string;
	minOrderValue?: number;
	startsAt: string;
	endsAt: string;
	isActive: boolean;
	isFeatured: boolean;
	image?: string;
}

const emptyForm = (): Omit<Offer, '_id'> => ({
	title: '',
	title_bn: '',
	description: '',
	description_bn: '',
	type: 'percentage',
	discountValue: 10,
	targetType: 'all',
	targetId: '',
	minOrderValue: 0,
	startsAt: new Date().toISOString().slice(0, 16),
	endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
	isActive: true,
	isFeatured: false,
	image: '',
});

export default function AdminOffersPage() {
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState(emptyForm());
	const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
		[],
	);
	const [pizzas, setPizzas] = useState<{ _id: string; name: string }[]>([]);
	const [isShowDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		fetchOffers();
		fetch('/api/categories')
			.then((r) => r.json())
			.then(setCategories)
			.catch(() => {});
		fetch('/api/pizzas')
			.then((r) => r.json())
			.then(setPizzas)
			.catch(() => {});
	}, []);

	async function fetchOffers() {
		setLoading(true);
		// fetch all (including expired) from admin perspective
		const res = await fetch('/api/offers/admin');
		if (res.ok) {
			const data = await res.json();
			if (Array.isArray(data)) setOffers(data);
		}
		setLoading(false);
	}

	function openCreate() {
		setForm(emptyForm());
		setEditingId(null);
		setShowForm(true);
	}

	function openEdit(offer: Offer) {
		setForm({
			...offer,
			startsAt: new Date(offer.startsAt).toISOString().slice(0, 16),
			endsAt: new Date(offer.endsAt).toISOString().slice(0, 16),
		});
		setEditingId(offer._id);
		setShowForm(true);
	}

	async function handleSubmit() {
		const body = {
			...form,
			startsAt: new Date(form.startsAt),
			endsAt: new Date(form.endsAt),
		};

		if (editingId) {
			const res = await fetch(`/api/offers/${editingId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (res.ok) {
				const updated = await res.json();
				setOffers((prev) =>
					prev.map((o) => (o._id === editingId ? updated : o)),
				);
			}
		} else {
			const res = await fetch('/api/offers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (res.ok) {
				const created = await res.json();
				setOffers((prev) => [created, ...prev]);
			}
		}
		setShowForm(false);
	}

	async function handleDelete(id: string) {
		const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
		if (res.ok) setOffers((prev) => prev.filter((o) => o._id !== id));
	}

	async function toggleField(
		id: string,
		field: 'isActive' | 'isFeatured',
		current: boolean,
	) {
		const res = await fetch(`/api/offers/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [field]: !current }),
		});
		if (res.ok) {
			const updated = await res.json();
			setOffers((prev) => prev.map((o) => (o._id === id ? updated : o)));
		}
	}

	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);
		const res = await fetch('/api/upload', { method: 'POST', body: formData });
		const { url } = await res.json();
		setForm((prev) => ({ ...prev, image: url! }));
	};

	const isExpired = (endsAt: string) => new Date(endsAt) < new Date();

	if (loading)
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);

	return (
		<div>
			<div className='flex items-center justify-between mb-8'>
				<h1 className='text-2xl font-bold text-dark'>
					অফার ম্যানেজমেন্ট ({offers.length})
				</h1>
				<button
					onClick={openCreate}
					className='flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors'
				>
					<Plus className='h-4 w-4' /> নতুন অফার
				</button>
			</div>

			{/* Form */}
			{showForm && (
				<ModalWrapper size='4xl'>
					<div className='bg-white rounded-2xl p-6 mb-8 border border-orange-100'>
						<div className='flex items-center justify-between mb-5'>
							<h2 className='font-bold text-dark text-lg'>
								{editingId ? 'অফার সম্পাদনা' : 'নতুন অফার তৈরি'}
							</h2>
							<button onClick={() => setShowForm(false)}>
								<X className='h-5 w-5 text-gray-400' />
							</button>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<input
								placeholder='অফারের নাম (EN)'
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							/>
							<input
								placeholder='🇧🇩 অফারের নাম (বাংলা)'
								value={form.title_bn}
								onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
								className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
							/>
							<input
								placeholder='বিবরণ (EN)'
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
							/>
							<input
								placeholder='🇧🇩 বিবরণ (বাংলা)'
								value={form.description_bn}
								onChange={(e) =>
									setForm({ ...form, description_bn: e.target.value })
								}
								className='px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:border-primary'
							/>
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									অফারের ধরন
								</label>
								<select
									value={form.type}
									onChange={(e) =>
										setForm({ ...form, type: e.target.value as Offer['type'] })
									}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								>
									<option value='percentage'>শতকরা ছাড় (%)</option>
									<option value='flat'>নির্দিষ্ট টাকা ছাড় (৳)</option>
									<option value='combo'>কম্বো অফার</option>
								</select>
							</div>
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									ছাড়ের পরিমাণ ({form.type === 'percentage' ? '%' : '৳'})
								</label>
								<input
									type='number'
									min={0}
									value={form.discountValue}
									onChange={(e) =>
										setForm({ ...form, discountValue: Number(e.target.value) })
									}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								/>
							</div>
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									ছাড়ের লক্ষ্যমাত্রা
								</label>
								<select
									value={form.targetType}
									onChange={(e) =>
										setForm({
											...form,
											targetType: e.target.value as Offer['targetType'],
											targetId: '',
										})
									}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								>
									<option value='all'>সমস্ত কার্ট</option>
									<option value='category'>নির্দিষ্ট ক্যাটাগরি</option>
									<option value='pizza'>নির্দিষ্ট পিৎজা</option>
								</select>
							</div>
							{form.targetType !== 'all' &&
								(form.targetType === 'category' ? (
									<select
										value={form.targetId}
										onChange={(e) =>
											setForm({ ...form, targetId: e.target.value })
										}
										className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
									>
										<option value=''>-- ক্যাটাগরি নির্বাচন করুন --</option>
										{categories.map((c) => (
											<option key={c._id} value={c.name}>
												{c.name}
											</option>
										))}
									</select>
								) : (
									<select
										value={form.targetId}
										onChange={(e) =>
											setForm({ ...form, targetId: e.target.value })
										}
										className='px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
									>
										<option value=''>-- পিৎজা নির্বাচন করুন --</option>
										{pizzas.map((p) => (
											<option key={p._id} value={p._id}>
												{p.name}
											</option>
										))}
									</select>
								))}
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									ন্যূনতম অর্ডার (৳)
								</label>
								<input
									type='number'
									min={0}
									value={form.minOrderValue}
									onChange={(e) =>
										setForm({ ...form, minOrderValue: Number(e.target.value) })
									}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								/>
							</div>
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									শুরুর সময়
								</label>
								<input
									type='datetime-local'
									value={form.startsAt}
									onChange={(e) =>
										setForm({ ...form, startsAt: e.target.value })
									}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								/>
							</div>
							<div>
								<label className='text-xs text-gray-500 mb-1 block'>
									শেষের সময়
								</label>
								<input
									type='datetime-local'
									value={form.endsAt}
									onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
									className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary'
								/>
							</div>
							<div className='flex gap-6 items-center col-span-full'>
								<label className='flex items-center gap-2 text-sm cursor-pointer'>
									<input
										type='checkbox'
										checked={form.isActive}
										onChange={(e) =>
											setForm({ ...form, isActive: e.target.checked })
										}
										className='h-4 w-4 accent-primary'
									/>
									সক্রিয়
								</label>
								<label className='flex items-center gap-2 text-sm cursor-pointer'>
									<input
										type='checkbox'
										checked={form.isFeatured}
										onChange={(e) =>
											setForm({ ...form, isFeatured: e.target.checked })
										}
										className='h-4 w-4 accent-primary'
									/>
									হোম পেজে দেখান
								</label>
							</div>
						</div>
						<div className='mt-4'>
							<FileDropzone uploadImage={uploadImage} image={form.image!} />
						</div>
						<button
							onClick={handleSubmit}
							className='mt-5 px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm'
						>
							{editingId ? 'আপডেট করুন' : 'অফার তৈরি করুন'}
						</button>
					</div>
				</ModalWrapper>
			)}

			{/* Offers list */}
			<OfferList
				offers={offers}
				openEdit={openEdit}
				toggleField={toggleField}
				isExpired={isExpired}
				handleDelete={handleDelete}
			/>
		</div>
	);
}
