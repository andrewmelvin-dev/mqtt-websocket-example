import { JSX } from 'react';
import Device from '../types-enums/Device';
import DeviceIcon from './DeviceIcon';
import { Box, Typography } from '@mui/material';

// Define the structure of the props passed to this component
interface DevicesMapProps {
	devices: Device[];
	onSelectDevice: (id: number) => void;
}

export default function DevicesMap({ devices, onSelectDevice } : DevicesMapProps) {
	const renderedDevices: JSX.Element = (
		<div>
			{devices.map((device) => {
				if (device.position?.x && device.position?.y) {
					const left: string = (device.position.x * 100) + '%';
					const top: string = (device.position.y * 100) + '%';
					return <div key={device.id} style={{ cursor: 'pointer', position: 'absolute', left, top }} onClick={() => onSelectDevice(device.id)}><DeviceIcon device={device}/></div>;
				}
				return <></>;
			})}
		</div>
	);
	
	return (
		<Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.200', borderRadius: 2 }}>
			<Box sx={{ padding: '1em', height: '100%' }}>
	      <Typography variant='h4' gutterBottom color='text.primary' sx={{ padding: '10px' }}>Device Map</Typography>
				<div style={{ position: 'relative' }}>
					<img src='images/map.webp' alt='Map' style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
					{renderedDevices}
				</div>
			</Box>
		</Box>
	);
}
