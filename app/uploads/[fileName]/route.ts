import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ fileName: string }> }) {
	const { fileName } = await params;
	const filePath = path.join(process.cwd(), 'public/uploads', fileName);
	try {
		const file = await readFile(filePath);
		
		const ext = path.extname(filePath).toLowerCase();
		let contentType = 'image/jpeg';
		if (ext === '.png') contentType = 'image/png';
		if (ext === '.webp') contentType = 'image/webp';
		if (ext === '.svg') contentType = 'image/svg+xml';
		if (ext === '.gif') contentType = 'image/gif';

		return new Response(file, {
			headers: { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            },
		});
	} catch {
		return new Response('File not found', { status: 404 });
	}
}
