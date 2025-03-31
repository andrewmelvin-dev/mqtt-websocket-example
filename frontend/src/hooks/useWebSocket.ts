import { useEffect, useRef } from 'react';

export function useWebSocket(url: string, onMessage: (data: string) => void) {
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket(url);
		wsRef.current = socket;

		socket.onopen = () => console.log(`Connected to WebSocket [${url}]`);
		socket.onmessage = (event) => onMessage(event.data);
		socket.onerror = (error) => console.error('WebSocket Error:', error);
		socket.onclose = () => console.log(`WebSocket to [${url}] disconnected`);

		return () => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	}, [url, onMessage]);

	return wsRef;
}
