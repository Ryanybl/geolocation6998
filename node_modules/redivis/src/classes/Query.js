import { makeRequest, makeRowsRequest } from '../common/apiRequest.js';
import Variable from './Variable.js';
import Papa from 'papaparse';

export default class Query {
	constructor(argsQuery, options = {}) {
		this.isFetching = true;
		if (typeof argsQuery === 'object') {
			options = argsQuery;
			argsQuery = undefined;
		}
		const { query = argsQuery, defaultProject, defaultDataset } = options;
		const payload = {
			query,
		};
		if (defaultProject) {
			payload.defaultProject = defaultProject.identifier;
		} else if (defaultDataset) {
			payload.defaultDataset = defaultDataset.identifier;
		}

		// TODO: only make the request when this.get is called
		makeRequest({ method: 'POST', path: '/queries', payload })
			.then((res) => {
				this.isFetching = false;
				this.properties = res;
				this.uri = `/queries/${this.properties.id}`;
			})
			.catch((e) => {
				this.error = e;
				this.isFetching = false;
			});
	}

	getProperty(prop) {
		return this.properties?.[prop];
	}

	toString() {
		return JSON.stringify(this.properties, null, 2);
	}

	async get() {
		this.properties = await makeRequest({ method: 'GET', path: this.uri });
		return this;
	}

	async listVariables() {
		await this.#waitForFinish();
		return this.properties.outputSchema.map((variable) => new Variable({ ...variable, query: this }));
	}

	async listRows(maxResults) {
		await this.#waitForFinish();
		maxResults =
			maxResults === undefined
				? this.properties.outputNumRows
				: Math.max(maxResults, this.properties.outputNumRows);
		const res = await makeRowsRequest({ uri: this.uri, maxResults, query: { format: 'csv' } });
		const { data: rows } = Papa.parse(res);
		const variables = await this.listVariables();
		return rows.map((row) => {
			const rowObject = {};
			for (let i = 0; i < row.length; i++) {
				if (row[i] === null) {
					rowObject[variables[i].name] = row[i];
				} else {
					switch (variables[i].type) {
						case 'integer':
							rowObject[variables[i].name] = parseInt(row[i]);
							break;
						case 'float':
							rowObject[variables[i].name] = parseFloat(row[i]);
							break;
						case 'date':
							rowObject[variables[i].name] = new Date(`${row[i]}T00:00:00Z`);
							break;
						case 'dateTime':
							rowObject[variables[i].name] = new Date(`${row[i]}Z`);
							break;
						default:
							rowObject[variables[i].name] = row[i];
					}
				}
			}
			return rowObject;
		});
	}

	async #waitForFinish() {
		while (true) {
			if (this.isFetching) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				continue;
			} else if (this.error) {
				throw new Error(this.error);
			} else if (this.properties.status === 'completed') {
				break;
			} else if (this.properties.status === 'failed') {
				throw new Error(`Query job failed with message: ${this.properties.errorMessage}`);
			} else if (this.properties.status === 'cancelled') {
				throw new Error(`Query job was cancelled`);
			} else {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				await this.get();
			}
		}
	}
}
