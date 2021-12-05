export default class RasterSource {
	constructor({
		mapboxId,
		isDefault,
		minZoom = 0,
		maxZoom = 22,
		minNativeZoom,
		maxNativeZoom,
		boundingBox,
		name,
		label,
		customLegend,
	}) {
		this.name = name;
		this.label = label;
		this.mapboxId = mapboxId;
		this.minZoom = parseInt(minZoom);
		this.maxZoom = parseInt(maxZoom);
		this.minNativeZoom = parseInt(minNativeZoom);
		this.maxNativeZoom = parseInt(maxNativeZoom);
		this.isDefault = isDefault;
		this.customLegend = customLegend;

		if (boundingBox) {
			boundingBox = boundingBox.split(',');
			this.bounds = [
				parseFloat(boundingBox[0]),
				parseFloat(boundingBox[1]),
				parseFloat(boundingBox[2]),
				parseFloat(boundingBox[3]),
			];
		}
	}
}
