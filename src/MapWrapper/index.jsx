import styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';

import Filters from '../Filters';
import Map from '../Map';
import baseMaps from '../config/baseMaps';
import rasterGroups from '../config/rasterGroups';
import vectors from '../config/vectors';
import observationVectors from '../config/observationVectors';
import adminVectors from '../config/adminVectors';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

import { withStyles } from '@material-ui/core/styles';

import groupOptions from '../groupOptions';
import getAdminRegionId from '../getAdminRegionId';

import { DEFAULT_RASTER_OPACITY, SELECTED_ADMIN_VECTOR_OPACITY } from '../config/constants';

const METADATA_NULL_VALUE = null;

const ZOOM_REGEX = /&zoom=([\d+\.]+)/;
const LAT_REGEX = /&lat=(-?[\d+\.]+)/;
const LNG_REGEX = /&lng=(-?[\d+\.]+)/;
const BBOX_REGEX = /&bbox=(-?[\d+\.]+),(-?[\d+\.]+),(-?[\d+\.]+),(-?[\d+\.]+)/;
const REGION_NAME_REGEX = /&region=([^&]+)/;
const ADMIN_LAYER_REGEX = /&adminLayer_([^(&=)]+)=([^&]+)/g;

const CustomCard = withStyles({
	root: {
		minWidth: 200,
	},
})(Card);

const CustomTitle = withStyles({
	root: {
		fontSize: 14,
		marginBottom: 12,
	},
})(Typography);

const CustomHeader = withStyles({
	root: {
		fontSize: 12,
	},
})(Typography);

function getFiltersMap(features, whitelist) {
	const filters = {};
	for (const feature of features) {
		for (const property in feature.metadata) {
			if (whitelist.has(property)) {
				if (!filters[property]) {
					filters[property] = { valuesSet: new Set([]), selectedValuesSet: new Set([]) };
				}
				filters[property].valuesSet.add(
					feature.metadata[property] === null ? METADATA_NULL_VALUE : feature.metadata[property],
				);
				filters[property].selectedValuesSet.add(
					feature.metadata[property] === null ? METADATA_NULL_VALUE : feature.metadata[property],
				);
			}
		}
	}
	return filters;
}

function getSelectedAdminVectorLayerNamesByLabel(search) {
	const adminVectorGroups = groupOptions(adminVectors);
	const selectedAdminVectorLayerNamesByLabel = {};
	let adminLayerMatch;
	while ((adminLayerMatch = ADMIN_LAYER_REGEX.exec(search)) !== null) {
		selectedAdminVectorLayerNamesByLabel[decodeURIComponent(adminLayerMatch[1])] = decodeURIComponent(
			adminLayerMatch[2],
		);
	}
	ADMIN_LAYER_REGEX.lastIndex = 0;

	for (const adminVectorGroup of adminVectorGroups) {
		if (!selectedAdminVectorLayerNamesByLabel[adminVectorGroup.label]) {
			selectedAdminVectorLayerNamesByLabel[adminVectorGroup.label] = adminVectorGroup.options.find(
				({ isDefault }) => isDefault,
			).name;
		}
	}
	return selectedAdminVectorLayerNamesByLabel;
}

function getSelectedRegionName(props) {
	const {
		location: { search },
	} = props;

	const region = search.match(REGION_NAME_REGEX);

	return region ? decodeURIComponent(region[1]) : null;
}

class MapWrapper extends Component {
	constructor(props) {
		super(props);
		const currentVectorLayers = vectors.filter(({ isDefault }) => isDefault);
		const currentObservationVectorLayers = observationVectors.filter(({ isDefault }) => isDefault);
		const currentAdminVectorLayers = adminVectors.filter(({ isDefault }) => isDefault);
		const vectorFeaturesByNamesMap = {};
		const vectorFiltersByNamesMap = {};
		const observationVectorFeaturesByNamesMap = {};
		const adminVectorFeaturesByIdMap = {};
		for (const vector of currentVectorLayers) {
			vectorFeaturesByNamesMap[vector.name] = [];
			vectorFiltersByNamesMap[vector.name] = {};
		}
		for (const vector of currentObservationVectorLayers) {
			observationVectorFeaturesByNamesMap[vector.name] = [];
		}
		for (const vector of currentAdminVectorLayers) {
			adminVectorFeaturesByIdMap[getAdminRegionId(vector)] = [];
		}
		this.state = {
			currentBaseMapLayerName: baseMaps.find(({ isDefault }) => isDefault).name,
			currentRasterLayerNamesSet: new Set([]),
			currentVectorLayerNamesSet: new Set(currentVectorLayers.map(({ name }) => name)),
			currentObservationVectorLayerNamesSet: new Set(currentObservationVectorLayers.map(({ name }) => name)),
			rasters: [],
			rasterOpacityByNameMap: {},
			vectorFeaturesByNamesMap,
			vectorFiltersByNamesMap,
			adminVectorFeaturesByIdMap,
			observationVectorFeaturesByNamesMap,
			isLoadingRasters: false,
			isLoadingVectors: false,
			isLoadingObservationVectors: false,
			isLoadingAdminVectors: false,
			previousSearch: null,
			previousRegionName: null,
		};
	}

