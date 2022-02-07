import Session from './session';

class SessionHandler {
	private static sessions = new Map<string, Session>();

	public static bind(session: Session): string {
		const sid = 'sid'; // TODO: generate unique sid instead
		this.sessions.set(sid, session);
		return sid;
	}

	public static get(sid: string) : Session {
		const session = this.sessions.get(sid);
		if (session === undefined) {
			throw new Error("sessionhandler.ts#SessionHandler#get#if: session doessn't exist: " + sid);
		}

		return session;
	}
}

export default SessionHandler;
