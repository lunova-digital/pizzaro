import { unlink, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
	const data = await req.formData();
	const file = data.get('file') as File;

	if (!file) {
		return Response.json({ error: 'No file uploaded' }, { status: 400 });
	}

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	// unique filename
	const fileName = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;
	const uploadDir = path.join(process.cwd(), 'public/uploads');
	const filePath = path.join(uploadDir, fileName);

	await writeFile(filePath, buffer);

	return Response.json({
		url: `/uploads/${fileName}`,
	});
}

export async function DELETE(req: Request) {
	const { file } = await req.json();

	if (!file) {
		return Response.json({ error: 'File required' }, { status: 400 });
	}

	const filePath = path.join(process.cwd(), 'public', file);

	try {
		await unlink(filePath);
		return Response.json({ success: true });
	} catch {
		return Response.json({ error: 'File not found' }, { status: 404 });
	}
}
