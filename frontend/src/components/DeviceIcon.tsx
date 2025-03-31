import { JSX } from 'react';
import Box from '@mui/material/Box';
import Device from '../types-enums/Device';
import SensorsIcon from '@mui/icons-material/Sensors';
import Battery2BarIcon from '@mui/icons-material/Battery2Bar';
import DirectionsRailwayIcon from '@mui/icons-material/DirectionsRailway';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterIcon from '@mui/icons-material/Water';
import DangerousIcon from '@mui/icons-material/Dangerous';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { DeviceStatus, DeviceSubStatus } from '../types-enums/DeviceStatus';

// Define the structure of the props passed to this component
interface DeviceIconProps {
	device: Device;
}

export default function DeviceIcon({ device }: DeviceIconProps) {
	let backgroundColor: string = 'green';
	let sensorColor: string = 'white';
	let subStatusJSX: JSX.Element | null = null;

  const subStatusStyle: React.CSSProperties = {
    position: 'absolute',
    left: '7px',
    top: '-6px',
  };
	
	switch (device.status) {
		case DeviceStatus.ALERT:
			backgroundColor = 'wheat';
			sensorColor = 'black';
			break;
		case DeviceStatus.WARNING:
			backgroundColor = 'orange';
			sensorColor = 'black';
			break;
		case DeviceStatus.DANGER:
			backgroundColor = 'red';
			break;
	}

	switch (device.subStatus) {
		case DeviceSubStatus.DEVICE_LOW_BATTERY:
			subStatusJSX = <Battery2BarIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.HEAVY_MACHINERY_NEARBY:
			subStatusJSX = <DirectionsRailwayIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.AIR_DUST:
		case DeviceSubStatus.AIR_ORGANIC_COMPOUNDS:
		case DeviceSubStatus.AIR_VENTILATION_FAILURE:
			subStatusJSX = <AirIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.TEMPERATURE_SPIKE:
			subStatusJSX = <DeviceThermostatIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.WATER_HAZARD:
			subStatusJSX = <WaterIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.POISON_GAS:
		case DeviceSubStatus.SEISMIC_ACTIVITY:
			subStatusJSX = <DangerousIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.WATER_FLOODING:
			subStatusJSX = <WaterIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.FIRE_HAZARD:
			subStatusJSX = <LocalFireDepartmentIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
		case DeviceSubStatus.ELECTRICAL_FAULT:
			subStatusJSX = <ElectricBoltIcon sx={{ color: sensorColor, fontSize: 16 }} style={subStatusStyle} />;
			break;
	}

	return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 30, height: 30, borderRadius: '50%', backgroundColor }}>
      <SensorsIcon sx={{ color: sensorColor, fontSize: 24 }} />
			{subStatusJSX}
    </Box>
	);
}
