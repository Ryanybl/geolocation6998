import RasterSource from './RasterSource';
import * as redivis from 'redivis'

const ACCESS_TOKEN = process.env.REDIVIS_API_TOKEN;

export default class RasterSourceGroup {
	constructor({
		label,
		tableIdentifier,
		mapboxIdVariable,
		minNativeZoomVariable,
		maxNativeZoomVariable,
		boundingBoxVariable,
		nameVariable,
		customLegendsByMapboxId,
		customNamesByMapboxId,
	}) {
		this.label = label;
		this.tableIdentifier = tableIdentifier;
		this.mapboxIdVariable = mapboxIdVariable;
		this.minNativeZoomVariable = minNativeZoomVariable;
		this.maxNativeZoomVariable = maxNativeZoomVariable;
		this.boundingBoxVariable = boundingBoxVariable;
		this.nameVariable = nameVariable;
		this.customNamesByMapboxId = customNamesByMapboxId;
		this.customLegendsByMapboxId = customLegendsByMapboxId;
	}

	fetchData = async () => {
		if (this.data) {
			return this.data;
		}
		const variablesToFetch = [
			...new Set([
				this.mapboxIdVariable.name.toLowerCase(),
				this.minNativeZoomVariable.name.toLowerCase(),
				this.maxNativeZoomVariable.name.toLowerCase(),
				this.boundingBoxVariable.name.toLowerCase(),
				this.nameVariable.name.toLowerCase(),
			]),
		];

		const [userName, datasetName, tableName] = this.tableIdentifier.split('.')

		await redivis.authorize({ apiToken: ACCESS_TOKEN })

		const rows = await redivis.user(userName).dataset(datasetName).table(tableName).listRows({ variables:variablesToFetch})
		this.data = rows.map((row) => {
			return new RasterSource({
				mapboxId: row[variablesToFetch[0]],
				minNativeZoom: row[variablesToFetch[1]],
				maxNativeZoom: row[variablesToFetch[2]],
				boundingBox: row[variablesToFetch[3]],
				name:
					this.customNamesByMapboxId && this.customNamesByMapboxId[row[variablesToFetch[0]]]
						? this.customNamesByMapboxId[row[variablesToFetch[0]]]
						: row[variablesToFetch[4]],
				label: this.label,
				customLegend: this.customLegendsByMapboxId && row[variablesToFetch[0]] ? this.customLegendsByMapboxId[row[variablesToFetch[0]]] : null,
			});
		})

		return this.data
	};
}
