import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Notification } from './notifications';

export const pushEnabled = writable<boolean>(false);

const PUBLIC_VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY'; // TODO: Add to env

export async function initializePushNotifications() {
	if (!browser || !('serviceWorker' in navigator) || !('PushManager' in window)) {
		return false;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			pushEnabled.set(true);
			return true;
		}

		return false;
	} catch (error) {
		console.error('Push notification initialization failed:', error);
		return false;
	}
}

export async function subscribeToPushNotifications() {
	if (!browser || !('serviceWorker' in navigator)) return false;

	try {
		const registration = await navigator.serviceWorker.ready;

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
		});

		// Send subscription to server
		await fetch('/api/push/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(subscription)
		});

		pushEnabled.set(true);
		return true;
	} catch (error) {
		console.error('Failed to subscribe to push notifications:', error);
		return false;
	}
}

export async function unsubscribeFromPushNotifications() {
	if (!browser || !('serviceWorker' in navigator)) return false;

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			await subscription.unsubscribe();
			await fetch('/api/push/unsubscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(subscription)
			});
		}

		pushEnabled.set(false);
		return true;
	} catch (error) {
		console.error('Failed to unsubscribe from push notifications:', error);
		return false;
	}
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

// Types for push notification payloads
export interface PushNotificationPayload {
	message: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	data?: {
		url?: string;
		notification?: Notification;
	};
}

// Function to format notification payload
export function formatPushPayload(notification: Notification): PushNotificationPayload {
	const payload: PushNotificationPayload = {
		message: notification.message,
		body: notification.message,
		icon: '/icons/icon-192.png',
		badge: '/icons/badge-96.png',
		data: {
			notification
		}
	};

	// Add type-specific customizations
	switch (notification.type) {
		case 'follow':
			payload.icon = '/icons/follow-notification.png';
			break;
		case 'share':
			payload.icon = '/icons/share-notification.png';
			break;
		case 'recommendation':
			payload.icon = '/icons/recommendation-notification.png';
			break;
		case 'rating':
			payload.icon = '/icons/rating-notification.png';
			break;
	}

	return payload;
}

export async function showNotification(notification: Notification) {
	if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

	const registration = await navigator.serviceWorker.ready;
	return registration.showNotification(notification.message, {
		body: notification.message,
		icon: '/icon-192x192.png',
		badge: '/icon-192x192.png'
	});
}