import EventEmitter from 'events';
import net from 'net';
import WebSocket from 'ws';
import { parse } from './packet';
import { data, device_connected, device_data, dti, generic_packet, packet, store_data, ucid } from 'webgames-common-lib';
import { Session } from './session';
import jwt from 'jsonwebtoken';

abstract class Device extends EventEmitter {
	session: Session | undefined;
	static deviceType: dti;
	send!: (data: packet) => void; // defined in fromXXXsocket()
	abstract destroy(): void;
	ucid: ucid;

	constructor(sock: WebSocket | net.Socket, data?: data) {
		super();

		if (sock instanceof WebSocket) {
			this.fromWebSocket(sock);
		} else if (sock instanceof net.Socket) {
			this.fromNetSocket(sock);
		} else {
			throw new Error("device initialized from incorrect type");
		}

		this.onConnect();

		// parse data ...
		const payload = this.readData(data);
		if (payload) {
			this.ucid = payload.ucid;
		} else {
			// generate new ucid
			this.ucid = "ucid";
			this.saveData();
		}
	}

	private fromWebSocket(sock: WebSocket) {
		// remove handshake listener
		sock.removeAllListeners('message');

		sock.on('message', (msg: string) => {
			const json = parse(msg);
			this.onMessage(json);
		})

		this.send = (data: packet) => {
			sock.send(JSON.stringify(data));
		}
	}

	private fromNetSocket(sock: net.Socket) {
		// remove handshake listener
		sock.removeAllListeners('data');

		sock.on('data', (msg: string) => {
			const json = parse(msg);
			this.onMessage(json);
		})

		this.send = (data: packet) => {
			sock.write(JSON.stringify(data));
		}
	}

	static events = {
		message: Symbol('message'),
		connect: Symbol('connect'),
		disconnect: Symbol('disconnect'),
	}

	protected onMessage(packet: generic_packet) {
		// handle device-disconnect
		this.emit(Device.events.message, packet);
	}

	protected saveData() {
		const payload: device_data = {
			ucid: this.ucid,
		}
		const data: data = jwt.sign(payload, 'secret');
		const packet: store_data = {
			type: "store-data",
			data: data,
		}
		this.send(packet);
	}

	protected readData(data?: data): device_data | undefined {
		console.log("reading data");
		if (!data) {
			return;
		}
		const tmp = device_data.safeParse(jwt.verify(data, 'secret'));
		if (!tmp.success) {
			throw new Error("payload is not a device_data packet");
		}
		console.log("got data: " + JSON.stringify(tmp.data));
		return tmp.data;
	}

	protected onConnect() {
		const json: device_connected = {
			type: "device-connected",
			successful: true,
		};
		this.send(json);
	}
}

export default Device;
