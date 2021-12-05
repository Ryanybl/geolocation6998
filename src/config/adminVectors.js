import VectorSource from '../VectorSource';

import { DEFAULT_ADMIN_VECTOR_OPACITY } from './constants';

const simplificationLevels = [10];

const vectorPriorityByNameMap = {
	// higher numbers will be rendered on top of lower numbers
	'Uganda Regions': 0,
	'Uganda Districts': 1,
	'Uganda Subcounties': 2,
	'Uganda Parishes': 3,
};

// TODO: monitor https://github.com/mapbox/mapbox-gl-js/issues/4087 for fill layers with outlines

const adminVectorSpecs = [
	{
		name: 'Regions (full size)',
		label: 'Uganda',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_regions:9',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [],
		metadataVariables: [{ name: 'AREA' }, { name: 'PERIMETER' }, { name: 'ID' }, { name: 'CAPTION' }],
		regionNameVariable: { name: 'ID' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#787b8c',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					'line-color': '#787b8c',
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
	{
		name: 'Districts (full size)',
		label: 'Uganda',
		hierarchyIndex: 1,
		isDefault: false,
		showOnHome: true,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_districts:3',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [],
		metadataVariables: [
			{ name: 'AREA_SQKM', label: 'Area (km^2)' },
			{ name: 'POPPERSQKM', label: 'Population per km^2' },
			{ name: 'CAPTION', label: 'Region' },
		],
		regionNameVariable: { name: 'DNAME2019' },
		regionParentVariable: { name: 'CAPTION' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#9699a6',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Districts'],
				},
				paint: {
					'line-color': '#9699a6',
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Subcounties (full size)',
		label: 'Uganda',
		hierarchyIndex: 2,
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_subcounties:8',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		metadataVariables: [{ name: 'District' }, { name: 'County' }, { name: 'Subcounty' }, { name: 'regions' }],
		regionNameVariable: { name: 'Subcounty' },
		regionParentVariable: { name: 'District' },
		regionBoundingBoxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Subcounties'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#9699a6',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Subcounties'],
				},
				paint: {
					'line-color': '#9699a6',
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Parishes (full size)',
		label: 'Uganda',
		hierarchyIndex: 3,
		isDefault: false,
		tableIdentifier: 'modilab.uganda_geodata:3.uganda_parishes:7',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [],
		metadataVariables: [{ name: 'DName2016' }, { name: 'CName2016' }, { name: 'SName2016' }],
		regionNameVariable: { name: 'P' },
		regionParentVariable: { name: 'S' },
		regionBoundingBoxVariable: null,
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Parishes'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#9699a6',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Parishes'],
				},
				paint: {
					'line-color': '#9699a6',
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 12, 1.5],
					'line-dasharray': ['step', ['zoom'], ['literal', [2, 0]], 7, ['literal', [2, 2, 6, 2]]],
				},
			},
		},
	},
	{
		name: 'Regions (full size)',
		label: 'Ethiopia',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.ethiopia_geodata:2.ethiopia_regions:3',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [],
		metadataVariables: [{ name: 'ADM0_EN', label: 'Country' }],
		regionNameVariable: { name: 'ADM1_EN' },
		regionParentVariable: { name: 'ADM0_EN' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#787b8c',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					'line-color': '#787b8c',
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
	{
		name: 'Regions (full size)',
		label: 'Tanzania',
		hierarchyIndex: 0,
		isDefault: true,
		showOnHome: true,
		tableIdentifier: 'modilab.tanzania_geodata:4.tanzania_regions:2',
		geoVariables: [{ name: 'geoBuf' }],
		isGeobuf: true,
		filterVariables: [],
		metadataVariables: [{ name: 'ADM0_EN', label: 'Country' }],
		regionNameVariable: { name: 'ADM1_EN' },
		regionBoundingBoxVariable: { name: 'BBOX' },
		mapboxSourceType: 'geojson',
		mapboxLayerType: ['fill', 'line'],
		mapboxLayerOptions: {
			fill: {
				layout: {
					'fill-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					// conditional styling with 'get' expression: see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#types-number
					'fill-opacity': ['number', ['get', 'opacity'], DEFAULT_ADMIN_VECTOR_OPACITY],
					'fill-color': '#787b8c',
				},
			},
			line: {
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
					'line-sort-key': vectorPriorityByNameMap['Uganda Regions'],
				},
				paint: {
					'line-color': '#787b8c',
					'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 2],
					'line-dasharray': [10, 0],
				},
			},
		},
	},
];

for (let i = 0; i < adminVectorSpecs.length; i++) {
	for (let n = 0; n < simplificationLevels.length; n++) {
		const level = simplificationLevels[n];
		adminVectorSpecs.splice(i + n + 1, 0, {
			...adminVectorSpecs[i],
			isDefault: false,
			showOnHome: false,
			name: `${adminVectorSpecs[i].name}`.replace('full size', `${level}%`),
			geoVariables: [{ name: `geoBuf_simplified_${level}` }],
		});
	}
	i += simplificationLevels.length;
}

export default adminVectorSpecs.map((obj) => new VectorSource(obj));
