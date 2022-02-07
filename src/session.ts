import Display from './display';
import Packet from './packet';
import Device from './device';
import SessionHandler from './sessionhandler';

class Session {
	public sid: string;
	private display: Display;
	private clients: Device[];

	constructor(display: Display) {
		this.display = display; // website
		this.clients = []; // phones

		this.sid = SessionHandler.bind(this);

		const displayMessageHandler = (msg: string) => {
			const json = Packet.parse(msg);

			if (json["type"] === "session-end") {
				// TODO: reason
				// this.disconnect(null);
				return;
			}

			if (json["type"] === "passthrough") {
				if (!json["for"] || !json["data"]) {
					throw new Error("Garbled passthrough packet: " + JSON.stringify(json));
				}
				// TODO: json.for
				this.clients.forEach(client => {
					client.send(JSON.stringify(json["data"]));
				});
				return;
			}
		};

		// wait for session-create packet
		this.display.on(Display.events.message, (json) => {
			if (json.type !== "session-create") {
				throw new Error("First message not a valid session-create packet: " + JSON.stringify(json));
			}

			// send a session-start packet
			const packet = {
				type: "session-start",
				sid: this.sid,
			}
			this.display.send(packet);
			this.display.removeAllListeners(Display.events.message);
			this.display.on('message', displayMessageHandler);
		});

		this.display.on(Display.events.disconnect, () => {
			this.clients.forEach(client => {
				client.destroy();
			});
		})
	}

	disconnect(client: Device) {
		// send client disconnected message to display
		console.log('client disconnected');
		this.clients.filter(item => item !== client);
	}

	connect(client: Device) {
		this.clients.push(client);
		console.log('client connected');
		const json = {
			type: "session-connected",
			successful: true,
		};
		client.send(JSON.stringify(json));
		client.on(Device.events.message, (json) => {
			if (json['type'] === "passthrough") {
				if (!json['data']) {
					throw new Error("Garbled passthrough message");
				}
				this.display.send(JSON.stringify(json.data));
				return;
			}
		});
		client.on(Device.events.disconnect, () => {
			this.disconnect(client);
		});
	}
}

export default Session;
