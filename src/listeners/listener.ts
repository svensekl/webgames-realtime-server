import EventEmitter from 'events';
import { Socket } from 'net';
import WebSocket from 'ws';
import Controller from '../controller';
import Display from '../display';
import { parse } from '../packet';
import { device_connect } from 'webgames-common-lib';

class Listener extends EventEmitter {
	port: number;
	constructor(port: number) {
		super();
		this.port = port;
	}

	static event = {
		connect: Symbol('connect'),
	}

	protected onMessage(sock: WebSocket | Socket, msg: string) {
		const json = parse(msg);

		const dcp: device_connect = device_connect.parse(json);

		console.log("device-connect: " + dcp['device-type']);

		// based on device-type create new device
		switch (dcp['device-type']) {
			case Display.deviceType:
				new Display(sock, dcp.data);
				break;
			case Controller.deviceType:
				new Controller(sock, dcp.data);
				break;
			default:
				throw new Error("unsupported device type: " + dcp['device-type']);
		}
	}
}

export default Listener;
