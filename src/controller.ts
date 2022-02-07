import Device from './device';
import SessionHandler from './sessionhandler';
import net from 'net';
import Packet from './packet';
import Session from './session';

class Controller extends Device {
	sock: net.Socket;
	constructor(sock: net.Socket) {
		super();
		this.sock = sock;
		sock.on('data', (data: string) => {
			const json = Packet.parse(data);
			this.onMessage(json);
		});
	}

	static startListner() {
		net.createServer((client: net.Socket) => {
			// wait for it to send session id then
			// create new client and attach it to session
			client.on('data', (data: string) => {
				const json = Packet.parse(data);
				if (json['type'] !== "session-connect" || !json['sid']) {
					throw new Error("first data from client isn't a valid session-connect packet: " + JSON.stringify(json));
				}
				const session: Session = SessionHandler.get(json['sid']);
				client.removeAllListeners('data');
				session.connect(new Controller(client));
			});
		}).listen(1235, () => { 
			console.log('server is listening');
		});
	}

    send(json: unknown): void {
		this.sock.write(JSON.stringify(json));
    }

    destroy(): void {
        throw new Error('Method not implemented.');
    }
}

export default Controller;
