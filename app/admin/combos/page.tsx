'use client';

import ComboForm from '@/components/admin/combos/ComboForm';
import CombosList from '@/components/admin/combos/CombosList';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Combo {
	_id: string;
	name: string;
	name_bn?: string;
	description: string;
	description_bn?: string;
	items: string[];
	price: number;
	image: string;
	isAvailable: boolean;
	isFeatured?: boolean;
	offerEndsAt?: string;
}

const EMPTY_FORM = {
	name: '',
	name_bn: '',
	description: '',
	description_bn: '',
	itemsText: '', // textarea value — split on save
	price: 0,
	image: '',
	isAvailable: true,
	isFeatured: false,
	offerEndsAt: '',
};

export default function AdminCombosPage() {
	const [combos, setCombos] = useState<Combo[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		fetch('/api/combos?all=true')
			.then((r) => r.json())
			.then((data) => {
				if (Array.isArray(data)) setCombos(data);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	function openAdd() {
		setForm({ ...EMPTY_FORM });
		setEditingId(null);
		setError('');
		setShowForm(true);
	}

	function openEdit(combo: Combo) {
		setForm({
			name: combo.name,
			name_bn: combo.name_bn || '',
			description: combo.description,
			description_bn: combo.description_bn || '',
			itemsText: combo.items.join('\n'),
			price: combo.price,
			image: combo.image,
			isAvailable: combo.isAvailable,
			isFeatured: combo.isFeatured || false,
			offerEndsAt: combo.offerEndsAt
				? new Date(combo.offerEndsAt).toISOString().slice(0, 16)
				: '',
		});
		setEditingId(combo._id);
		setError('');
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditingId(null);
		setError('');
	}

	async function uploadImage(file: File) {
		setUploading(true);
		setError('');
		try {
			const fd = new FormData();
			fd.append('file', file);
			const res = await fetch('/api/upload', { method: 'POST', body: fd });
			if (!res.ok) throw new Error('Upload failed');
			const { url } = await res.json();
			setForm((f) => ({ ...f, image: url }));
		} catch {
			setError('Image upload failed. Please try again.');
		} finally {
			setUploading(false);
		}
	}

	async function handleSave() {
		setError('');
		if (!form.name.trim()) {
			setError('Name is required');
			return;
		}
		if (!form.description.trim()) {
			setError('Description is required');
			return;
		}
		if (!form.image) {
			setError('Image is required');
			return;
		}
		if (form.price <= 0) {
			setError('Price must be greater than 0');
			return;
		}
		const items = form.itemsText
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean);
		if (items.length === 0) {
			setError('Add at least one item');
			return;
		}

		setSaving(true);
		try {
			const url = editingId ? `/api/combos/${editingId}` : '/api/combos';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: form.name.trim(),
					name_bn: (form.name_bn || '').trim(),
					description: form.description.trim(),
					description_bn: (form.description_bn || '').trim(),
					items,
					price: form.price,
					image: form.image.trim(),
					isAvailable: form.isAvailable,
					isFeatured: form.isFeatured,
					offerEndsAt: form.offerEndsAt
						? new Date(form.offerEndsAt).toISOString()
						: null,
				}),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || `Server error ${res.status}`);
			}
			const saved: Combo = await res.json();
			if (editingId) {
				setCombos((prev) => prev.map((c) => (c._id === saved._id ? saved : c)));
			} else {
				setCombos((prev) => [saved, ...prev]);
			}
			closeForm();
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Failed to save combo');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(id: string) {
		setDeletingId(id);
		try {
			await fetch(`/api/combos/${id}`, { method: 'DELETE' });
			setCombos((prev) => prev.filter((c) => c._id !== id));
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div className='p-6 max-w-5xl mx-auto'>
			{/* Header */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<h1 className='text-2xl font-bold text-dark'>Combo Offers</h1>
					<p className='text-muted-fg text-sm mt-1'>
						{combos.length} combo{combos.length !== 1 ? 's' : ''}
					</p>
				</div>
				<button
					onClick={openAdd}
					className='flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors cursor-pointer'
				>
					<Plus className='h-4 w-4' />
					Add Combo
				</button>
			</div>

			{/* List */}
			<CombosList
				combos={combos}
				loading={loading}
				setCombos={setCombos}
				openEdit={openEdit}
				handleDelete={handleDelete}
				deletingId={deletingId!}
			/>

			{/* Add / Edit form overlay */}
			{showForm && (
				<ComboForm
					closeForm={closeForm}
					editingId={editingId!}
					error={error}
					form={form}
					handleSave={handleSave}
					saving={saving}
					setForm={setForm}
					uploadImage={uploadImage}
					uploading={uploading}
				/>
			)}
		</div>
	);
}
