import Dataset from './Dataset.js';
// TODO: listDatasets
// TODO: listMembers

export default class Organization {
	constructor(name) {
		this.name = name;
	}

	dataset(name, options = {}) {
		return new Dataset({ name, ...options, organization: this });
	}
}
