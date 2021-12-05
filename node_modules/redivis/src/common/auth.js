let authToken;
let fetch;
let crypto;
let popupWindowReference;
let currentGetAuthTokenPromise;

export async function authorize({ apiToken }) {
	if (apiToken) {
		return setCachedAuthToken({ access_token: apiToken, expires_at: Date.now() + 1e10 });
	}
	await getAuthToken({ apiToken, forceReauthorization: true });
}

export async function getAuthToken({ forceReauthorization = false }) {
	if (currentGetAuthTokenPromise) {
		if (forceReauthorization) {
			await currentGetAuthTokenPromise;
		} else {
			return currentGetAuthTokenPromise;
		}
	}

	currentGetAuthTokenPromise = (async function () {
		if (forceReauthorization) {
			authToken = null;
		} else if (!authToken) {
			authToken = await getCachedAuthToken();
		}
		if (!crypto) {
			await importCrypto();
		}
		if (!fetch) {
			await importFetch();
		}

		if (authToken && new Date(authToken.expires_at * 1000) > Date.now()) {
			return authToken?.access_token;
		}
		if (typeof process !== 'undefined' && process?.env?.REDIVIS_API_TOKEN) {
			return process.env.REDIVIS_API_TOKEN;
		}
		if (typeof window === 'undefined') {
			authToken = await oAuthNode();
		} else {
			authToken = await oAuthBrowser();
		}
		await setCachedAuthToken(authToken);
		return authToken?.access_token;
	})();
	return currentGetAuthTokenPromise;
}

async function getCachedAuthToken() {
	try {
		if (typeof window === 'undefined') {
			const { default: keytar } = await import('keytar');
			const res = await keytar.getPassword('redivis-node', 'user@redivis.com');
			if (res) {
				return JSON.parse(res);
			}
			return null;
		} else {
			const res = sessionStorage.getItem('redivis_oauth_token');
			if (res) {
				return JSON.parse(res);
			}
			return null;
		}
	} catch (e) {
		// ignore
	}
}

async function setCachedAuthToken(token) {
	try {
		if (typeof window === 'undefined') {
			const { default: keytar } = await import('keytar');
			return keytar.setPassword('redivis-node', 'user@redivis.com', JSON.stringify(token));
		} else {
			sessionStorage.setItem('redivis_oauth_token', JSON.stringify(token));
		}
	} catch (e) {
		//ignore
	}
}

async function oAuthNode() {
	const readline = await import('readline');

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const scope = 'data.data';
	const state = generateRandomString();
	const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
	const { challenge, verifier } = await getPKCE();

	const baseUrl = process.env.REDIVIS_API_ENDPOINT
		? process.env.REDIVIS_API_ENDPOINT.match(/(https:\/\/.*?)\//)[1]
		: `https://redivis.com`;

	// TODO: open browser + local server authentication flow
	const url = `${baseUrl}/oauth/authorize?scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;

	console.log(
		`You must be logged in to perform this action. Please navigate to the following URL to get an authorization code.\n`,
	);
	console.log(url);

	let authCode;
	function validateAuthorizationCode() {
		return new Promise((resolve, reject) => {
			rl.question('\nEnter the authorization code:', async function (code) {
				try {
					authCode = code;

					const res = await fetch(`${baseUrl}/oauth/token`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							grant_type: 'authorization_code',
							code: authCode,
							redirect_uri: decodeURIComponent(redirectUri),
							code_verifier: verifier,
						}),
					});

					// TODO: should we validate state here? Somehow need to include it in the code... should look up if necessary
					const parsedResponse = await res.json();
					if (res.status >= 400) {
						throw new Error(parsedResponse.error);
					}
					rl.close();
					resolve(parsedResponse);
				} catch (e) {
					reject(e);
				}
			});
		});
	}

	while (true) {
		try {
			return await validateAuthorizationCode();
		} catch (e) {
			console.error(`Invalid authorization code: ${e.message}`);
		}
	}
}

async function oAuthBrowser() {
	const scope = 'data.data';
	const redirectUri = encodeURIComponent('urn:ietf:wg:oauth:2.0:oob:auto');
	const state = generateRandomString();
	const { challenge, verifier } = await getPKCE();
	const url = `https://redivis.com/oauth/authorize?&scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
	const popupWindowSettings = 'toolbar=no,menubar=no,width=600,height=600,left=100,top=100';

	return new Promise((resolve, reject) => {
		if (!popupWindowReference || popupWindowReference?.closed) {
			popupWindowReference = window.open(url, 'Authorize Redivis', popupWindowSettings);
		}
		if (
			!popupWindowReference ||
			popupWindowReference.closed ||
			typeof popupWindowReference.closed === 'undefined'
		) {
			return reject(
				new Error(
					`The Redivis authentication window was blocked by the browser. Please enable popups for this page and try again.`,
				),
			);
		}
		popupWindowReference.focus();

		const popupClosedInterval = setInterval(function () {
			if (!popupWindowReference || popupWindowReference.closed) {
				clearInterval(popupClosedInterval);
				window.removeEventListener('message', onMessageEventHandler);
				return reject(new Error(`The Redivis authentication window was prematurely closed. Please try again.`));
			}
		}, 500);

		// add the listener for receiving a message from the popup
		async function onMessageEventHandler(event) {
			try {
				window.removeEventListener('message', onMessageEventHandler);

				clearInterval(popupClosedInterval);

				if (!url.startsWith(event.origin)) {
					throw new Error(`Invalid origin`);
				}
				const { code, state: finalState } = JSON.parse(event.data);
				if (state !== finalState) {
					throw new Error(`An error occurred during login. Inconsistent state.`);
				}
				const res = await fetch(`https://redivis.com/oauth/token`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						grant_type: 'authorization_code',
						code,
						redirect_uri: decodeURIComponent(redirectUri),
						code_verifier: verifier,
					}),
				});

				const parsedResponse = await res.json();
				if (res.status >= 400) {
					throw new Error(parsedResponse.error);
				}
				resolve(parsedResponse);
			} catch (e) {
				reject(e);
			}
		}

		window.addEventListener('message', onMessageEventHandler);
	});
}

async function getPKCE() {
	const verifier = generateRandomString();
	const challenge = await pkceChallengeFromVerifier(verifier);
	return { verifier, challenge };
}

async function importCrypto() {
	if (!crypto) {
		if (typeof window === 'undefined') {
			const { webcrypto } = await import('crypto');
			crypto = webcrypto;
		} else {
			crypto = window.crypto;
		}
	}
}

async function importFetch() {
	if (!fetch) {
		if (typeof window === 'undefined') {
			const { default: nodeFetch } = await import('node-fetch');
			fetch = nodeFetch;
		} else {
			fetch = window.fetch;
		}
	}
}

function generateRandomString() {
	const array = new Uint32Array(56 / 2);
	crypto.getRandomValues(array);
	return Array.from(array, dec2hex).join('');
}

function dec2hex(dec) {
	return ('0' + dec.toString(16)).substr(-2);
}

function sha256(plain) {
	// returns promise ArrayBuffer
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
	// Convert the ArrayBuffer to string using Uint8 array.
	// btoa takes chars from 0-255 and base64 encodes.
	// Then convert the base64 encoded to base64url encoded.
	// (replace + with -, replace / with _, trim trailing =)
	let base64String;
	if (typeof window === 'undefined') {
		base64String = Buffer.from(new Uint8Array(a)).toString('base64');
	} else {
		base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(a)));
	}
	return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function pkceChallengeFromVerifier(v) {
	const hashed = await sha256(v);
	return base64urlencode(hashed);
}
