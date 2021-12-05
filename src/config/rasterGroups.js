import RasterSourceGroup from '../RasterSourceGroup';

const rasterGroups = [
	new RasterSourceGroup({
		label: 'Uganda',
		tableIdentifier: `modilab.uganda_geodata:3.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customNamesByMapboxId: {
			['columbia-dataplatform.dpfypvjn']: 'Prediction of Woodland Presence (probability)',
			['columbia-dataplatform.altp17rc']: 'Prediction of Building Presence (probability)',
			['columbia-dataplatform.5y1gv038']: 'Prediction of Crop Presence (probability)',
		},
		customLegendsByMapboxId: {
			['columbia-dataplatform.0xf4g95w']: {
				type: 'categorical',
				categories: [
					{ name: 'No buildings, no cropland, no woody cover', color: '#b9b6b9' },
					{ name: 'Woody cover (> 60%)', color: '#0e7d0e' },
					{ name: 'Cropland', color: '#fec28c' },
					{ name: 'Cropland and woody cover (> 60%)', color: '#fcfe9c' },
					{ name: 'Buildings', color: '#fe0c0c' },
					{ name: 'Buildings and woody cover (> 60%)', color: '#ea3690' },
					{ name: 'Buildings and cropland', color: '#ca7d47' },
					{ name: 'Buildings, cropland, and woody cover', color: '#6d6d6d' },
				],
			},
			['columbia-dataplatform.6abx7bi6']: {
				type: 'categorical',
				categories: [
					{ name: 'Predicted Not Cropland', color: '#0B60B0' },
					{ name: 'Predicted No Irrigation', color: '#26AC72' },
					{ name: 'Predicted Irrigation', color: '#ECEC0B' },

				],
			},
			['columbia-dataplatform.dpfypvjn']: {
				type: 'continuous',
				min: { name: 'Less wooded', color: '#000000' },
				max: { name: 'More wooded', color: '#ffffff' },
			},
			['columbia-dataplatform.altp17rc']: {
				type: 'continuous',
				min: { name: 'Fewer buildings', color: '#000000' },
				max: { name: 'More buildings', color: '#ffffff' },
			},
			['columbia-dataplatform.5y1gv038']: {
				type: 'continuous',
				min: { name: 'Less crop presence', color: '#000000' },
				max: { name: 'More crop presence', color: '#ffffff' },
			},
		},
	}),
	new RasterSourceGroup({
		label: 'Ethiopia',
		tableIdentifier: `modilab.ethiopia_geodata:2.raster_layer_metadata:1`,
		mapboxIdVariable: { name: 'mapbox_id' },
		minNativeZoomVariable: { name: 'zoom_min' },
		maxNativeZoomVariable: { name: 'zoom_max' },
		boundingBoxVariable: { name: 'bounding_box' },
		nameVariable: { name: 'catalog_name' },
		customLegendsByMapboxId: {
			['columbia-dataplatform.7w9iml7k']: {
				type: 'categorical',
				categories: [
					{ name: 'In-phase vegetation', color: '#ff0000' },
					{ name: 'Out-of-phase vegetation', color: '#00ff00' },
					{ name: 'Dark', color: '#0000ff' },
				],
			},
		},
	}),
];

export default rasterGroups;
