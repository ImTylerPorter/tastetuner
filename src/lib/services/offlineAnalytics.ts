import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface AnalyticsEvent {
	id: string;
	type: string;
	category: string;
	action: string;
	label?: string;
	value?: number;
	timestamp: Date;
	userId?: string;
	sessionId: string;
	metadata?: Record<string, unknown>;
}

export const pendingEvents = writable<AnalyticsEvent[]>([]);

// Initialize IndexedDB
if (browser) {
	initializeDB().catch(console.error);
}

async function initializeDB() {
	const db = await openDB();
	const store = db
		.transaction('analyticsEvents', 'readonly')
		.objectStore('analyticsEvents');
	const events = await getAllFromStore(store);
	pendingEvents.set(events);
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('tastetuner-analytics', 1);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains('analyticsEvents')) {
				db.createObjectStore('analyticsEvents', { keyPath: 'id' });
			}
		};
	});
}

async function getAllFromStore(store: IDBObjectStore): Promise<AnalyticsEvent[]> {
	return new Promise((resolve, reject) => {
		const request = store.getAll();
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
	});
}

let sessionId = crypto.randomUUID();

export async function trackEvent(
	category: string,
	action: string,
	label?: string,
	value?: number,
	metadata?: Record<string, unknown>
) {
	const event: AnalyticsEvent = {
		id: crypto.randomUUID(),
		type: 'event',
		category,
		action,
		label,
		value,
		timestamp: new Date(),
		sessionId,
		metadata
	};

	// Try to send immediately if online
	if (navigator.onLine) {
		try {
			await sendEvent(event);
			return;
		} catch (error) {
			console.warn('Failed to send analytics event, storing offline:', error);
		}
	}

	// Store offline if sending failed or offline
	await storeEvent(event);
}

export async function trackPageView(
	path: string,
	title: string,
	metadata?: Record<string, unknown>
) {
	const event: AnalyticsEvent = {
		id: crypto.randomUUID(),
		type: 'pageview',
		category: 'navigation',
		action: 'view',
		label: title,
		timestamp: new Date(),
		sessionId,
		metadata: {
			path,
			title,
			...metadata
		}
	};

	if (navigator.onLine) {
		try {
			await sendEvent(event);
			return;
		} catch (error) {
			console.warn('Failed to send pageview event, storing offline:', error);
		}
	}

	await storeEvent(event);
}

async function storeEvent(event: AnalyticsEvent) {
	const db = await openDB();
	const transaction = db.transaction('analyticsEvents', 'readwrite');
	const store = transaction.objectStore('analyticsEvents');
	await store.add(event);

	pendingEvents.update((events) => [...events, event]);
}

async function sendEvent(event: AnalyticsEvent): Promise<void> {
	const response = await fetch('/api/analytics', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(event)
	});

	if (!response.ok) {
		throw new Error('Failed to send analytics event');
	}
}

export async function processPendingEvents() {
	if (!navigator.onLine) return;

	const db = await openDB();
	const transaction = db.transaction('analyticsEvents', 'readonly');
	const store = transaction.objectStore('analyticsEvents');
	const events = await getAllFromStore(store);

	for (const event of events) {
		try {
			await sendEvent(event);
			await removeEvent(event.id);
		} catch (error) {
			console.error('Failed to process analytics event:', error);
		}
	}
}

async function removeEvent(id: string) {
	const db = await openDB();
	const transaction = db.transaction('analyticsEvents', 'readwrite');
	const store = transaction.objectStore('analyticsEvents');
	await store.delete(id);

	pendingEvents.update((events) => events.filter((e) => e.id !== id));
}

// Process pending events when coming online
if (browser) {
	window.addEventListener('online', () => {
		processPendingEvents().catch(console.error);
	});
}

// Start a new session when the page is loaded/reloaded
export function startNewSession() {
	sessionId = crypto.randomUUID();
}