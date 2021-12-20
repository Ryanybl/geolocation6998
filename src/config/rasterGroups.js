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
			['columbia-dataplatform.altp17rc']: 'Cropland cover fraction (2015)',  // updated using the previous id.
			['columbia-dataplatform.5y1gv038']: 'Road Density (2020)', // updated using the previous id.
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
			['columbia-dataplatform.altp17rc']: {
				type: 'continuous',
				min: { name: 'Less cropland', color: '#000000' },
				max: { name: 'More cropland', color: '#ffffff' },
			},
			['columbia-dataplatform.5y1gv038']: {
				type: 'continuous',
				min: { name: 'Lower road density', color: '#000000' },
				max: { name: 'Higher road density', color: '#ffffff' },
			},
		},
	})
];

export default rasterGroups;
