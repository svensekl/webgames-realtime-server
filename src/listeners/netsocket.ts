import Listener from './listener';
import net from 'net';

class NetSocketListener extends Listener {
	constructor() {
		super(1235)

		net.createServer((client: net.Socket) => {
			client.on('data', (data) => { this.onMessage(client, data.toString()); });
		}).listen(1235);
	}
}

export default NetSocketListener;

