// default 'Streets' for testing:
// mapboxStyle: 'mapbox://styles/mapbox/streets-v11',

const baseMaps = [
	{
		name: 'Topo',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckbva72vc19hi1ipk8im36in5',
		isDefault: true, // must have one `default: true` map
	},
	{
		name: 'Satellite',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckbva7yuu19hj1iob2pocca04',
	},
	{
		name: 'Streets',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckbvor8tn0coz1htdjabo8h49',
	},
	{
		name: 'Dark',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckbvas4jd0zlm1jo7v7k9p76t',
	},
	{
		name: 'Light',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckbvofjle0cbj1ipjnzb8nhxr',
	},
	{
		name: 'None',
		mapboxStyle: 'mapbox://styles/columbia-dataplatform/ckccdqxri00ny1jtf2dhbs3hd',
	},
];

export default baseMaps;
