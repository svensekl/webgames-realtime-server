import { generic_packet, passthrough, ucid, ust } from 'webgames-common-lib';
import Controller from './controller';
import Device from './device';
import Display from './display';

const sessions: Session[] = [];

class Session {
	static new(display: Display): Session {
		const ret = sessions.find(s => s.display.ucid === display.ucid);
		if (ret) {
			console.log(display.ucid + " connected to an existing session.");
			ret.display = display;
			return ret;
		}

		console.log(display.ucid + " is creating a new session.");
		return new Session(display);
	}

	static get(ust: ust): Session | undefined {
		return sessions.find(s => s.ust === ust);
	}

	public ust: ust;

	constructor(display: Display) {
		this.display = display;
		this.clients = [];

		// generate new ust...
		// get usid...
		this.ust = 'sid';
		sessions.push(this);

		this.display.on(Display.events.message, this.fromDisplay);
	}

	connect(client: Controller) {
		console.log("client connected");
		client.on(Controller.events.message, (msg) => { this.fromController(msg, client); });
		this.clients.push(client);
	}

	/////////////////////////////////////////////
	// private usid: string;
	private display: Display;
	private clients: Controller[];

	
	private getDevice(ucid: ucid): Device | undefined {
		if (this.display.ucid === ucid) {
			return this.display;
		}
		return this.clients.find(client => {
			if (client.ucid === ucid) {
				return true;
			}
		})
	}

	private passthrough(data: passthrough, sender: Device) {
		let recvrs: ucid[];
		if (typeof data.for === 'string') {
			recvrs = [data.for];
		} else {
			recvrs = data.for;
		}

		const send: passthrough = {
			type: "passthrough",
			for: sender.ucid,
			data: data.data,
		};

		console.log("passing through");

		recvrs.forEach(client => {
			this.getDevice(client)?.send(send);
		});
	}

	private fromDisplay(data: generic_packet) {
		const tmp = passthrough.safeParse(data);
		if (tmp.success) {
			this.passthrough(tmp.data, this.display);
			return;
		}
	}

	private fromController(data: generic_packet, sender: Controller) {
		const tmp = passthrough.safeParse(data);
		if (tmp.success) {
			this.passthrough(tmp.data, sender);
			return;
		}
	}

}

export { Session };
