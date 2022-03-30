import Device from './device';
import { dti, generic_packet, session_connect, session_connected } from 'webgames-common-lib';
import { Session } from './session';

class Controller extends Device {
	static deviceType: dti = "controller";

	onMessage(packet: generic_packet) {
		// handle session-connect
		// handle case if display sends session-connect
		const tmp = session_connect.safeParse(packet);
		if (tmp.success) {
			const connected: session_connected = {
				type: "session-connected",
				successful: true,
			}
			const s = Session.get(tmp.data.ust);
			if (!(s instanceof Session)) {
				connected.successful = false;
				console.log("controller.ts#Controller#onMessage: no session with ust = " + tmp.data.ust);
			} else {
				s.connect(this);
			}
			this.send(connected);
			return;
		}

		super.onMessage(packet);
	}

	destroy(): void {
		throw new Error('Method not implemented.');
	}
}

export default Controller;
