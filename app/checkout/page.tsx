'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { MapPin, Store, CreditCard, User, LocateFixed, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
	ssr: false,
});
import { cn } from '@/lib/utils';

type DeliveryType = 'delivery' | 'pickup';

export default function CheckoutPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const { items, totalPrice, clearCart } = useCartStore();

	const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState({
		street: '',
		city: '',
		state: '',
		zipCode: '',
	});
	// Guest fields
	const [guestName, setGuestName] = useState('');
	const [guestEmail, setGuestEmail] = useState('');

	const [addressNotes, setAddressNotes] = useState('');
	const [mapCenter, setMapCenter] = useState<[number, number]>([
		40.7128, -74.006,
	]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [locating, setLocating] = useState(false);

	// Active offers
	type ActiveOffer = { _id: string; type: string; discountValue: number; targetType: string; targetId?: string; minOrderValue?: number; title_bn?: string; title?: string; };
	const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
	const [discountAmount, setDiscountAmount] = useState(0);

	const isGuest = status === 'unauthenticated';

	useEffect(() => {
		if (items.length === 0 && status !== 'loading' && !submitted) {
			router.push('/menu');
		}
	}, [items, status, router, submitted]);

	useEffect(() => {
		if (session) {
			fetch('/api/user/profile')
				.then((r) => r.json())
				.then((data) => {
					if (data.phone) setPhone(data.phone);
					if (data.addresses?.length) setAddress(data.addresses[0]);
				})
				.catch(() => {});
		}
	}, [session]);

	// Fetch and compute applicable offers
	useEffect(() => {
		fetch('/api/offers')
			.then(r => r.json())
			.then((offers: ActiveOffer[]) => {
				if (!Array.isArray(offers) || offers.length === 0) return;
				const subtotal = totalPrice();
				for (const offer of offers) {
					if (offer.minOrderValue && subtotal < offer.minOrderValue) continue;
					if (offer.targetType !== 'all') continue; // simple: only all-cart for now
					const discount = offer.type === 'percentage'
						? +(subtotal * offer.discountValue / 100).toFixed(2)
						: Math.min(offer.discountValue, subtotal);
					setActiveOffer(offer);
					setDiscountAmount(discount);
					break;
				}
			})
			.catch(() => {});
	}, [items, totalPrice]);

	if (status === 'loading' || items.length === 0) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}



	const subtotal = totalPrice();
	const deliveryFee = deliveryType === 'delivery' && subtotal < 25 ? 4.99 : 0;
	const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

	function handleGetLocation() {
		if (!navigator.geolocation) {
			setError('Geolocation is not supported by your browser');
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				try {
					const { latitude, longitude } = pos.coords;
					setMapCenter([latitude, longitude]);
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
						{ headers: { 'Accept-Language': 'en' } },
					);
					const data = await res.json();
					const a = data.address ?? {};
					setAddress({
						street:
							[a.house_number, a.road].filter(Boolean).join(' ') ||
							a.pedestrian ||
							'',
						city: a.city || a.town || a.village || a.county || '',
						state: a.state || '',
						zipCode: a.postcode || '',
					});
				} catch {
					setError(
						'Could not fetch address from location. Please fill in manually.',
					);
				} finally {
					setLocating(false);
				}
			},
			() => {
				setError(
					'Location access denied. Please fill in your address manually.',
				);
				setLocating(false);
			},
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		if (isGuest) {
			if (!guestName.trim()) {
				setError('Please enter your name');
				return;
			}
			if (!guestEmail.trim() || !guestEmail.includes('@')) {
				setError('Please enter a valid email address');
				return;
			}
		}

		if (deliveryType === 'delivery') {
			if (
				!address.street ||
				!address.city ||
				!address.state ||
				!address.zipCode
			) {
				setError('Please fill in your delivery address');
				return;
			}
		}

		if (!phone) {
			setError('Phone number is required');
			return;
		}

		setLoading(true);
		try {
			const body: Record<string, unknown> = {
				items: items.map((i) => ({
					pizzaId: i.pizzaId,
					name: i.name,
					size: i.size,
					quantity: i.quantity,
					price: i.price,
					toppings: i.toppings,
				})),
				deliveryType,
				address: deliveryType === 'delivery' ? address : undefined,
				addressNotes: addressNotes.trim() || undefined,
				phone,
				totalAmount: total,
				discountAmount: discountAmount || 0,
				offerId: activeOffer?._id,
				status: 'placed',
			};

			if (isGuest) {
				body.guestName = guestName.trim();
				body.guestEmail = guestEmail.trim().toLowerCase();
			}

			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			if (!res.ok) throw new Error('Failed to place order');
			const order = await res.json();
			setSubmitted(true);
			clearCart();
			router.push(
				`/orders/${order._id}?new=1${isGuest ? `&email=${encodeURIComponent(guestEmail.trim().toLowerCase())}` : ''}`,
			);
		} catch {
			setError('Failed to place order. Please try again.');
			setLoading(false);
		}
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10'>
				<h1 className='text-3xl font-bold text-dark mb-8'>Checkout</h1>

				<form onSubmit={handleSubmit} className='grid lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2 space-y-6'>
						{/* Guest info — only shown when not logged in */}
						{isGuest && (
							<div className='bg-white rounded-2xl p-6 shadow-sm'>
								<div className='flex items-center gap-2 mb-4'>
									<User className='h-5 w-5 text-primary' />
									<h2 className='font-bold text-dark'>Your Details</h2>
									<span className='ml-auto text-xs text-gray-400'>
										or{' '}
										<a
											href='/auth/login?redirect=/checkout'
											className='text-primary hover:underline'
										>
											sign in
										</a>
									</span>
								</div>
								<div className='space-y-3'>
									<input
										type='text'
										placeholder='Full Name'
										value={guestName}
										onChange={(e) => setGuestName(e.target.value)}
										required
										className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
									/>
									<input
										type='email'
										placeholder='Email Address (used to track your order)'
										value={guestEmail}
										onChange={(e) => setGuestEmail(e.target.value)}
										required
										className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
									/>
								</div>
								<p className='mt-3 text-xs text-gray-400'>
									Save your email — you will need it to track your order status.
								</p>
							</div>
						)}

						{/* Delivery type */}
						<div className='bg-white rounded-2xl p-6 shadow-sm'>
							<h2 className='font-bold text-dark mb-4'>Delivery Method</h2>
							<div className='grid grid-cols-2 gap-3'>
								<button
									type='button'
									onClick={() => setDeliveryType('delivery')}
									className={cn(
										'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
										deliveryType === 'delivery'
											? 'border-primary bg-primary/5'
											: 'border-gray-200 hover:border-gray-300',
									)}
								>
									<MapPin
										className={cn(
											'h-6 w-6',
											deliveryType === 'delivery'
												? 'text-primary'
												: 'text-gray-400',
										)}
									/>
									<span
										className={cn(
											'font-semibold text-sm',
											deliveryType === 'delivery'
												? 'text-primary'
												: 'text-gray-500',
										)}
									>
										Delivery
									</span>
								</button>
								<button
									type='button'
									onClick={() => setDeliveryType('pickup')}
									className={cn(
										'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
										deliveryType === 'pickup'
											? 'border-primary bg-primary/5'
											: 'border-gray-200 hover:border-gray-300',
									)}
								>
									<Store
										className={cn(
											'h-6 w-6',
											deliveryType === 'pickup'
												? 'text-primary'
												: 'text-gray-400',
										)}
									/>
									<span
										className={cn(
											'font-semibold text-sm',
											deliveryType === 'pickup'
												? 'text-primary'
												: 'text-gray-500',
										)}
									>
										Pickup
									</span>
								</button>
							</div>
						</div>

						{/* Address (delivery only) */}
						{deliveryType === 'delivery' && (
							<div className='bg-white rounded-2xl p-6 shadow-sm'>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='font-bold text-dark'>Delivery Address</h2>
									<button
										type='button'
										onClick={handleGetLocation}
										disabled={locating}
										className='inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50 transition-colors'
									>
										<LocateFixed className='h-4 w-4' />
										{locating ? 'Locating...' : 'Use my location'}
									</button>
								</div>
								<div className='space-y-3'>
									{/* Interactive map — click or drag to pin your location */}
									<div className='rounded-xl overflow-hidden border border-gray-200'>
										<MapPicker
											center={mapCenter}
											onLocationSelect={(lat, lng, addr) => {
												setAddress(addr);
												setMapCenter([lat, lng]);
											}}
										/>
									</div>
									<p className='text-xs text-gray-400'>
										Click on the map or drag the pin to set your delivery
										location. Fields below update automatically.
									</p>
									<input
										type='text'
										placeholder='Street Address'
										value={address.street}
										onChange={(e) =>
											setAddress({ ...address, street: e.target.value })
										}
										className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
									/>
									<div className='grid grid-cols-3 gap-3'>
										<input
											type='text'
											placeholder='City'
											value={address.city}
											onChange={(e) =>
												setAddress({ ...address, city: e.target.value })
											}
											className='px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
										/>
										<input
											type='text'
											placeholder='State'
											value={address.state}
											onChange={(e) =>
												setAddress({ ...address, state: e.target.value })
											}
											className='px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
										/>
										<input
											type='text'
											placeholder='ZIP'
											value={address.zipCode}
											onChange={(e) =>
												setAddress({ ...address, zipCode: e.target.value })
											}
											className='px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
										/>
									</div>
									<textarea
										placeholder='Delivery notes (apartment, floor, landmark, gate code...)'
										value={addressNotes}
										onChange={(e) => setAddressNotes(e.target.value)}
										rows={2}
										className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm'
									/>
								</div>
							</div>
						)}

						{deliveryType === 'pickup' && (
							<div className='bg-white rounded-2xl p-6 shadow-sm'>
								<h2 className='font-bold text-dark mb-2'>Pickup Location</h2>
								<p className='text-gray-500'>
									123 Pizza Street, New York, NY 10001
								</p>
								<p className='text-sm text-gray-400 mt-1'>
									Ready in approximately 20-25 minutes
								</p>
							</div>
						)}

						{/* Phone */}
						<div className='bg-white rounded-2xl p-6 shadow-sm'>
							<h2 className='font-bold text-dark mb-4'>Contact</h2>
							<input
								type='tel'
								placeholder='Phone Number'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
							/>
						</div>

						{/* Payment */}
						<div className='bg-white rounded-2xl p-6 shadow-sm'>
							<h2 className='font-bold text-dark mb-3'>Payment</h2>
							<div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
								<CreditCard className='h-5 w-5 text-gray-400' />
								<div>
									<p className='font-semibold text-dark text-sm'>
										Cash on Delivery
									</p>
									<p className='text-xs text-gray-400'>
										Pay when your order arrives
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Order Summary */}
					<div className='bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24'>
						<h2 className='font-bold text-lg text-dark mb-4'>Order Summary</h2>

						<div className='space-y-3 mb-4 max-h-60 overflow-y-auto'>
							{items.map((item) => (
								<div
									key={item.id}
									className='flex justify-between text-sm text-gray-600'
								>
									<span className='flex-1 truncate'>
										{item.quantity}x {item.name} ({item.size})
									</span>
									<span className='font-medium ml-2'>
										{formatPrice(item.price * item.quantity)}
									</span>
								</div>
							))}
						</div>

						<div className='border-t border-gray-100 pt-3 space-y-2 text-sm'>
							<div className='flex justify-between text-gray-500'>
								<span>Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							{discountAmount > 0 && activeOffer && (
								<div className='flex justify-between text-green-600'>
									<span className='flex items-center gap-1'><Tag className='h-3.5 w-3.5' />{activeOffer.title_bn || activeOffer.title}</span>
									<span>-{formatPrice(discountAmount)}</span>
								</div>
							)}
							<div className='flex justify-between text-gray-500'>
								<span>Delivery</span>
								<span>
									{deliveryType === 'pickup'
										? 'Free (pickup)'
										: deliveryFee === 0
											? 'Free'
											: formatPrice(deliveryFee)}
								</span>
							</div>
							<div className='flex justify-between font-bold text-dark text-base pt-2 border-t border-gray-100'>
								<span>Total</span>
								<span>{formatPrice(total)}</span>
							</div>
						</div>

						{error && (
							<div className='mt-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg'>
								{error}
							</div>
						)}

						<button
							type='submit'
							disabled={loading}
							className='mt-6 w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50'
						>
							{loading
								? 'Placing Order...'
								: `Place Order • ${formatPrice(total)}`}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
