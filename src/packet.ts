function parse(data: string) {
	let json;
	try {
		json = JSON.parse(data);
	} catch(ex) {
		throw new Error('packet.ts#Packet#parse: failed to parse json: ' + data);
	}

	return json;
}

export {
	parse,
}
