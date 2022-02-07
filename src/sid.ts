const sidlen = 6
const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function genSid() {
    let result = '';

    for (let i = 0; i < sidlen; i++)
      result += characters.charAt(Math.random() * characters.length);

   return result;
}

function validSid(sid: string) {
	if (typeof sid !== 'string')
		return false;

	if (sid.length != sidlen)
		return false;

	for (let i = 0; i < sidlen; i++) {
		if (!characters.includes(sid.charAt(i)))
			return false;
	}

	return true;
}

export { genSid, validSid };
