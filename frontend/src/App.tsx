import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import DeviceEdit from './components/DeviceEdit';
import SimulatorController from './components/SimulatorController';
import DevicesMap from './components/DevicesMap';
import Device, { DeviceUpdateProps } from './types-enums/Device';
import { Box, Grid } from '@mui/material';

const API_ITEMS: string = 'http://localhost:3001/items';
const API_START: string = 'http://localhost:3001/start';
const API_STOP: string = 'http://localhost:3001/stop';
const WEBSOCKET_CONSUMER: string = 'ws://localhost:3002';

export default function App() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
	const [simulatorRunning, setSimulatorRunning] = useState<boolean>(false);

	// Load the list of all devices when loading the page
	useEffect(() => {
		fetch(API_ITEMS)
			.then((res) => res.json())
			.then((data) => setDevices(data));
	}, []);

	// Define a handler for when the WebSocket receives a message
	const handleWebSocketMessage = useCallback((message: string) => {
		console.log('Received WebSocket message:', message);
		try {
			const updatedDevices: Device[] = JSON.parse(message) as Device[];
			// Create a map of updatedDevices for faster lookup by id
			const updatedDevicesMap = new Map(updatedDevices.map(device => [device.id, device]));
			// Update the devices state with the new data
			setDevices(previousDevices => {
				return previousDevices.map(device => {
					const updatedDevice = updatedDevicesMap.get(device.id);
					return updatedDevice ? { ...device, ...updatedDevice } : device;
				});
			});
		} catch (error: unknown) {
			console.error('Error parsing WebSocket message:', error);
		}
	}, []);

	// Initiate the WebSocket connection to the backend consumer via the useWebSocket custom hook
	useWebSocket(WEBSOCKET_CONSUMER, handleWebSocketMessage);	

	// Define the handler function for starting the simulator
	const handleSimulatorStart = (itemsMinimum: number, itemsMaximum: number, updateChance: number, updateInterval: number) => {
		const formData = new URLSearchParams();
		formData.append('itemsMinimum', itemsMinimum.toString());
		formData.append('itemsMaximum', itemsMaximum.toString());
		formData.append('updateChance', updateChance.toString());
		formData.append('updateInterval', updateInterval.toString());

		fetch(API_START, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
			body: formData.toString()
		})
    .then(response => {
      if (response.ok) {
        setSimulatorRunning(true);
        console.log('Simulator started successfully');
      } else {
        console.error('Failed to start simulator', response.status);
      }
    })
    .catch(error => { console.error('Request failed', error); });		
	};

	// Define the handler function for stopping the simulator
	const handleSimulatorStop = () => {
		fetch(API_STOP, { method: 'POST' })
    .then(response => {
      if (response.ok) {
        setSimulatorRunning(false);
        console.log('Simulator stopped successfully');
      } else {
        console.error('Failed to stop simulator', response.status);
      }
    })
    .catch(error => { console.error('Request failed', error); });		
	};

	const handleSelectDeviceOnMap = (id: number) => {
		setSelectedDevice(devices.find((device) => device.id === id));
	};

	const handleDeviceUpdate = (device: DeviceUpdateProps) => {
		// Update the device on the server, which will later update the local devices state via the WebSocket connection
		// NOTE: there is an opportunity to optimise this by directly updating the local devices state, but for now that
		// is beyond the scope of this project

		// Add each specified property in the device object to the form data (excluding id, which is specified in the path)
		const formData = new URLSearchParams();
		Object.keys(device).forEach((key: string) => {
			if (key !== 'id') {
				formData.append(key, String(device[key as keyof DeviceUpdateProps]));
			}
		});

		fetch(`${API_ITEMS}/${device.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
			body: formData.toString()
		})
    .then(response => {
      if (response.ok) {
        console.log(`Update for device [${device.id}] was successful`);
      } else {
        console.error(`Update for device [${device.id}] failed:`, response.status);
      }
    })
    .catch(error => { console.error('Request failed', error); });		
	};

	return (
		<Box sx={{ width: '100%', height: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<Grid container spacing={3} sx={{ width: '100%', height: '100%', maxWidth: '1200px', padding: '2em' }}>
				<Grid size={{ xs: 12, md: 5 }} container direction='column' spacing={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					<Box sx={{ flexGrow: 1 }}>
						<DeviceEdit selectedDevice={selectedDevice} onUpdate={handleDeviceUpdate} />
					</Box>
					<SimulatorController onSimulatorStart={handleSimulatorStart} onSimulatorStop={handleSimulatorStop} simulatorRunning={simulatorRunning} />
				</Grid>
				<Grid size={{ xs: 12, md: 7 }} container justifyContent='center' alignItems='center' sx={{ flexGrow: 1 }}>
					<DevicesMap devices={devices} onSelectDevice={handleSelectDeviceOnMap}/>
				</Grid>
			</Grid>
		</Box>
	);
}
