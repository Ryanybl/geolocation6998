import * as geobuf from 'geobuf';
import * as Pbf from 'pbf';
import * as redivis from 'redivis';

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;
export default class VectorSource {
	constructor({
		name,
		label,
		hierarchyIndex,
		tableIdentifier,
		geoVariables,
		isGeobuf,
		getGeometry,
		isDefault,
		showOnHome,
		filterVariables = [],
		metadataVariables = [],
		legendVariable,
		legend,
		regionNameVariable,
		regionParentVariable,
		regionBoundingBoxVariable,
		mapboxSourceType,
		mapboxLayerType,
		mapboxLayerOptions,
		minZoom,
		maxZoom,
	}) {
		this.name = name;
		this.label = label;
		this.hierarchyIndex = hierarchyIndex;
		this.tableIdentifier = tableIdentifier;
		this.geoVariables = geoVariables;
		this.isGeobuf = isGeobuf;
		this.filterVariables = filterVariables;
		this.metadataVariables = metadataVariables;
		this.legendVariable = legendVariable;
		this.legend = legend;
		this.regionNameVariable = regionNameVariable;
		this.regionParentVariable = regionParentVariable;
		this.regionBoundingBoxVariable = regionBoundingBoxVariable;
		this.mapboxSourceType = mapboxSourceType;
		this.mapboxLayerType = mapboxLayerType;
		this.mapboxLayerOptions = mapboxLayerOptions;
		this.minZoom = minZoom;
		this.maxZoom = maxZoom;
		this.isDefault = isDefault;
		this.showOnHome = showOnHome;
		this.getGeometry = getGeometry;

		this.metadata = null;
		this.data = null;
	}

	fetchMetadata = async () => {
		if (this.metadata) {
			return this.metadata;
		}
		const variablesSet = new Set([
			...this.filterVariables.map(({ name }) => name.toLowerCase()),
			...this.metadataVariables.map(({ name }) => name.toLowerCase()),
		]);

		if (this.regionNameVariable) {
			variablesSet.add(this.regionNameVariable.name.toLowerCase());
		}
		if (this.regionParentVariable) {
			variablesSet.add(this.regionParentVariable.name.toLowerCase());
		}
		if (this.regionBoundingBoxVariable) {
			variablesSet.add(this.regionBoundingBoxVariable.name.toLowerCase());
		}
		const variablesToFetch = [...variablesSet];


		const [userName, datasetName, tableName] = this.tableIdentifier.split('.')

		await redivis.authorize({ apiToken: ACCESS_TOKEN })

		const metadata = await redivis.user(userName).dataset(datasetName).table(tableName).listRows({ variables:variablesToFetch})

		try {
			this.metadata = metadata.map((row) => {
				const metadata = {};
				const properties = {};
				for (const variable of this.metadataVariables) {
					metadata[variable.label || variable.name] =
						String(row[variable.name.toLowerCase()]);
				}
				for (const variable of this.filterVariables) {
					// Need to cast as string for mapbox highlighting to work
					properties[variable.name] = String(row[variable.name.toLowerCase()]);
				}
				if (this.regionNameVariable) {
					properties.regionName =
						row[this.regionNameVariable.name.toLowerCase()];
				}
				if (this.regionParentVariable) {
					properties.parentRegionName =
						row[this.regionParentVariable.name.toLowerCase()];
				}
				if (this.regionBoundingBoxVariable) {
					properties.bbox =
						row[this.regionBoundingBoxVariable.name.toLowerCase()];
				}
				return { metadata, properties: { ...metadata, ...properties } };
			});
			return this.metadata;
		} catch (e) {
			alert(`An error occurred when parsing data from ${this.tableIdentifier}: ${e.message}`);
			return [];
		}
	};

	fetchData = async () => {
		if (this.data) {
			return this.data;
		}
		const variablesSet = new Set([...this.geoVariables.map(({ name }) => name.toLowerCase())]);
		if (!this.metadata) {
			await this.fetchMetadata();
		}
		const variablesToFetch = [...variablesSet];

		const [userName, datasetName, tableName] = this.tableIdentifier.split('.')

		await redivis.authorize({ apiToken: ACCESS_TOKEN })


		const data = await redivis.user(userName).dataset(datasetName).table(tableName).listRows({ variables:variablesToFetch})

		try {
			this.data = data.map((row, i) => {
				let geometry;
				if (row[this.geoVariables[0].name.toLowerCase()]) {
					if (this.isGeobuf) {
						geometry = geobuf.decode(
							new Pbf(
								new Uint8Array(
									atob(row[this.geoVariables[0].name.toLowerCase()])
										.split('')
										.map(function (c) {
											return c.charCodeAt(0);
										}),
								),
							),
						).geometry;
					} else {
						geometry = this.getGeometry
							? this.getGeometry(
									...this.geoVariables.map(
										(geoVariable) =>
											row[geoVariable.name.toLowerCase()],
									),
							  )
							: JSON.parse(row[this.geoVariables[0].name.toLowerCase()]);
					}
				}
				return { geometry, ...this.metadata[i] };
			});

			return this.data;
		} catch (e) {
			alert(`An error occurred when parsing data from ${this.tableIdentifier}: ${e.message}`);
			return [];
		}
	};


}

