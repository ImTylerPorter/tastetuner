import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';

interface PendingScan {
	id: string;
	imageData: string;
	timestamp: Date;
}

export const pendingScans = writable<PendingScan[]>([]);

// Initialize from IndexedDB
if (browser) {
	initializeDB().catch(console.error);
}

async function initializeDB() {
	const db = await openDB();
	const transaction = db.transaction('pendingScans', 'readonly');
	const store = transaction.objectStore('pendingScans');
	const request = store.getAll();
	const scans = await new Promise<PendingScan[]>((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
	pendingScans.set(scans);
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('tastetuner', 1);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains('pendingScans')) {
				db.createObjectStore('pendingScans', { keyPath: 'id' });
			}
		};
	});
}

export async function savePendingScan(imageData: string): Promise<string> {
	const scan: PendingScan = {
		id: crypto.randomUUID(),
		imageData,
		timestamp: new Date()
	};

	const db = await openDB();
	const transaction = db.transaction('pendingScans', 'readwrite');
	const store = transaction.objectStore('pendingScans');
	await store.add(scan);

	pendingScans.update((scans) => [...scans, scan]);
	return scan.id;
}

export async function removePendingScan(id: string) {
	const db = await openDB();
	const transaction = db.transaction('pendingScans', 'readwrite');
	const store = transaction.objectStore('pendingScans');
	await store.delete(id);

	pendingScans.update((scans) => scans.filter((scan) => scan.id !== id));
}

// Cache Tesseract.js worker and language data
if (browser) {
	cacheWorkerAndData().catch(console.error);
}

async function cacheWorkerAndData() {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js');
			console.log('Service Worker registered:', registration);

			// Cache Tesseract.js files
			const cache = await caches.open('tesseract-cache');
			await cache.addAll([
				'/tesseract/worker.min.js',
				'/tesseract/eng.traineddata.gz'
			]);
		} catch (error) {
			console.error('Service Worker registration failed:', error);
		}
	}
}

// Function to process pending scans when online
export async function processPendingScans(
	processFunction: (imageData: string) => Promise<void>
) {
	if (!navigator.onLine) return;

	const currentScans = get(pendingScans);
	for (const scan of currentScans) {
		try {
			await processFunction(scan.imageData);
			await removePendingScan(scan.id);
		} catch (error) {
			console.error('Failed to process scan:', error);
		}
	}
}