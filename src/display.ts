import Device from './device';
import Session from './session';
import Packet from './packet';
import WebSocket, { WebSocketServer } from 'ws';

class Display extends Device {
	private ws: WebSocket;

	constructor(sock: WebSocket) {
		super();
		this.ws = sock;
		sock.onmessage = (msg) => {
			const json = Packet.parse(msg.data.toString());

			if (json['type'] === "session-end") {
				this.destroy();
				return;
			}

			this.onMessage(json);
		};
	}

	public static startListner() {
		const server = new WebSocketServer({ port: 1234 });
		server.on('connection', (ws: WebSocket) => {
			new Session(new Display(ws));
		});
		return;
	}

	send(json: unknown): void {
		this.ws.send(JSON.stringify(json));
	}

    destroy(): void {
        throw new Error('Method not implemented.');
    }
}

export default Display;
