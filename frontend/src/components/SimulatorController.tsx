import { useReducer } from 'react';
import { Card, CardContent, Typography, Button, Box, TextField } from '@mui/material';

// Define the structure of the simulatorControllerState object
interface SimulatorControllerState {
	itemsMinimum: number;
	itemsMaximum: number;
	updateChance: number;
	updateInterval: number;
}

// Define the initial state of the reducer
const simulatorControllerInitialState: SimulatorControllerState = {
	itemsMinimum: 1,
	itemsMaximum: 3,
	updateChance: 100,
	updateInterval: 5000
};

// Define the Action type that determines which state updates are valid
type Action = { type: 'UPDATE'; property: keyof SimulatorControllerState; value: string };

// Define a single reducer that can update any property defined in the SimulatorControllerState interface above
const simulatorControllerReducer = (state: SimulatorControllerState, action: Action) => {
	if (action.type === 'UPDATE') {
		return { ...state, [action.property]: action.value };
	}
	return state;
}

// Define the structure of the props passed to this component
interface SimulatorControllerProps {
	onSimulatorStart: (itemsMinimum: number, itemsMaximum: number, updateChance: number, updateInterval: number) => void;
	onSimulatorStop: () => void;
	simulatorRunning: boolean;
}

export default function SimulatorController({ onSimulatorStart, onSimulatorStop, simulatorRunning }: SimulatorControllerProps) {
	const [state, dispatch] = useReducer(simulatorControllerReducer, simulatorControllerInitialState);

	// Define a handler for a change to an input field
	const handleInputChange = (property: keyof SimulatorControllerState) => (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({ type: 'UPDATE', property: property, value: event.target.value });
	};

	return (
		<Card>
			<CardContent>
				<Typography variant='h4' gutterBottom>Simulator Controller</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField label='Minimum Update Count' type='number' disabled={simulatorRunning} inputProps={{ min: 1, max: state.itemsMaximum }} value={state.itemsMinimum} onChange={handleInputChange('itemsMinimum')} sx={{ width: '50%' }}/>
						<TextField label='Maximum Update Count' type='number' disabled={simulatorRunning} inputProps={{ min: state.itemsMinimum, max: 100 }} value={state.itemsMaximum} onChange={handleInputChange('itemsMaximum')} sx={{ width: '50%' }}/>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField label='Update Chance (%)' type='number' disabled={simulatorRunning} inputProps={{ min: 0, max: 100 }} value={state.updateChance} onChange={handleInputChange('updateChance')} sx={{ width: '50%' }}/>
						<TextField label='Update Interval (ms)' type='number' disabled={simulatorRunning} inputProps={{ min: 1000, max: 10000 }} value={state.updateInterval} onChange={handleInputChange('updateInterval')} sx={{ width: '50%' }}/>
					</Box>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Button variant='contained' color='primary' onClick={() => {
							onSimulatorStart(state.itemsMinimum, state.itemsMaximum, state.updateChance, state.updateInterval);
						}} disabled={simulatorRunning}>Start Simulator</Button>
						<Button variant='contained' color='error' onClick={onSimulatorStop} disabled={!simulatorRunning}>Stop Simulator</Button>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}
