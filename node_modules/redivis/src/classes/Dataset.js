import Table from './Table.js';
import Query from './Query.js';
import { makeRequest, makePaginatedRequest } from '../common/apiRequest.js';

// TODO: listAccess
// TODO: finalize sample, versions

export default class Dataset {
	constructor(argName, options = {}) {
		if (typeof argName === 'object') {
			options = argName;
			argName = undefined;
		}
		const { name = argName, version = 'current', user, organization, properties = {} } = options;

		this.name = name;
		this.version = version;
		this.user = user;
		this.organization = organization;
		this.identifier = `${(this.organization || this.user).name}.${this.name}:${this.version}`;
		this.uri = `/datasets/${encodeURIComponent(this.identifier)}`;
		this.properties = properties;
	}

	toString() {
		return JSON.stringify(this.properties, null, 2);
	}

	getProperty(property) {
		return this.properties?.[property];
	}

	table(name, options = {}) {
		return new Table({ name, ...options, dataset: this });
	}

	query(query, options = {}) {
		return new Query({ query, ...options, defaultDataset: this });
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

	async create({ publicAccessLevel = 'none', description } = {}) {
		let path;
		if (this.organization) {
			path = `/organizations/${this.organization.name}/datasets`;
		} else {
			path = `/users/${this.user.name}/datasets`;
		}

		this.properties = await makeRequest({
			method: 'POST',
			path,
			payload: {
				name: this.name,
				description,
				publicAccessLevel,
			},
		});
		this.uri = this.properties.uri;
		return this;
	}

	async update({ name, publicAccessLevel, description } = {}) {
		const payload = {};

		if (name) payload.name = name;
		if (publicAccessLevel) payload.publicAccessLevel = publicAccessLevel;
		if (description) payload.description = description;

		this.properties = await makeRequest({
			method: 'POST',
			path: this.uri,
			payload,
		});
		return this;
	}

	async delete() {
		await makeRequest({ method: 'DELETE', path: this.uri });
	}

	async createNextVersion({ ignoreIfExists = false } = {}) {
		if (!this.properties?.nextVersion) {
			await this.get();
		}
		if (!this.properties.nextVersion) {
			await makeRequest({ method: 'POST', path: `${this.uri}/versions` });
		} else if (!ignoreIfExists) {
			throw new Error(
				`Next version already exists at ${this.properties.nextVersion.datasetUri}. To avoid this error, set option ignoreIfExists to true`,
			);
		}
		return new Dataset(this.name, {
			user: this.user,
			organization: this.organization,
		}).get();
	}

	async release() {
		await makeRequest({
			method: 'POST',
			path: `${this.uri}/versions/next/release`,
		});
		return new Dataset(this.name, {
			user: this.user,
			organization: this.organization,
			version: 'current',
		}).get();
	}

	async listTables({ maxResults } = {}) {
		const tables = await makePaginatedRequest({
			path: `${this.uri}/tables`,
			pageSize: 100,
			maxResults,
		});
		return tables.map((table) => new Table(table.name, { dataset: this, properties: table }));
	}
}
