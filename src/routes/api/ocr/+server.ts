import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createWorker } from 'tesseract.js';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();
		const image = formData.get('image');

		if (!image || !(image instanceof File)) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		// Create worker
		const worker = await createWorker('eng');

		try {
			// Convert image to base64
			const buffer = await image.arrayBuffer();
			const base64Image = Buffer.from(buffer).toString('base64');

			// Recognize text
			const { data: { text } } = await worker.recognize(
				`data:${image.type};base64,${base64Image}`
			);

			// Terminate worker
			await worker.terminate();

			return json({ text });
		} catch (error) {
			if (worker) {
				await worker.terminate();
			}
			throw error;
		}
	} catch (error) {
		console.error('OCR Error:', error);
		return json(
			{ error: 'Failed to process image' },
			{ status: 500 }
		);
	}
};