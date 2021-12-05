import { makeRequest } from '../common/apiRequest.js';
// TODO: add statistics, getRows

export default class Variable {
	constructor(argName, options = {}) {
		if (typeof argName === 'object') {
			options = argName;
			argName = undefined;
		}
		const { name = argName, label, description, valueLabels, type, table, query, properties = {} } = options;
		this.name = name;
		this.type = type;
		this.table = table;
		this.query = query;
		this.properties = { name, type, label, description, valueLabels, ...properties };
		this.uri = `${(this.table || this.query).uri}/variables/${this.name}`;
	}
	getProperty(prop) {
		return this.properties?.[prop];
	}
	toString() {
		return JSON.stringify(this.properties, null, 2);
	}

	async exists() {
		try {
			await makeRequest({ method: 'GET', path: this.uri });
		} catch (e) {
			if (e.status !== 404) {
				throw e;
			}
			return false;
		}
		return true;
	}

	async get() {
		this.properties = await makeRequest({ method: 'GET', path: this.uri });
		this.uri = this.properties.uri;
		return this;
	}
}
