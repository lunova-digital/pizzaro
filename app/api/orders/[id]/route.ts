import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(
	req: NextRequest,
	ctx: RouteContext<'/api/orders/[id]'>,
) {
	await dbConnect();
	const { id } = await ctx.params;
	const order = await Order.findById(id);

	if (!order) {
		return Response.json({ error: 'Order not found' }, { status: 404 });
	}

	const session = await auth();

	if (session?.user) {
		// Logged-in: admin sees all, user sees own
		const userId = (session.user as { id: string }).id;
		const isAdmin = (session.user as { role: string }).role === 'admin';
		if (!isAdmin && order.userId?.toString() !== userId) {
			return Response.json({ error: 'Forbidden' }, { status: 403 });
		}
		return Response.json(order);
	}

	// Unauthenticated: verify by phone or email (for guest/track-order use)
	const phone = req.nextUrl.searchParams.get('phone');
	const email = req.nextUrl.searchParams.get('email');

	if (!phone && !email) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const phoneMatch = phone && order.phone === phone;
	const emailMatch = email && order.guestEmail === email;

	if (!phoneMatch && !emailMatch) {
		return Response.json({ error: 'Order not found' }, { status: 404 });
	}

	return Response.json(order);
}

export async function PATCH(
	request: NextRequest,
	ctx: RouteContext<'/api/orders/[id]'>,
) {
	const session = await auth();
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const isAdmin = (session.user as { role: string }).role === 'admin';
	if (!isAdmin) {
		return Response.json({ error: 'Forbidden' }, { status: 403 });
	}

	await dbConnect();
	const { id } = await ctx.params;
	const body = await request.json();
	const update: Record<string, unknown> = {};
	if (body.status !== undefined) update.status = body.status;
	if (body.riderPhone !== undefined) update.riderPhone = body.riderPhone;
	if (body.riderName !== undefined) update.riderName = body.riderName;

	const order = await Order.findByIdAndUpdate(id, update, { new: true });
	if (!order) {
		return Response.json({ error: 'Order not found' }, { status: 404 });
	}

	return Response.json(order);
}
