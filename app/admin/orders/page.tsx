'use client';

import { SelectInput } from '@/components/SelectInput';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
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

	const [statusFilter, setStatusFilter] = useState('');
	const [orderIdFilter, setOrderIdFilter] = useState<string>('');

	const filteredOrders = orders.filter((order) => {
		const matchesId = order._id
			.toLowerCase()
			.includes(orderIdFilter.toLowerCase());

		const matchesStatus = statusFilter ? order.status === statusFilter : true;
		return matchesId && matchesStatus;
	});

	useEffect(() => {
		fetch('/api/orders')
			.then((r) => r.json())
			.then(setOrders)
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

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	const options = [
		{ value: '1', label: 'Option One' },
		{ value: '2', label: 'Option Two' },
		{ value: '3', label: 'Option Three' },
	];

	return (
		<div>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold text-dark mb-4'>
					Orders ({filteredOrders.length})
				</h1>
				<div className='flex flex-col sm:flex-row gap-2'>
					<input
						type='text'
						placeholder='Search by Order ID...'
						value={orderIdFilter}
						onChange={(e) => setOrderIdFilter(e.target.value)}
						className='flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary'
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className='sm:w-48 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary'
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

			<div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
				<table className='w-full min-w-[700px] text-sm'>
					<thead>
						<tr className='bg-gray-50 border-b border-gray-100'>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Order
							</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Items
							</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Type
							</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Total
							</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Status
							</th>
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Time
							</th>{' '}
							<th className='text-left px-4 py-3 text-gray-500 font-semibold'>
								Action
							</th>
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
							filteredOrders.map((order) => (
								<tr key={order._id} className='hover:bg-gray-50'>
									<td className='px-4 py-3 font-mono font-medium text-dark'>
										#{order._id.slice(-6).toUpperCase()}
									</td>
									<td className='px-4 py-3 text-gray-600 max-w-xs'>
										<div className='line-clamp-1'>
											{order.items
												.map((i) => `${i.quantity}x ${i.name}`)
												.join(', ')}
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
											<span
												className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}
											>
												{order.status}
											</span>

											<SelectInput
												options={STATUSES}
												defaultValue={order?.status}
												_id={order?._id}
												onChange={updateStatus}
												isUpdating={updating === order._id}
											/>
										</div>
									</td>
									<td className='px-4 py-3 text-gray-400 text-xs'>
										{new Date(order.createdAt).toLocaleString('en-US', {
											month: 'short',
											day: 'numeric',
											hour: 'numeric',
											minute: '2-digit',
										})}
									</td>
									<td className='px-4 py-3 text-gray-400 text-xs'>
										<Link href={`/admin/orders/${order?._id}`}>
											<button className='px-4 py-2 rounded-lg cursor-pointer hover:bg-primary flex items-center justify-center text-primary bg-primary/10 hover:text-gray-50 transition-colors'>
												View Details
											</button>
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
