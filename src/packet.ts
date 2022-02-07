class Packet {
	static parse(packet: string) {
		let json;
		try {
			json = JSON.parse(packet);
		} catch(ex) {
			throw new Error('packet.ts#Packet#parse: failed to parse json: ' + packet);
		}

		if (json["type"] == undefined) {
			throw new Error("packet.ts#Packet#parse: no type element in packet: " + packet);
		}

		return json;
	}
}

export default Packet;
