import Device, { DeviceUpdateProps } from '../types-enums/Device';
import { JSX, useEffect, useReducer } from 'react';
import { DeviceStatus, DeviceSubStatus } from '../types-enums/DeviceStatus';
import { Card, CardContent, Typography, Box, TextField, Button, MenuItem } from '@mui/material';

/**
 * NOTE: if the simulator is running there is a chance a device being viewed will be updated in the backend without
 * updating the display in this component. I can correct this in a further update.
 */

// Define the initial state of the reducer
const reducerInitialState: Device = {
	id: 0,
	name: '',
	zone: '',
	status: DeviceStatus.OKAY,
	subStatus: DeviceSubStatus.NONE,
	position: { x: 0, y: 0 },
	updated: ''
}

// Define the Action type that determines which state updates are valid
type Action =
	| { type: 'UPDATE_INPUT'; property: string; value: string }
	| { type: 'UPDATE_ALL'; id: number; name: string; status: DeviceStatus; subStatus: DeviceSubStatus }
	| { type: 'UPDATE_STATUS'; status: DeviceStatus; subStatus?: DeviceSubStatus }
	| { type: 'UPDATE_SUB_STATUS'; subStatus: DeviceSubStatus };

// Define a reducer that can perform two common use cases of useReducer:
// 1) The ability to update any property by its name (currently only the 'name' property is setup to do this)
// 2) Update multiple properties at the same time
const deviceReducer = (state: Device, action: Action) => {
	switch (action.type) {
		case 'UPDATE_INPUT':
			// This will update a single field with the matching property name 
			return { ...state, [action.property]: action.value };
		case 'UPDATE_ALL':
			return { ...state, id: action.id, name: action.name, status: action.status, subStatus: action.subStatus };
		case 'UPDATE_STATUS':
			return { ...state, status: action.status, subStatus: action.subStatus !== undefined ? action.subStatus : state.subStatus };
		case 'UPDATE_SUB_STATUS':
			return { ...state, subStatus: action.subStatus };
	}
	return state;
}

// Define the structure of the props passed to this component
interface DeviceEditProps {
	selectedDevice: Device | undefined;
	onUpdate: (state: DeviceUpdateProps) => void
}

export default function DeviceEdit({ selectedDevice, onUpdate }: DeviceEditProps) {
  const [state, dispatch] = useReducer(deviceReducer, selectedDevice || reducerInitialState);	
	let formJSX: JSX.Element | null = null;

  // Ensure the status and sub status drop downs are repopulated when the selected device changes
	useEffect(() => {
		if (selectedDevice) {
			dispatch({ type: 'UPDATE_ALL', id: selectedDevice.id, name: selectedDevice.name, status: selectedDevice.status, subStatus: selectedDevice.subStatus });
		}
  }, [selectedDevice]);

  // Define a handler for a field change
	const handleInputChange = (property: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_INPUT', property: property, value: event.target.value });
	};
	
	// Define a handler for a status change
  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as DeviceStatus;
		dispatch({ type: 'UPDATE_STATUS', status: newStatus, subStatus: DeviceSubStatus.NONE });
  };

  // Define a handler for a sub status change
  const handleSubStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newSubStatus = event.target.value as number;
		dispatch({ type: 'UPDATE_SUB_STATUS', subStatus: newSubStatus });
  };

	// Define a handler for the quick status change buttons
	const handleStatusButton = (status: DeviceStatus, subStatus: DeviceSubStatus) => {
		dispatch({ type: 'UPDATE_STATUS', status, subStatus });
		// Also update the device on the server when a quick status change button has been pressed
		onUpdate({ id: state.id, status, subStatus });
	};

	if (selectedDevice) {
		// Build the list of values for the status and sub status dropdowns
		const statusOptions = Object.entries(DeviceStatus)
			.filter(([, value]) => typeof value === 'number')
			.map(([key, value]) => ({ label: key.replace(/_/g, ' '), value }));
		const subStatusOptions = Object.entries(DeviceSubStatus)
			.filter(([, value]) => typeof value === 'number')
			.map(([key, value]) => ({ label: key.replace(/_/g, ' '), value }));

		formJSX = (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label='Id' type='string' size='small' disabled value={selectedDevice.id} sx={{ width: '50%' }}/>
					<TextField label='Zone' type='string' size='small' disabled value={selectedDevice.zone} sx={{ width: '50%' }}/>
				</Box>
				<TextField label='Name' type='string' size='small' value={state.name} onChange={handleInputChange('name')}/>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField select label='Status' size='small' value={state.status} onChange={handleStatusChange} sx={{ width: '40%', textAlign: 'left' }}>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
					</TextField>
					<TextField select label='Sub Status' size='small' value={state.subStatus} onChange={handleSubStatusChange} sx={{ width: '60%', textAlign: 'left' }}>
          {subStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
					</TextField>
				</Box>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label='Last Updated' type='string' size='small' disabled value={selectedDevice.updated} sx={{ width: '70%' }}/>
					<Button variant='contained' color='primary' onClick={() => onUpdate(state)} sx={{ width: '30%' }}>Update</Button>
				</Box>
				<Typography variant='caption'>Or select a status below</Typography>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'green' }} onClick={() => handleStatusButton(DeviceStatus.OKAY, DeviceSubStatus.NONE)}>Okay</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'wheat', color: 'black' }} onClick={() => handleStatusButton(DeviceStatus.ALERT, DeviceSubStatus.DEVICE_LOW_BATTERY)}>Battery</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'orange', color: 'black' }} onClick={() => handleStatusButton(DeviceStatus.WARNING, DeviceSubStatus.AIR_DUST)}>Dust</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'orange', color: 'black' }} onClick={() => handleStatusButton(DeviceStatus.WARNING, DeviceSubStatus.TEMPERATURE_SPIKE)}>Heat</Button>
				</Box>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'red' }} onClick={() => handleStatusButton(DeviceStatus.DANGER, DeviceSubStatus.POISON_GAS)}>Poison</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'red' }} onClick={() => handleStatusButton(DeviceStatus.DANGER, DeviceSubStatus.SEISMIC_ACTIVITY)}>Seismic</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'red' }} onClick={() => handleStatusButton(DeviceStatus.DANGER, DeviceSubStatus.WATER_FLOODING)}>Flooding</Button>
					<Button variant='contained' sx={{ width: '25%', backgroundColor: 'red' }} onClick={() => handleStatusButton(DeviceStatus.DANGER, DeviceSubStatus.FIRE_HAZARD)}>Fire</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Card sx={{ height: '100%' }}>
			<CardContent>
				<Typography variant='h4' gutterBottom>{selectedDevice ? 'View/edit device' : 'Select a device on the map'}</Typography>
				{formJSX}				
			</CardContent>
		</Card>
	);
}
