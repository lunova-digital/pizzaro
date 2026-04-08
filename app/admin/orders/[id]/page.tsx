'use client';

import { formatPrice } from '@/lib/utils';
import {
	ArrowLeft,
	CheckCircle,
	Download,
	Mail,
	MapPin,
	MessageCircle,
	Package,
	Phone,
	Pizza,
	Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Order {
	_id: string;
	guestName?: string;
	guestEmail?: string;
	items: {
		name: string;
		size: string;
		quantity: number;
		price: number;
		toppings: string[];
	}[];
	deliveryType: string;
	address?: { street: string; city: string; state: string; zipCode: string };
	phone: string;
	addressNotes?: string;
	status: string;
	riderPhone?: string;
	riderName?: string;
	rating?: number;
	totalAmount: number;
	createdAt: string;
}

const statusLabel: Record<string, string> = {
	placed: 'Order Placed',
	preparing: 'Preparing',
	'out-for-delivery': 'Out for Delivery',
	delivered: 'Delivered',
	'ready-for-pickup': 'Ready for Pickup',
	'picked-up': 'Picked Up',
};

export default function OrderDetailPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const isNew = searchParams.get('new') === '1';
	const autoDownload = searchParams.get('download') === '1';
	const guestEmail = searchParams.get('email');
	const guestPhone = searchParams.get('phone');
	const invoiceRef = useRef<HTMLDivElement>(null);

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedRating] = useState(0);
	const [, setRatingLoading] = useState(false);

	const [riderForm, setRiderForm] = useState({ name: '', phone: '' });
	const [riderSaving, setRiderSaving] = useState(false);
	const [riderSaved, setRiderSaved] = useState(false);
	const [riders, setRiders] = useState<
		{ _id: string; name: string; phone: string }[]
	>([]);
	const [showNewRiderForm, setShowNewRiderForm] = useState(false);

	const fetchOrder = useCallback(async () => {
		try {
			let url = `/api/orders/${params.id}`;
			if (guestEmail) url += `?email=${encodeURIComponent(guestEmail)}`;
			else if (guestPhone) url += `?phone=${encodeURIComponent(guestPhone)}`;
			const res = await fetch(url);
			if (!res.ok) return;
			const data = await res.json();
			setOrder(data);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	}, [params.id, guestEmail, guestPhone]);

	useEffect(() => {
		fetchOrder();
		const interval = setInterval(fetchOrder, 30000);
		return () => clearInterval(interval);
	}, [fetchOrder]);

	useEffect(() => {
		fetch('/api/riders')
			.then((r) => r.json())
			.then((data) => {
				if (Array.isArray(data)) setRiders(data);
			})
			.catch(() => {});
	}, []);

	// Sync riderForm with loaded order data
	useEffect(() => {
		if (order) {
			setRiderForm({
				name: order.riderName || '',
				phone: order.riderPhone || '',
			});
		}
	}, [order]);

	async function saveRider() {
		if (!order) return;
		setRiderSaving(true);
		try {
			if (showNewRiderForm && riderForm.name && riderForm.phone) {
				const riderRes = await fetch('/api/riders', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: riderForm.name.trim(),
						phone: riderForm.phone.trim(),
					}),
				});
				if (riderRes.ok) {
					const newRider = await riderRes.json();
					setRiders((prev) =>
						[...prev, newRider].sort((a, b) => a.name.localeCompare(b.name)),
					);
					setShowNewRiderForm(false);
				}
			}

			const res = await fetch(`/api/orders/${order._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					riderName: riderForm.name.trim(),
					riderPhone: riderForm.phone.trim(),
				}),
			});
			if (res.ok) {
				const updated = await res.json();
				setOrder(updated);
				setRiderSaved(true);
				setTimeout(() => setRiderSaved(false), 2500);
			}
		} finally {
			setRiderSaving(false);
		}
	}

	useEffect(() => {
		if (autoDownload && order && !loading) {
			const t = setTimeout(() => window.print(), 400);
			return () => clearTimeout(t);
		}
	}, [autoDownload, order, loading]);

	function handlePrint() {
		window.print();
	}

	async function submitRating() {
		if (!selectedRating || !order) return;
		setRatingLoading(true);
		try {
			const res = await fetch(`/api/orders/${order._id}/rate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating: selectedRating }),
			});
		} finally {
			setRatingLoading(false);
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	if (!order) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4'>
				<Package className='h-12 w-12 text-gray-300' />
				<p className='text-gray-500 font-medium'>Order not found</p>
				<Link
					href='/orders/track'
					className='text-primary text-sm hover:underline'
				>
					Track your order
				</Link>
			</div>
		);
	}

	const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
	const deliveryFee = order.totalAmount - subtotal;

	const addressStr = order.address
		? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}`
		: null;

	function toWaPhone(raw: string) {
		return raw.replace(/\D/g, '');
	}

	function riderWhatsAppUrl() {
		if (!order?.riderPhone) return null;
		const mapLink = addressStr
			? ` Google Maps: https://maps.google.com/?q=${encodeURIComponent(addressStr)}`
			: '';

		const itemsText = order.items
			.map((item) => {
				const sizeStr = item.size ? ` (${item.size})` : '';
				const toppingsStr =
					item.toppings && item.toppings.length > 0
						? ` + ${item.toppings.join(', ')}`
						: '';
				return `• ${item.quantity}x ${item.name}${sizeStr}${toppingsStr}`;
			})
			.join('\n');

		const msg = `Assigned Order #${shortId}.\nDelivery address: ${addressStr ?? 'See order details'}.${mapLink}\n\nOrder Items:\n${itemsText}`;
		return `https://wa.me/${toWaPhone(order.riderPhone)}?text=${encodeURIComponent(msg)}`;
	}
	const shortId = order._id.slice(-8).toUpperCase();
	const orderedAt = new Date(order.createdAt);

	return (
		<>
			{/* Print styles injected via style tag */}
			<style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-printable, #invoice-printable * { visibility: visible !important; }
          #invoice-printable { position: fixed; inset: 0; padding: 32px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

			<div className='min-h-screen bg-gray-50 py-10 px-4'>
				<div className='mx-auto max-w-4xl'>
					{/* Back + actions — hidden on print */}
					<div className='no-print flex items-center justify-between mb-6'>
						<Link
							href={'/admin/orders'}
							className='inline-flex items-center gap-2 text-gray-400 hover:text-dark transition-colors text-sm'
						>
							<ArrowLeft className='h-4 w-4' />
							'Back to Orders'
						</Link>
						<button
							onClick={handlePrint}
							className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm'
						>
							<Download className='h-4 w-4' />
							Download Invoice
						</button>
					</div>

					{/* Success banner — new orders only */}
					{isNew && (
						<div className='no-print mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-center'>
							<CheckCircle className='h-10 w-10 text-green-500 mx-auto mb-2' />
							<h2 className='font-bold text-dark text-lg'>
								Order Placed Successfully!
							</h2>
							<p className='text-sm text-gray-500 mt-1'>
								We&apos;ve received your order and are getting started on it.
							</p>
							{(guestEmail || guestPhone) && (
								<p className='text-xs text-gray-400 mt-2'>
									Save your Order ID:{' '}
									<span className='font-mono font-bold text-dark'>
										{shortId}
									</span>{' '}
									— you&apos;ll need it to track your order.
								</p>
							)}
						</div>
					)}

					{/* ── RIDER ASSIGNMENT (admin only) ── */}
					{order.deliveryType === 'delivery' && (
						<div className='no-print bg-white rounded-2xl border border-border shadow-sm p-6 mb-6'>
							<h2 className='font-bold text-dark mb-4 flex items-center gap-2'>
								<Truck className='h-5 w-5 text-primary' />
								Rider Assignment
							</h2>
							{!showNewRiderForm ? (
								<div className='grid sm:grid-cols-2 gap-3 mb-4 items-end'>
									<div className='col-span-full sm:col-span-1'>
										<label className='block text-xs font-semibold text-gray-500 mb-1'>
											Select Existing Rider
										</label>
										<select
											className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary'
											value={riderForm.phone}
											onChange={(e) => {
												const selected = riders.find(
													(r) => r.phone === e.target.value,
												);
												if (selected) {
													setRiderForm({
														name: selected.name,
														phone: selected.phone,
													});
												} else {
													setRiderForm({ name: '', phone: '' });
												}
											}}
										>
											<option value=''>-- Select Rider --</option>
											{riders.map((r) => (
												<option key={r._id} value={r.phone}>
													{r.name} ({r.phone})
												</option>
											))}
										</select>
									</div>
									<div className='col-span-full sm:col-span-1'>
										<button
											onClick={() => {
												setShowNewRiderForm(true);
												setRiderForm({ name: '', phone: '' });
											}}
											className='text-sm text-primary font-medium hover:underline px-2 py-2.5'
										>
											+ Add New Rider
										</button>
									</div>
								</div>
							) : (
								<div className='grid sm:grid-cols-2 gap-3 mb-4'>
									<div className='col-span-full flex items-center justify-between'>
										<label className='block text-xs font-semibold text-gray-500'>
											Create New Rider
										</label>
										<button
											onClick={() => setShowNewRiderForm(false)}
											className='text-xs text-gray-400 hover:text-dark'
										>
											Cancel
										</button>
									</div>
									<div>
										<input
											value={riderForm.name}
											onChange={(e) =>
												setRiderForm((f) => ({ ...f, name: e.target.value }))
											}
											placeholder='Rider Name (e.g. Rahim)'
											className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary'
										/>
									</div>
									<div>
										<input
											value={riderForm.phone}
											onChange={(e) =>
												setRiderForm((f) => ({ ...f, phone: e.target.value }))
											}
											placeholder='Rider Phone (e.g. 01711000000)'
											className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary'
										/>
									</div>
								</div>
							)}
							<div className='flex flex-wrap gap-3 mt-4'>
								{(!order.riderPhone ||
									showNewRiderForm ||
									riderForm.phone !== order.riderPhone) && (
									<button
										onClick={saveRider}
										disabled={
											riderSaving || (!showNewRiderForm && !riderForm.phone)
										}
										className='px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer'
									>
										{riderSaving
											? 'Saving…'
											: riderSaved
												? '✓ Saved!'
												: 'Assign Rider'}
									</button>
								)}

								{/* WhatsApp button — only shown once rider phone exists */}
								{order.riderPhone && riderWhatsAppUrl() && (
									<a
										href={riderWhatsAppUrl()!}
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors'
									>
										<MessageCircle className='h-4 w-4' />
										Send Location via WhatsApp
									</a>
								)}
							</div>

							{/* Current assignment badge */}
							{order.riderName && (
								<p className='mt-3 text-xs text-gray-400'>
									Currently assigned:{' '}
									<span className='font-semibold text-dark'>
										{order.riderName}
									</span>
									{order.riderPhone && (
										<span className='ml-1 text-gray-400'>
											({order.riderPhone})
										</span>
									)}
								</p>
							)}
						</div>
					)}

					{/* ── INVOICE ── */}
					<div
						id='invoice-printable'
						ref={invoiceRef}
						className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6'
					>
						{/* Invoice header */}
						<div className='bg-gradient-to-r from-primary to-orange-400 px-8 py-7 text-white'>
							<div className='flex items-start justify-between'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
										<Pizza className='h-5 w-5 text-white' />
									</div>
									<div>
										<h1
											className='text-xl font-bold'
											style={{ fontFamily: 'var(--font-heading)' }}
										>
											Pizzaro
										</h1>
										<p className='text-white/70 text-xs'>Order Confirmation</p>
									</div>
								</div>
								<div className='text-right'>
									<p className='text-white/70 text-xs mb-0.5'>Order ID</p>
									<p className='font-mono font-bold text-lg tracking-wider'>
										{shortId}
									</p>
									<span
										className={`mt-1 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white`}
									>
										{statusLabel[order.status] ?? order.status}
									</span>
								</div>
							</div>
						</div>

						{/* Date + type row */}
						<div className='flex flex-wrap gap-x-8 gap-y-2 px-8 py-4 bg-orange-50/60 border-b border-orange-100 text-sm'>
							<div>
								<span className='text-gray-400'>Date: </span>
								<span className='font-medium text-dark'>
									{orderedAt.toLocaleDateString('en-US', {
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
								</span>
							</div>
							<div>
								<span className='text-gray-400'>Time: </span>
								<span className='font-medium text-dark'>
									{orderedAt.toLocaleTimeString('en-US', {
										hour: 'numeric',
										minute: '2-digit',
									})}
								</span>
							</div>
							<div>
								<span className='text-gray-400'>Type: </span>
								<span className='font-medium text-dark capitalize'>
									{order.deliveryType}
								</span>
							</div>
							<div>
								<span className='text-gray-400'>Payment: </span>
								<span className='font-medium text-dark'>Cash on Delivery</span>
							</div>
						</div>

						<div className='px-8 py-6 space-y-6'>
							{/* Billed to */}
							<div>
								<h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
									Customer Details
								</h3>
								<div className='space-y-1.5 text-sm text-gray-600'>
									{order.guestName && (
										<div className='flex items-center gap-2'>
											<Package className='h-3.5 w-3.5 text-gray-300 shrink-0' />
											<span className='font-medium text-dark'>
												{order.guestName}
											</span>
										</div>
									)}
									{order.guestEmail && (
										<div className='flex items-center gap-2'>
											<Mail className='h-3.5 w-3.5 text-gray-300 shrink-0' />
											{order.guestEmail}
										</div>
									)}
									<div className='flex items-center gap-2'>
										<Phone className='h-3.5 w-3.5 text-gray-300 shrink-0' />
										{order.phone}
									</div>
									{order.deliveryType === 'delivery' && order.address && (
										<div className='flex items-start gap-2'>
											<MapPin className='h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5' />
											<span>
												{order.address.street}, {order.address.city},{' '}
												{order.address.state} {order.address.zipCode}
											</span>
										</div>
									)}
									{order.addressNotes && (
										<div className='flex items-start gap-2 text-gray-500 bg-orange-50 rounded-lg px-3 py-2 text-xs'>
											<MapPin className='h-3.5 w-3.5 text-orange-300 shrink-0 mt-0.5' />
											<span>{order.addressNotes}</span>
										</div>
									)}
									{order.deliveryType === 'pickup' && (
										<div className='flex items-center gap-2'>
											<MapPin className='h-3.5 w-3.5 text-gray-300 shrink-0' />
											<span>Pickup — 123 Pizza Street, New York, NY 10001</span>
										</div>
									)}
								</div>
							</div>

							{/* Items table */}
							<div>
								<h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
									Order Items
								</h3>
								<div className='rounded-xl border border-gray-100 overflow-hidden'>
									<table className='w-full text-sm'>
										<thead>
											<tr className='bg-gray-50 border-b border-gray-100'>
												<th className='text-left px-4 py-2.5 font-semibold text-gray-500'>
													Item
												</th>
												<th className='text-right px-4 py-2.5 font-semibold text-gray-500'>
													Qty
												</th>
												<th className='text-right px-4 py-2.5 font-semibold text-gray-500'>
													Unit
												</th>
												<th className='text-right px-4 py-2.5 font-semibold text-gray-500'>
													Total
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-gray-50'>
											{order.items.map((item, i) => (
												<tr key={i}>
													<td className='px-4 py-3'>
														<p className='font-medium text-dark'>
															{item.name}
															{item.size ||
															(item.toppings &&
																item.toppings.length > 0 &&
																!item.size) ? (
																<span className='text-gray-400 font-normal ml-1 text-xs'>
																	(
																	{item.size
																		? item.size
																		: item.toppings.join(', ')}
																	)
																</span>
															) : null}
														</p>
														{item.size &&
															item.toppings &&
															item.toppings.length > 0 && (
																<p className='text-xs text-gray-400 mt-0.5'>
																	+ {item.toppings.join(', ')}
																</p>
															)}
													</td>
													<td className='px-4 py-3 text-right text-gray-600'>
														{item.quantity}
													</td>
													<td className='px-4 py-3 text-right text-gray-600'>
														{formatPrice(item.price)}
													</td>
													<td className='px-4 py-3 text-right font-semibold text-dark'>
														{formatPrice(item.price * item.quantity)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Totals */}
							<div className='ml-auto max-w-xs space-y-2 text-sm'>
								<div className='flex justify-between text-gray-500'>
									<span>Subtotal</span>
									<span>{formatPrice(subtotal)}</span>
								</div>
								<div className='flex justify-between text-gray-500'>
									<span>Delivery Fee</span>
									<span>
										{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}
									</span>
								</div>
								<div className='flex justify-between font-bold text-dark text-base pt-2 border-t border-gray-200'>
									<span>Total</span>
									<span className='text-primary'>
										{formatPrice(order.totalAmount)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
