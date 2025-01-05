import type { Drink } from '$lib/types';

export interface LocationInfo {
	locationName: string;
	locationType: 'restaurant' | 'brewery' | 'taproom' | 'bar' | 'other';
	address?: string;
	city?: string;
	state?: string;
}

export interface AIMenuAnalysisResult {
	drinks: Drink[];
	prices: Record<string, number>;
	descriptions: Record<string, string>;
	recommendations?: Array<{
		drinkName: string;
		matchScore: number;
		reasoning: string;
	}>;
	location?: LocationInfo;
}

export async function analyzeMenuWithAI(
	input: File,
	location: LocationInfo
): Promise<AIMenuAnalysisResult> {
	console.log('Starting image conversion...', { fileName: input.name, fileSize: input.size });

	// Convert file to base64
	const reader = new FileReader();
	const imageData = await new Promise<string>((resolve, reject) => {
		reader.onload = () => {
			const result = reader.result;
			console.log('FileReader result type:', typeof result);

			if (typeof result !== 'string') {
				reject(new Error('Failed to read image file'));
				return;
			}
			// Ensure we have a proper data URL
			if (!result.startsWith('data:image/')) {
				reject(new Error('Invalid image format'));
				return;
			}
			console.log('Image data length:', result.length);
			resolve(result);
		};
		reader.onerror = (error) => {
			console.error('FileReader error:', error);
			reject(new Error('Failed to read image file'));
		};
		reader.readAsDataURL(input);
	});

	if (!imageData) {
		throw new Error('Failed to convert image to base64');
	}

	const requestData = {
		image: imageData,
		location
	};

	console.log('Sending request to API...', {
		contentLength: imageData.length,
		locationInfo: location
	});

	const response = await fetch('/api/analyze-menu', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(requestData)
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Failed to analyze menu' }));
		console.error('API error:', error);
		throw new Error(error.error?.message || error.message || 'Failed to analyze menu');
	}

	const result = await response.json();
	console.log('API response received:', {
		status: response.status,
		hasRecommendations: !!result.recommendations
	});
	return result;
}