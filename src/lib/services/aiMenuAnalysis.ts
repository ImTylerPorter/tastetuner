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
	// Convert file to base64
	const reader = new FileReader();
	const imageData = await new Promise<string>((resolve, reject) => {
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(input);
	});

	const response = await fetch('/api/analyze-menu', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			image: imageData,
			location
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to analyze menu');
	}

	return response.json();
}