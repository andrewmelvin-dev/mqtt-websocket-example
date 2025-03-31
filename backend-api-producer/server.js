const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const httpStatus = require('http-status-codes');
const fs = require('fs');

const MQTT_SERVER = 'mqtt://test.mosquitto.org';
const MQTT_TOPIC = 'amelvin-dev/mqtt-websocket-example/devices/updates';
const FRONTEND_ORIGIN = 'http://localhost:3000';
const EXPRESS_PORT = 3001;

// Define the status and sub status codes used by the simulator
const STATUS = {
	OKAY: 0,
	ALERT: 1,
	WARNING: 2,
	DANGER: 3
};

const SUB_STATUS = {
	OKAY: {
		NONE: 0,
	},
	ALERT: {
		DEVICE_LOW_BATTERY: 1,
		HEAVY_MACHINERY_NEARBY: 2
	},
	WARNING: {
		AIR_DUST: 3,
		AIR_ORGANIC_COMPOUNDS: 4,
		AIR_VENTILATION_FAILURE: 5,
		TEMPERATURE_SPIKE: 6,
		WATER_HAZARD: 7
	},
	DANGER: {
		POISON_GAS: 8,
		SEISMIC_ACTIVITY: 9,
		WATER_FLOODING: 10,
		FIRE_HAZARD: 11,
		ELECTRICAL_FAULT: 12
	}
};

// Setup the express app
const app = express();
app.use(express.urlencoded({ extended: true }));	// Enable form data parsing