	componentDidMount() {
		const {
			location: { search },
			history,
		} = this.props;

		this.loadRasters();
		this.loadVectors();
		this.loadObservationVectors();
		this.loadAdminVectors();

		const bbox = search.match(BBOX_REGEX);
		if (bbox) {
			const nextSearch = `${search.slice(0, bbox.index)}${search.slice(bbox.index + bbox[0].length)}`;
			history.replace({ search: nextSearch });
		}
	}

	static getDerivedStateFromProps(props, state) {
		const {
			location: { search },
		} = props;
		const { adminVectorFeaturesByIdMap, previousRegionName, previousSearch } = state;
		const selectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(search);
		const previousSelectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(previousSearch);

		let regionName = getSelectedRegionName(props);

		if (regionName !== previousRegionName) {
			const nextState = {
				adminVectorFeaturesByIdMap: {
					...adminVectorFeaturesByIdMap,
				},
				previousRegionName: regionName,
				previousSearch: search,
			};
			for (const label of Object.keys(previousSelectedAdminVectorLayerNamesByLabel)) {
				for (const feature of nextState.adminVectorFeaturesByIdMap[
					getAdminRegionId({ name: previousSelectedAdminVectorLayerNamesByLabel[label], label })
				] || []) {
					feature.properties.opacity = undefined;
				}
			}
			for (const label of Object.keys(selectedAdminVectorLayerNamesByLabel)) {
				for (const feature of nextState.adminVectorFeaturesByIdMap[
					getAdminRegionId({ name: selectedAdminVectorLayerNamesByLabel[label], label })
				] || []) {
					// if (previousRegionName && feature.properties.regionName === previousRegionName) {
					feature.properties.opacity = undefined;
					// }
					if (regionName && feature.properties.regionName === regionName) {
						feature.properties.opacity = SELECTED_ADMIN_VECTOR_OPACITY;
					}
				}
			}

			return nextState;
		}

		return null;
	}

	componentDidUpdate(prevProps) {
		const {
			location: { search },
		} = this.props;
		const selectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(search);
		const previousSelectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(
			prevProps.location.search,
		);

		const adminVectorGroups = groupOptions(adminVectors);

		if (
			adminVectorGroups.some(
				({ label }) =>
					selectedAdminVectorLayerNamesByLabel[label] !== previousSelectedAdminVectorLayerNamesByLabel[label],
			)
		) {
			this.loadAdminVectors();
		}
	}

	loadRasters = async () => {
		this.setState({ isLoadingRasters: true });
		const rasterSourceGroups = await Promise.all(
			rasterGroups.map(async (rasterGroup) => {
				return await rasterGroup.fetchData();
			}),
		);
		const rasters = rasterSourceGroups.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
		const rasterOpacityByNameMap = {};
		for (const raster of rasters) {
			rasterOpacityByNameMap[raster.name] = DEFAULT_RASTER_OPACITY;
		}
		this.setState({
			rasters,
			rasterOpacityByNameMap,
			isLoadingRasters: false,
		});
	};

