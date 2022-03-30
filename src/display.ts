import { Socket } from 'net';
import { device_connected, dti } from 'webgames-common-lib';
import Device from './device';
import { Session } from './session';

class Display extends Device {
	static deviceType: dti = "display";

    destroy(): void {
        throw new Error('Method not implemented.');
    }
	
	protected onConnect() {
		// display creates its own session on connection
		this.session = Session.new(this);
		const json: device_connected = {
			type: "device-connected",
			successful: true,
			ust: this.session.ust,
		};
		this.send(json);
	}
}

export default Display;
