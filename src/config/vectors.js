import VectorSource from '../VectorSource';

const simplificationLevels = [10];

import adminVectors from './adminVectors';

const vectorPriorityByNameMap = {
	// higher numbers will be rendered on top of lower numbers
	'Uganda Electricity Transmission Lines': 0,
	'UMEME REA power distribution lines 2018': 1,
};

const vectors = [
	{
		name: 'Uganda Electricity Transmission Lines (full size)',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_electricity_transmission_lines:6',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [{ name: 'VOLTAGE_KV' }, { name: 'STATUS' }, { name: 'INSTALLATI' }, { name: 'STRUCTURE_' }],
		metadataVariables: [
			{ name: 'OBJECTID' },
			{ name: 'LINE_ID' },
			{ name: 'LINE_NAME' },
			{ name: 'VOLTAGE_KV' },
			{ name: 'STATUS' },
			{ name: 'STATUS_DET' },
			{ name: 'YEAR_COMMI' },
			{ name: 'YEAR_UPGRA' },
			{ name: 'YEAR_DECOM' },
			{ name: 'INSTALLATI' },
			{ name: 'STRUCTURE_' },
			{ name: 'FINANCIER' },
			{ name: 'CONTRACTOR' },
		],
		legendVariable: { name: 'VOLTAGE_KV', mapboxPaintProperty: 'line-color' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key': adminVectors.length + vectorPriorityByNameMap['Uganda Electricity Transmission Lines'],
			},
			paint: {
				// 'line-color': 'rgb(32,89,255)',
				// conditional styling with 'match' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match
				'line-color': [
					'match',
					['get', 'VOLTAGE_KV'],
					'400',
					'#045a8d',
					'220',
					'#2b8cbe',
					'132',
					'#74a9cf',
					'66',
					'#bdc9e1',
					'#f1eef6' /* other */,
				],
				'line-width': 4,
				// TODO: 'line-dasharray' doesn't yet support data expressions (check for 'data-driven styling' row in each layer property at https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)
				// 'line-dasharray':[
				// 	'match',
				// 	['get', 'STATUS'],
				// 	'Operational',
				// 	['literal', [10, 0]],
				// 	'At Planning Stage',
				// 	['literal', [2, 2, 6, 2]],
				// 	'Under Construction',
				// 	['literal', [2, 2, 6, 2]],
				// 	['literal', [2, 2, 6, 2]], /* other */
				// ],
			},
		},
	},
	{
		name: 'UMEME REA power distribution lines 2018 (full size)',
		label: 'Uganda',
		isDefault: false,
		tableIdentifier: `modilab.uganda_geodata:3.umeme_rea_power_distribution_lines_2018:5`,
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		metadataVariables: [{ name: 'Voltage' }, { name: 'Status' }, { name: 'Phase' }],
		legendVariable: { name: 'Voltage', mapboxPaintProperty: 'line-color' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: 'line',
		mapboxLayerOptions: {
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
				'line-sort-key':
					adminVectors.length + vectorPriorityByNameMap['UMEME REA power distribution lines 2018'],
			},
			paint: {
				// 'line-color': 'rgb(255,129,255)',
				// conditional styling with 'match' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match
				'line-color': [
					'match',
					['get', 'Voltage'],
					'33 kV',
					'#dd1c77',
					'11 kV',
					'#c994c7',
					'#e7e1ef' /* other */,
				],
				'line-width': 2,
				// TODO: 'line-dasharray' doesn't yet support data expressions (check for 'data-driven styling' row in each layer property at https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)
				// 'line-dasharray':[
				// 	'match',
				// 	['get', 'Status'],
				// 	'Existing',
				// 	['literal', [10, 0]],
				// 	'Proposed',
				// 	['literal', [2, 2, 6, 2]],
				// 	'Under construction',
				// 	['literal', [2, 2, 6, 2]],
				// 	['literal', [2, 2, 6, 2]], /* other */
				// ],
			},
		},
	},
];

for (let i = 0; i < vectors.length; i++) {
	for (let n = 0; n < simplificationLevels.length; n++) {
		const level = simplificationLevels[n];
		vectors.splice(i + n + 1, 0, {
			...vectors[i],
			isDefault: false,
			name: `${vectors[i].name}`.replace('full size', `${level}%`),
			geoVariables: [{ name: `geoBuf_simplified_${level}` }],
		});
	}
	i += simplificationLevels.length;
}

export default vectors.map((obj) => new VectorSource(obj));