	loadVectors = async () => {
		this.setState({ isLoadingVectors: true });
		const { currentVectorLayerNamesSet } = this.state;
		const vectorsToFetch = vectors.filter(({ name }) => currentVectorLayerNamesSet.has(name));
		const nextVectorFeaturesByNamesMap = {};
		const nextVectorFiltersByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextVectorFeaturesByNamesMap[vector.name] = features;
				const variableNamesToFilter = new Set([...(vector.filterVariables || []).map(({ name }) => name)]);
				if (vector.legendVariable) {
					variableNamesToFilter.add(vector.legendVariable.name);
				}
				if (variableNamesToFilter.size) {
					const filtersMap = getFiltersMap(features, variableNamesToFilter);
					nextVectorFiltersByNamesMap[vector.name] = filtersMap;
				}
			}),
		);
		this.setState({
			vectorFeaturesByNamesMap: nextVectorFeaturesByNamesMap,
			vectorFiltersByNamesMap: nextVectorFiltersByNamesMap,
			isLoadingVectors: false,
		});
	};

	loadObservationVectors = async () => {
		this.setState({ isLoadingObservationVectors: true });
		const { currentObservationVectorLayerNamesSet } = this.state;
		const vectorsToFetch = observationVectors.filter(({ name }) => currentObservationVectorLayerNamesSet.has(name));
		const nextObservationVectorFeaturesByNamesMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				nextObservationVectorFeaturesByNamesMap[vector.name] = features;
			}),
		);
		this.setState({
			observationVectorFeaturesByNamesMap: nextObservationVectorFeaturesByNamesMap,
			isLoadingObservationVectors: false,
		});
	};

	loadAdminVectors = async () => {
		const {
			location: { search },
		} = this.props;
		this.setState({ isLoadingAdminVectors: true });
		const selectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(search);
		const regionName = getSelectedRegionName(this.props);
		const vectorsToFetch = adminVectors.filter(
			({ name, label }) => selectedAdminVectorLayerNamesByLabel[label] === name,
		);
		const nextAdminVectorFeaturesByIdMap = {};
		await Promise.all(
			vectorsToFetch.map(async (vector) => {
				const features = await vector.fetchData();
				if (regionName) {
					for (const feature of features) {
						if (feature.properties.regionName === regionName) {
							feature.properties.opacity = SELECTED_ADMIN_VECTOR_OPACITY;
						}
					}
				}
				nextAdminVectorFeaturesByIdMap[getAdminRegionId(vector)] = features;
			}),
		);
		this.setState({
			adminVectorFeaturesByIdMap: nextAdminVectorFeaturesByIdMap,
			isLoadingAdminVectors: false,
		});
	};

	handleUpdateBaseMapLayer = (currentBaseMapLayerName) => {
		this.setState({ currentBaseMapLayerName });
	};

	handleUpdateRasterLayers = (currentRasterLayerNamesSet) => {
		this.setState({ currentRasterLayerNamesSet });
	};

	handleUpdateRasterLayerOpacityByNameMap = (rasterOpacityByNameMap) => {
		this.setState({ rasterOpacityByNameMap });
	};

	handleUpdateVectorLayers = (currentVectorLayerNamesSet) => {
		this.setState({ currentVectorLayerNamesSet }, this.loadVectors);
	};

	handleUpdateObservationVectorLayers = (currentObservationVectorLayerNamesSet) => {
		this.setState({ currentObservationVectorLayerNamesSet }, this.loadObservationVectors);
	};

	handleUpdateAdminVectorLayers = (nextSelectedAdminVectorLayerNamesByLabel) => {
		const {
			location: { search },
			history,
		} = this.props;

		const region = search.match(REGION_NAME_REGEX);
		let nextSearch = region
			? `${search.slice(0, region.index)}${search.slice(region.index + region[0].length)}`
			: search;

		for (const label of Object.keys(nextSelectedAdminVectorLayerNamesByLabel)) {
			const adminLayerRegex = RegExp(`&adminLayer_${encodeURIComponent(label)}=([^&]+)`);

			const adminLayer = nextSearch.match(adminLayerRegex);
			nextSearch = adminLayer
				? `${nextSearch.slice(0, adminLayer.index)}&adminLayer_${encodeURIComponent(
						label,
				  )}=${encodeURIComponent(nextSelectedAdminVectorLayerNamesByLabel[label])}${nextSearch.slice(
						adminLayer.index + adminLayer[0].length,
				  )}`
				: nextSearch.concat(
						`&adminLayer_${encodeURIComponent(label)}=${encodeURIComponent(
							nextSelectedAdminVectorLayerNamesByLabel[label],
						)}`,
				  );
		}

		history.replace({ search: nextSearch });
	};

	handleUpdateVectorFilters = (vectorFiltersByNamesMap) => {
		this.setState({ vectorFiltersByNamesMap });
	};

	filterFeatures = (name, features) => {
		const { vectorFiltersByNamesMap } = this.state;
		const filtersMap = vectorFiltersByNamesMap[name];
		const filterNames = [];
		for (const filterName in filtersMap) {
			filterNames.push(filterName);
		}
		return features.filter((feature) => {
			return (
				!feature.metadata ||
				filterNames.every(
					(filterName) =>
						feature.metadata[filterName] === undefined ||
						filtersMap[filterName].selectedValuesSet.has(
							feature.metadata[filterName] === null ? METADATA_NULL_VALUE : feature.metadata[filterName],
						),
				)
			);
		});
	};

	handleAdminVectorFeatureClick = (properties) => {
		const {
			location: { search },
			history,
		} = this.props;
		if (properties.regionName) {
			const region = search.match(REGION_NAME_REGEX);
			const nextRegionName = encodeURIComponent(properties.regionName);

			const nextSearch = region
				? `${search.slice(0, region.index)}${
						nextRegionName !== region[1] ? `&region=${nextRegionName}` : ''
				  }${search.slice(region.index + region[0].length)}`
				: search.concat(`&region=${nextRegionName}`);

			history.replace({ search: nextSearch });
		}
	};

	handleZoomOrPan = (zoom, center) => {
		const {
			location: { pathname, search },
			history,
		} = this.props;
		const zoomMatch = search.match(ZOOM_REGEX);
		let nextSearch = zoomMatch
			? `${search.slice(0, zoomMatch.index)}&zoom=${encodeURIComponent(zoom)}${search.slice(
					zoomMatch.index + zoomMatch[0].length,
			  )}`
			: search.concat(`&zoom=${encodeURIComponent(zoom)}`);

		const lng = nextSearch.match(LNG_REGEX);
		nextSearch = lng
			? `${nextSearch.slice(0, lng.index)}&lng=${encodeURIComponent(center.lng)}${nextSearch.slice(
					lng.index + lng[0].length,
			  )}`
			: nextSearch.concat(`&lng=${encodeURIComponent(center.lng)}`);

		const lat = nextSearch.match(LAT_REGEX);
		nextSearch = lat
			? `${nextSearch.slice(0, lat.index)}&lat=${encodeURIComponent(center.lat)}${nextSearch.slice(
					lat.index + lat[0].length,
			  )}`
			: nextSearch.concat(`&lat=${encodeURIComponent(center.lat)}`);

		history.replace({
			pathname,
			search: nextSearch,
		});
	};

	getZoomAndCenter = () => {
		const {
			location: { search },
		} = this.props;
		const zoomMatch = search.match(ZOOM_REGEX);
		const latMatch = search.match(LAT_REGEX);
		const lngMatch = search.match(LNG_REGEX);
		const bbox = search.match(BBOX_REGEX);
		const object = {};
		if (zoomMatch) {
			object.zoom = parseInt(zoomMatch[1], 10);
		}
		if (latMatch && lngMatch) {
			object.center = [parseFloat(lngMatch[1]), parseFloat(latMatch[1])];
		}
		if (bbox) {
			object.boundingBox = [
				[parseFloat(bbox[1]), parseFloat(bbox[2])],
				[parseFloat(bbox[3]), parseFloat(bbox[4])],
			];
		}

		return object;
	};

	renderMetadataSection = (key, value) => {
		return (
			<div key={key} className={styles.regionSection}>
				<CustomHeader color={'textSecondary'} gutterBottom>
					{key}
				</CustomHeader>
				{value === null ? (
					<CustomHeader color={'textSecondary'}>{'Not listed'}</CustomHeader>
				) : (
					<Chip size={'small'} label={value} />
				)}
			</div>
		);
	};

	renderSelectedRegion = (selectedAdminVectorLayerNamesByLabel) => {
		const { adminVectorFeaturesByIdMap } = this.state;
		const regionName = getSelectedRegionName(this.props);
		for (const label of Object.keys(selectedAdminVectorLayerNamesByLabel)) {
			const adminRegionId = getAdminRegionId({ name: selectedAdminVectorLayerNamesByLabel[label], label });
			if (regionName && adminVectorFeaturesByIdMap[adminRegionId]) {
				const region = adminVectorFeaturesByIdMap[adminRegionId].find(
					({ properties }) => properties.regionName === regionName,
				);
				if (region) {
					return (
						<div className={styles.regionTileWrapper}>
							<CustomCard>
								<CardContent>
									<CustomTitle gutterBottom>{region.properties.regionName}</CustomTitle>
									{Object.keys(region.metadata)
										.filter((key) => key !== 'regionName')
										.map((key) => this.renderMetadataSection(key, region.metadata[key]))}
								</CardContent>
							</CustomCard>
						</div>
					);
				}
			}
		}
		return null;
	};

	render() {
		const {
			location: { search },
		} = this.props;
		const {
			vectorFiltersByNamesMap,
			vectorFeaturesByNamesMap,
			adminVectorFeaturesByIdMap,
			observationVectorFeaturesByNamesMap,
			currentRasterLayerNamesSet,
			currentVectorLayerNamesSet,
			currentObservationVectorLayerNamesSet,
			currentBaseMapLayerName,
			rasters,
			rasterOpacityByNameMap,
			isLoadingRasters,
			isLoadingVectors,
			isLoadingObservationVectors,
			isLoadingAdminVectors,
		} = this.state;

		const { zoom, center, boundingBox } = this.getZoomAndCenter();

		const selectedAdminVectorLayerNamesByLabel = getSelectedAdminVectorLayerNamesByLabel(search);

		return (
			<div className={styles.mapWrapper}>
				{this.renderSelectedRegion(selectedAdminVectorLayerNamesByLabel)}
				<div className={styles.filters}>
					<Filters
						baseMapLayers={baseMaps}
						rasterLayers={rasters}
						vectorLayers={vectors}
						adminVectorLayers={adminVectors}
						observationVectorLayers={observationVectors}
						selectedAdminVectorLayerNamesByLabel={selectedAdminVectorLayerNamesByLabel}
						vectorFiltersByNamesMap={vectorFiltersByNamesMap}
						selectedBaseMapLayerName={currentBaseMapLayerName}
						selectedRasterLayerNamesSet={currentRasterLayerNamesSet}
						rasterOpacityByNameMap={rasterOpacityByNameMap}
						selectedVectorLayerNamesSet={currentVectorLayerNamesSet}
						selectedObservationVectorLayerNamesSet={currentObservationVectorLayerNamesSet}
						onUpdateBaseMapLayer={this.handleUpdateBaseMapLayer}
						onUpdateRasterLayers={this.handleUpdateRasterLayers}
						onUpdateRasterLayerOpacityByNameMap={this.handleUpdateRasterLayerOpacityByNameMap}
						onUpdateVectorLayers={this.handleUpdateVectorLayers}
						onUpdateAdminVectorLayers={this.handleUpdateAdminVectorLayers}
						onUpdateObservationVectorLayers={this.handleUpdateObservationVectorLayers}
						onUpdateVectorFilters={this.handleUpdateVectorFilters}
						isLoadingRasters={isLoadingRasters}
						isLoadingVectors={isLoadingVectors}
						isLoadingObservationVectors={isLoadingObservationVectors}
						isLoadingAdminVectors={isLoadingAdminVectors}
					/>
				</div>
				<div className={styles.map}>
					<Map
						baseMapLayer={baseMaps.find(({ name }) => name === currentBaseMapLayerName)}
						rasterLayers={rasters
							.filter(({ name }) => currentRasterLayerNamesSet.has(name))
							.map((raster) => ({
								...raster,
								opacity: rasterOpacityByNameMap[raster.name],
							}))}
						vectorLayers={vectors
							.filter(({ name }) => currentVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: this.filterFeatures(vector.name, vectorFeaturesByNamesMap[vector.name] || []),
							}))}
						observationVectorLayers={observationVectors
							.filter(({ name }) => currentObservationVectorLayerNamesSet.has(name))
							.map((vector) => ({
								...vector,
								features: observationVectorFeaturesByNamesMap[vector.name] || [],
							}))}
						adminVectorLayers={adminVectors
							.filter(({ name, label }) => selectedAdminVectorLayerNamesByLabel[label] === name)
							.map((vector) => ({
								...vector,
								features: adminVectorFeaturesByIdMap[getAdminRegionId(vector)] || [],
								onFeatureClick: this.handleAdminVectorFeatureClick,
							}))}
						onZoomOrPan={this.handleZoomOrPan}
						zoom={zoom}
						center={center}
						boundingBox={boundingBox}
						renderMetadataSection={(key, metadata) =>
							renderToString(this.renderMetadataSection(key, metadata))
						}
					/>
				</div>
			</div>
		);
	}
}

export default withRouter(MapWrapper);
