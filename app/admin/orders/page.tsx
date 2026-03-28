'use client';

import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Order {
	_id: string;
	items: { name: string; quantity: number }[];
	deliveryType: string;
	phone: string;
	address?: { street: string; city: string; state: string; zipCode: string };
	addressNotes?: string;
	status: string;
	riderPhone?: string;
	riderName?: string;
	totalAmount: number;
	createdAt: string;
}

const STATUSES = [
	'placed',
	'preparing',
	'out-for-delivery',
	'delivered',
	'ready-for-pickup',
	'picked-up',
];

const statusColors: Record<string, string> = {
	placed: 'bg-blue-100 text-blue-700',
	preparing: 'bg-yellow-100 text-yellow-700',
	'out-for-delivery': 'bg-orange-100 text-orange-700',
	delivered: 'bg-green-100 text-green-700',
	'ready-for-pickup': 'bg-purple-100 text-purple-700',
	'picked-up': 'bg-green-100 text-green-700',
};

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<string | null>(null);
	const [riderInputs, setRiderInputs] = useState<Record<string, string>>({});
	const [riderNameInputs, setRiderNameInputs] = useState<Record<string, string>>({});

	const [statusFilter, setStatusFilter] = useState('');
	const [orderIdFilter, setOrderIdFilter] = useState<string>('');

	const filteredOrders = orders.filter((order) => {
		const matchesId = order._id.toLowerCase().includes(orderIdFilter.toLowerCase());
		const matchesStatus = statusFilter ? order.status === statusFilter : true;
		return matchesId && matchesStatus;
	});

	useEffect(() => {
		fetch('/api/orders')
			.then((r) => r.json())
			.then((data) => { if (Array.isArray(data)) setOrders(data); })
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	async function updateStatus(orderId: string, status: string) {
		setUpdating(orderId);
		try {
			const res = await fetch(`/api/orders/${orderId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			if (res.ok) {
				setOrders((prev) =>
					prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
				);
			}
		} finally {
			setUpdating(null);
		}
	}

	async function saveRider(orderId: string) {
		const riderPhone = (riderInputs[orderId] ?? '').trim();
		const riderName = (riderNameInputs[orderId] ?? '').trim();
		setUpdating(orderId);
		try {
			const body: Record<string, string> = {};
			if (riderInputs[orderId] !== undefined) body.riderPhone = riderPhone;
			if (riderNameInputs[orderId] !== undefined) body.riderName = riderName;
			const res = await fetch(`/api/orders/${orderId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (res.ok) {
				setOrders((prev) =>
					prev.map((o) =>
						o._id === orderId
							? { ...o, ...(body.riderPhone !== undefined && { riderPhone: body.riderPhone }), ...(body.riderName !== undefined && { riderName: body.riderName }) }
							: o
					),
				);
				setRiderInputs((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
				setRiderNameInputs((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
			}
		} finally {
			setUpdating(null);
		}
	}

	function riderWhatsAppUrl(order: Order) {
		const phone = (riderInputs[order._id] ?? order.riderPhone ?? '').replace(/\D/g, '');
		if (!phone || order.deliveryType !== 'delivery') return null;
		const address = order.address
			? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}`
			: 'No address';
		const notes = order.addressNotes ? `\nNotes: ${order.addressNotes}` : '';
		const items = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
		const shortId = order._id.slice(-8).toUpperCase();
		const mapLink = order.address
			? ` Maps: https://maps.google.com/?q=${encodeURIComponent(address)}`
			: '';
		const msg = `🛵 Delivery #${shortId}\nCustomer: ${order.phone}\nTo: ${address}${mapLink}${notes}\nItems: ${items}`;
		return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-dark mb-8'>
					Orders ({filteredOrders.length})
				</h1>
				<div className='mb-4 space-x-1'>
					<input
						type='text'
						placeholder='Search by Order ID...'
						value={orderIdFilter}
						onChange={(e) => setOrderIdFilter(e.target.value)}
						className='w-full md:w-80 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary'
					/>{' '}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className='w-full md:w-56 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary'
					>
						<option value=''>All Statuses</option>
						{STATUSES.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
				<table className='w-full text-sm'>
					<thead>
						<tr className='bg-gray-50 border-b border-gray-100'>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Order</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Items</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Type</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Total</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Status</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Rider</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>Time</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-100'>
						{filteredOrders.length === 0 ? (
							<tr>
								<td colSpan={7} className='px-4 py-8 text-center text-gray-400'>
									No orders
								</td>
							</tr>
						) : (
							filteredOrders.map((order) => {
								const riderVal = riderInputs[order._id] ?? order.riderPhone ?? '';
					const riderNameVal = riderNameInputs[order._id] ?? order.riderName ?? '';
					const riderDirty = riderInputs[order._id] !== undefined || riderNameInputs[order._id] !== undefined;
								const waUrl = riderWhatsAppUrl(order);
								return (
									<tr key={order._id} className='hover:bg-gray-50'>
										<td className='px-4 py-3 font-mono font-medium text-dark'>
											#{order._id.slice(-6).toUpperCase()}
											{order.deliveryType === 'delivery' && order.address && (
												<p className='text-xs text-gray-400 font-sans font-normal mt-0.5 max-w-[120px] truncate'>
													{order.address.street}
												</p>
											)}
										</td>
										<td className='px-4 py-3 text-gray-600 max-w-xs'>
											<div className='line-clamp-1'>
												{order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
											</div>
										</td>
										<td className='px-4 py-3 capitalize text-gray-600'>
											{order.deliveryType}
										</td>
										<td className='px-4 py-3 font-bold text-dark'>
											{formatPrice(order.totalAmount)}
										</td>
										<td className='px-4 py-3'>
											<div className='flex items-center gap-2'>
												<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
													{order.status}
												</span>
												<select
													value={order.status}
													onChange={(e) => updateStatus(order._id, e.target.value)}
													disabled={updating === order._id}
													className='text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary disabled:opacity-50'
												>
													{STATUSES.map((s) => (
														<option key={s} value={s}>{s}</option>
													))}
												</select>
											</div>
										</td>
										<td className='px-4 py-3'>
											{order.deliveryType === 'delivery' ? (
												<div className='flex flex-col gap-1.5'>
													<div className='flex items-center gap-1.5'>
														<input
															type='text'
															placeholder='Rider name'
															value={riderNameVal}
															onChange={(e) =>
																setRiderNameInputs((prev) => ({ ...prev, [order._id]: e.target.value }))
															}
															className='text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-24 focus:outline-none focus:border-primary'
														/>
														<input
															type='tel'
															placeholder='Phone'
															value={riderVal}
															onChange={(e) =>
																setRiderInputs((prev) => ({ ...prev, [order._id]: e.target.value }))
															}
															className='text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-24 focus:outline-none focus:border-primary'
														/>
													</div>
													{riderDirty && (
														<button
															onClick={() => saveRider(order._id)}
															disabled={updating === order._id}
															className='text-xs bg-primary text-white px-2 py-1.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 self-start'
														>
															Save
														</button>
													)}
													{waUrl && (
														<a
															href={waUrl}
															target='_blank'
															rel='noopener noreferrer'
															title='Send delivery details to rider via WhatsApp'
															className='flex items-center justify-center w-7 h-7 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shrink-0'
														>
															<svg className='h-3.5 w-3.5 fill-current' viewBox='0 0 24 24'>
																<path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
															</svg>
														</a>
													)}
												</div>
											) : (
												<span className='text-xs text-gray-400'>Pickup</span>
											)}
										</td>
										<td className='px-4 py-3 text-gray-400 text-xs'>
											{new Date(order.createdAt).toLocaleString('en-US', {
												month: 'short',
												day: 'numeric',
												hour: 'numeric',
												minute: '2-digit',
											})}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
