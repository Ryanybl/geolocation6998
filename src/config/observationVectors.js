import VectorSource from '../VectorSource';

/*
 * name: display name, required. Must be unique.
 * tableIdentifier: The fully qualified Redivis table identifier. Make sure to point to the current version
 * geoVariables:
 * filterVariables
 * metadataVariables
 * */

import adminVectors from './adminVectors';
import vectors from './vectors';

const vectorPriorityByNameMap = {
	// higher numbers will be rendered on top of lower numbers
	'Uganda Geosurvey Results': 0,
};

const observationVectors = [
	new VectorSource({
		name: 'Uganda Geosurvey Results',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_geosurvey_results:2',
		geoVariables: [{ name: 'lat' }, { name: 'lon' }],
		getGeometry: (lat, lng) => {
			return {
				type: 'Point',
				coordinates: [parseFloat(lng), parseFloat(lat)],
			};
		},
		metadataVariables: [
			{ name: 'bp', label: 'Building presence' },
			{ name: 'cp', label: 'Crop presence' },
			{ name: 'wp', label: 'Woodland presence' },
			{ name: 'cs', label: 'Conservation structure' },
		],
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'circle',
		mapboxLayerOptions: {
			layout: {
				'circle-sort-key':
					adminVectors.length + vectors.length + vectorPriorityByNameMap['Uganda Geosurvey Results'],
			},
			paint: {
				'circle-color': 'rgb(0,0,0)',
				'circle-stroke-color': 'white',
				'circle-stroke-width': 1,
				'circle-opacity': 0.6,
				'circle-radius': 5,
			},
		},
	}),
];

export default observationVectors;
