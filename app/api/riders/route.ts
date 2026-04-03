import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Rider from '@/models/Rider';

export async function GET() {
	const session = await auth();
	if ((session?.user as { role?: string })?.role !== 'admin') {
		return Response.json({ error: 'Forbidden' }, { status: 403 });
	}
	await dbConnect();
	const riders = await Rider.find().sort({ name: 1 });
	return Response.json(riders);
}

export async function POST(request: NextRequest) {
	const session = await auth();
	if ((session?.user as { role?: string })?.role !== 'admin') {
		return Response.json({ error: 'Forbidden' }, { status: 403 });
	}
	await dbConnect();
	try {
		const body = await request.json();
		const rider = await Rider.create(body);
		return Response.json(rider, { status: 201 });
	} catch (e: any) {
		if (e.code === 11000) {
			return Response.json({ error: 'Rider with this phone already exists' }, { status: 400 });
		}
		return Response.json({ error: 'Failed to create rider' }, { status: 500 });
	}
}
