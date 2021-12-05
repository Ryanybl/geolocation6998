import { getAuthToken } from './auth.js';

let fetch;
if (typeof window !== 'undefined') {
	fetch = window.fetch;
}

if (typeof process !== 'undefined') {
	if (process.env?.REDIVIS_API_ENDPOINT && process.env.REDIVIS_API_ENDPOINT.startsWith('https://localhost')) {
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
	}
}

function getApiEndpoint() {
	if (typeof process !== 'undefined') {
		return process.env?.REDIVIS_API_ENDPOINT || 'https://redivis.com/api/v1';
	} else {
		return 'https://redivis.com/api/v1';
	}
}

export async function makeRequest({ method, path, query, payload, forceReauthorization = false }) {
	let url = `${getApiEndpoint()}${path}`;
	const authToken = await getAuthToken({ forceReauthorization });
	const headers = { Authorization: `Bearer ${authToken}` };

	if (query) {
		url += `?${Object.entries(query)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')}`;
	}

	payload = JSON.stringify(payload);
	if (!fetch) {
		const { default: nodeFetch } = await import('node-fetch');
		fetch = nodeFetch;
	}
	const response = await fetch(url, { method, headers, body: payload });
	let parsedResponse;

	if (response.headers.get('content-type')?.startsWith?.('application/json')) {
		parsedResponse = await response.json();
	} else {
		parsedResponse = await response.text();
	}
	if (response.status >= 400) {
		if (response.status === 401) {
			return makeRequest({ method, path, query, payload, forceReauthorization: true });
		}
		const err = new Error(parsedResponse.error?.message || parsedResponse);
		if (parsedResponse.error) {
			for (const [key, value] of Object.entries(parsedResponse.error)) {
				err[key] = value;
			}
		}
		err.status = response.status;
		throw err;
	}
	return parsedResponse;
}

export async function makePaginatedRequest({ path, pageSize = 100, query = {}, maxResults }) {
	const results = [];
	let page = 0;
	let nextPageToken;

	while (true) {
		if (maxResults && results.length >= maxResults) break;

		if (nextPageToken) {
			query.pageToken = nextPageToken;
		}

		const response = await makeRequest({
			method: 'GET',
			path,
			query: {
				...query,
				maxResults:
					maxResults === undefined || (page + 1) * pageSize < maxResults
						? pageSize
						: maxResults - page * pageSize,
			},
		});
		page++;
		results.push(...response.results);
		nextPageToken = response.nextPageToken;
		if (!nextPageToken) {
			break;
		}
	}
	return results;
}

export async function makeRowsRequest({ uri, maxResults, query = {} }) {
	// TODO: we should leverage streams in nodejs environments
	const res = await makeRequest({
		method: 'GET',
		path: `${uri}/rows`,
		query: {
			...query,
			maxResults,
		},
	});
	return res;
}
