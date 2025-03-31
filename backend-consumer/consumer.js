const mqtt = require('mqtt');
const WebSocket = require('ws');

const MQTT_SERVER = 'mqtt://test.mosquitto.org';
const MQTT_TOPIC = 'amelvin-dev/mqtt-websocket-example/devices/updates';
const WEBSOCKET_PORT = 3002;

// Setup the mqtt client
const mqttClient = mqtt.connect(MQTT_SERVER);

// Setup the WebSocket server
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

let clients = new Set();

// Define the MQTT connection handler that will subscribe to the topic
mqttClient.on('connect', () => {
	mqttClient.subscribe(MQTT_TOPIC);
	log('MQTT-Consumer', `Subscribed to ${MQTT_TOPIC}`);
});

// Define the MQTT message handler that will receive topic updates
mqttClient.on('message', (topic, message) => {
	if (topic === MQTT_TOPIC) {
    log('MQTT-Consumer', `Update received: [${message.toString()}]`);

		// Broadcast the updates to all connected WebSocket clients
		clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message.toString());
			}
		});
	}
});

// WebSocket connection
wss.on('connection', (ws) => {
	clients.add(ws);
	console.log('New WebSocket client connected');
	ws.on('close', () => {
		clients.delete(ws);
		console.log('WebSocket client disconnected');
	});
});

// Provide a log function that outputs the module, datetime, and message in a consistent format
function log(module, message) {
	console.log(`[${module}] ${new Date().toISOString()} ${message}`);
}
