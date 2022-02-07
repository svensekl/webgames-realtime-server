import EventEmitter from 'events';

abstract class Device extends EventEmitter {
	constructor () {
		super();
	}

	static events = {
		message: Symbol('message'),
		connect: Symbol('connect'),
		disconnect: Symbol('disconnect'),
	}

	public static startListner: () => void;
	abstract send(json: unknown): void;
	abstract destroy(): void;

	// whenever this device recieves a message
	protected onMessage(json: unknown) {
		this.emit(Device.events.message, json);
	}
}

export default Device;
