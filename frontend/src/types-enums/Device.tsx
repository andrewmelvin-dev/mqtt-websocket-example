import { DeviceStatus, DeviceSubStatus } from './DeviceStatus';

// Define the structure of a device
export default interface Device {
	id: number;
	name: string;
	zone: string;
	status: DeviceStatus;
	subStatus: DeviceSubStatus;
	position: {
		x: number;
		y: number;
	};
	updated: string;
}

export interface DeviceUpdateProps {
	id: number;
	name?: string;
	status: DeviceStatus;
	subStatus: DeviceSubStatus;
}
