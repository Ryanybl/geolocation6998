import Query from './Query.js';
import Table from './Table.js';
import { makePaginatedRequest } from '../common/apiRequest.js';

export default class Project {
	constructor(argName, options = {}) {
		if (typeof argName === 'object') {
			options = argName;
			argName = undefined;
		}
		const { name = argName, user, properties } = options;
		this.user = user;
		this.name = name;
		this.identifier = `${user.name}.${name}`;
		this.uri = `/projects/${encodeURIComponent(this.identifier)}`;
		this.properties = properties;
	}

	getProperty() {
		return this.properties?.[property];
	}

	query(query, options = {}) {
		return new Query({ query, ...options, defaultProject: this });
	}

	table(name, options = {}) {
		return new Table({ name, ...options, project: this });
	}

	async listTables({ maxResults, includeDatasetTables } = {}) {
		const tables = await makePaginatedRequest({
			method: 'GET',
			pageSize: 100,
			path: `${this.uri}/tables`,
			maxResults,
			query: { includeDatasetTables },
		});

		return tables.map((table) => new Table(table.name, { project: this, properties: table }));
	}
}