// Enable CORS for frontend access
app.use(cors({
	origin: FRONTEND_ORIGIN,
	methods: ['GET', 'POST', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Setup the mqtt client
const mqttClient = mqtt.connect(MQTT_SERVER);

// The following variables define behaviour of the simulator: how many items are updated,
// the chance of an update occuring, and how often the simulator is periodically triggered
let simulatorUpdateItemsMinimum;
let simulatorUpdateItemsMaximum;
let simulatorUpdateChance;
let simulatorUpdateInterval;
let isRunningSimulator = false;
let simulatorIntervalHandler = null;

// Load the initial set of device data when the server thread starts
let devices;
fs.readFile('data/devices.json', 'utf8', (err, data) => {
	devices = err ? [] : JSON.parse(data);
});

/**
 * Define the route that provides the initial set of device data
 * Method: GET
 * Path: /items
 */
app.get('/items', (req, res) => {
	log('Express', 'GET request for /items');
	res.status(httpStatus.StatusCodes.OK).json(devices);
});

/**
 * Define the route that updates a specific device based on the id
 * Method: PATCH
 * Path: /items/:id
 */
app.patch('/items/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	log('Express', `PATCH request for /items/${id}`);

	// Search for the device to update
	const index = devices.findIndex(device => device.id === id);
	if (index < 0) {
		log('Express', 'Device not found');
		return res.status(httpStatus.StatusCodes.BAD_REQUEST).json({ message: 'Device not found' });
	}

	// Define converters that will change the data type for properties that are not stored as strings
	const typeConverters = {
		status: (value) => (value !== undefined ? parseInt(value) : undefined),
		subStatus: (value) => (value !== undefined ? parseInt(value) : undefined),
		position: (value) => (value !== undefined ? { "x": parseFloat(value.x ?? 0), "y": parseFloat(value.y ?? 0) } : undefined)
	};

	// Iterate over the properties in the request body
	let device = {};
	for (const key in req.body) {
		if (req.body.hasOwnProperty(key) && req.body[key] !== undefined) {
			// Apply the conversion function if it exists for this key
			device[key] = typeConverters[key] ? typeConverters[key](req.body[key]) : req.body[key];
		}
	}

	// Merge the existing object with the new properties
	devices[index] = { ...devices[index], ...device };

	// Publish the update to the MQTT topic
	const updateJSON = JSON.stringify([{ id, updated: new Date().toISOString(), ...device }]);
	log('MQTT-Producer', `Publishing to topic [${MQTT_TOPIC}] data [${updateJSON}]`);
	mqttClient.publish(MQTT_TOPIC, updateJSON);

	log('Express', 'Device updated');
	res.status(httpStatus.StatusCodes.OK).json({ message: 'Device updated successfully' });
});

/**
 * Define the route that starts the simulator that will periodically perform data updates
 * Method: POST
 * Path: /start
 */
app.post('/start', (req, res) => {
	log('Express', 'POST request for /start');
	if (isRunningSimulator) {
		log('Simulator', 'The simulator is already running');
		return res.status(httpStatus.StatusCodes.BAD_REQUEST).json({ message: 'The simulator is already running' });
	}

	if (devices.length === 0) {
		log('Simulator', 'Unable to start simulator: device list is empty');
		return res.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Unable to start simulator: device list is empty' });
	}

	simulatorUpdateItemsMinimum = Math.min(Math.ceil(req.body.itemsMinimum) || 1, devices.length);
	simulatorUpdateItemsMaximum = Math.min(Math.floor(req.body.itemsMaximum) || devices.length, devices.length);
	simulatorUpdateChance = req.body.updateChance || 100;
	simulatorUpdateInterval = req.body.updateInterval || 5000;

	log('Simulator', `Starting simulator...`);
	log('Simulator', `Items count: [${simulatorUpdateItemsMinimum}-${simulatorUpdateItemsMaximum}]`);
	log('Simulator', `Chance of update: [${simulatorUpdateChance}%]`);
	log('Simulator', `Interval: [${simulatorUpdateInterval}ms]`);

	isRunningSimulator = true;
	simulatorIntervalHandler = setInterval(() => runSimulatorDataUpdates(), simulatorUpdateInterval);

	res.status(httpStatus.StatusCodes.OK).json({ message: 'Simulator started' });
});

/**
 * Define the route that stops the simulator
 * Method: POST
 * Path: /stop
 */
app.post('/stop', (req, res) => {
	log('Express', 'POST request for /stop');
	if (!isRunningSimulator) {
		log('Simulator', 'The simulator is not currently running');
		return res.status(httpStatus.StatusCodes.BAD_REQUEST).json({ message: 'The simulator is not currently running' });
	}

	clearInterval(simulatorIntervalHandler);
	isRunningSimulator = false;
	log('Simulator', 'Stopped');

	res.status(httpStatus.StatusCodes.OK).json({ message: 'Simulator stopped' });
});

/**
 * Start the express server
 */
app.listen(EXPRESS_PORT, () => {
	log('Express', `Server running on port ${EXPRESS_PORT}`);
});

/**
 * Provide a log function that outputs the module, datetime, and message in a consistent format
 */
function log(module, message) {
	console.log(`[${module}] ${new Date().toISOString()} ${message}`);
}

/**
 * Provide a function to perform periodic data updates
 */
function runSimulatorDataUpdates() {
	// Determine if the update should proceed based on the previously specified chance
	if ((Math.random() * 100) < simulatorUpdateChance) {
		// Determine a number of devices to update at random between the previously specified minimum and maximum counts
		const itemsCount = Math.floor(Math.random() * (simulatorUpdateItemsMaximum - simulatorUpdateItemsMinimum + 1) + simulatorUpdateItemsMinimum);
		log('Simulator', `Periodic data update: triggering update of [${itemsCount}] devices`);

		let updates = [];
		for (let i = 0; i < itemsCount; i++) {
			// Find a device to update (NOTE: it is possible the same device may be updated more than once - this can be changed depending on the use case)
			let deviceId = devices[Math.floor(Math.random() * devices.length)]?.id;
			if (deviceId) {
				// Push the random changes to the status and substatus of the device into an array
				updates.push({ id: deviceId, updated: new Date().toISOString(), ...getRandomStatus() });
			}
		}

		// Publish the updates to the MQTT topic
		if (updates.length > 0) {
			const updateJSON = JSON.stringify(updates);
			log('MQTT-Producer', `Publishing to topic [${MQTT_TOPIC}] data [${updateJSON}]`);
			mqttClient.publish(MQTT_TOPIC, updateJSON);
		}
	} else {
		log('Simulator', 'Periodic data update: no updates');
	}
}

/**
 * Provide a function to get a random status and sub status for a device
 */
function getRandomStatus() {
	const statusKeys = Object.keys(STATUS);
	const randomStatusKey = statusKeys[Math.floor(Math.random() * statusKeys.length)];
	const randomStatus = STATUS[randomStatusKey];

	if (SUB_STATUS[randomStatusKey]) {
			const substatusKeys = Object.keys(SUB_STATUS[randomStatusKey]);
			if (substatusKeys.length > 0) {
					const randomSubstatusKey = substatusKeys[Math.floor(Math.random() * substatusKeys.length)];
					return { status: randomStatus, substatus: SUB_STATUS[randomStatusKey][randomSubstatusKey] };
			}
	}
	return { status: randomStatus };
}
