import mapboxgl from 'mapbox-gl';
import './styles.css';
import baseMaps from '../config/baseMaps';

import getAdminRegionId from '../getAdminRegionId';

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

function getLayerIdentifier({ name, label }, isAdminRegion = false) {
	return isAdminRegion ? getAdminRegionId({ name, label }) : name;
}

const DEFAULT_CENTER = [33, 1]; // [lng, lat]
const DEFAULT_ZOOM = 7;

export default class MapRenderer {
	constructor(elem, props) {
		this.elem = elem;

		this.baseLayers = new Map();
		this.rasterLayers = new Map();
		this.vectorLayers = new Map();
		this.observationVectorLayers = new Map();
		this.adminVectorLayers = new Map();

		const {
			baseMapLayer,
			center,
			zoom,
			renderMetadataSection = (key, metadata) => `<p><b>${key}</b><br>${metadata[key]}</p>`,
		} = props;

		this.renderMetadataSection = renderMetadataSection;

		const initialBaseMapLayer = baseMapLayer || baseMaps.find(({ isDefault }) => isDefault);
		this.baseLayers.set(getLayerIdentifier(initialBaseMapLayer), initialBaseMapLayer);

		this.map = new mapboxgl.Map({
			container: this.elem,
			style: initialBaseMapLayer.mapboxStyle,
			center: center || DEFAULT_CENTER,
			zoom: zoom || DEFAULT_ZOOM,
		});
		const scale = new mapboxgl.ScaleControl({
			maxWidth: 100,
			unit: 'metric',
		});
		this.map.addControl(scale);
		const nav = new mapboxgl.NavigationControl({
			showCompass: false,
		});
		this.map.addControl(nav, 'top-left');

		this.onZoomOrPan = props.onZoomOrPan;
		this.map.on('zoomend', this.handleZoomEnd);
		this.map.on('moveend', this.handleMoveEnd);

		this.map.once('style.load', () => {
			this.waitForStyleLoad(() => {
				this.update(props, { initialRender: true });
			});
		});
	}

	handleMoveEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
	};

	handleZoomEnd = () => {
		const zoom = this.map.getZoom();
		const center = this.map.getCenter();
		this.onZoomOrPan(zoom, center);
	};

	waitForStyleLoad = (callback = () => {}, timeout = 200) => {
		clearTimeout(this.styleTimeout);
		const waiting = () => {
			// TODO: isStyleLoaded() is unreliable - monitor https://github.com/mapbox/mapbox-gl-js/issues/8691
			if (!this.map.isStyleLoaded()) {
				this.styleTimeout = setTimeout(waiting, timeout);
			} else {
				callback();
			}
		};
		waiting();
	};

	removeLayerFromMap = (layer) => {
		const identifier = layer.id;
		const mapboxLayerTypes = layer.type instanceof Array ? layer.type : [layer.type];
		for (const type of mapboxLayerTypes) {
			const id = `${identifier}_${type}`;
			if (this.map.getLayer(id)) {
				// remove layer from map;
				this.map.removeLayer(id);
			}
		}
		if (this.map.getSource(identifier)) {
			// remove source from map;
			this.map.removeSource(identifier);
		}
	};

	addVectorLayerToMap = (vectorLayer, isAdminRegion = false) => {
		const {
			mapboxSourceType,
			mapboxLayerType,
			mapboxLayerOptions = {},
			features,
			minZoom,
			maxZoom,
			onFeatureClick,
		} = vectorLayer;

		const identifier = getLayerIdentifier(vectorLayer, isAdminRegion);

		// define source
		const source = {
			type: mapboxSourceType,
			data: {
				type: 'FeatureCollection',
				features,
			},
		};
		// add source to map
		if (!this.map.getSource(identifier)) {
			this.map.addSource(identifier, source);
		}
		// define layer
		const layer = {
			id: identifier,
			type: mapboxLayerType,
			source: identifier,
			...mapboxLayerOptions,
		};
		const mapboxLayerTypes = mapboxLayerType instanceof Array ? mapboxLayerType : [mapboxLayerType];
		for (const type of mapboxLayerTypes) {
			const id = `${identifier}_${type}`;
			const mapLayer = {
				id,
				type,
				source: identifier,
				...(mapboxLayerType instanceof Array ? mapboxLayerOptions[type] : mapboxLayerOptions),
			};
			if (minZoom) {
				mapLayer.minzoom = minZoom;
			}
			if (maxZoom) {
				mapLayer.maxzoom = maxZoom;
			}
			// add layer to map
			if (!this.map.getLayer(id)) {
				this.map.addLayer(mapLayer);

				// set tooltip listener
				if (onFeatureClick) {
					this.map.on('click', id, (e) => {
						let features = this.map.queryRenderedFeatures(e.point, { layers: [id] });
						// const metadata = e.features[0].properties;
						const metadata = features[0].properties;

						onFeatureClick(metadata);
					});
				} else {
					const popup = new mapboxgl.Popup({
						closeButton: false,
						closeOnClick: false,
					});

					this.map.on('mouseenter', id, (e) => {
						let features = this.map.queryRenderedFeatures(e.point, { layers: [id] });
						// const metadata = e.features[0].properties;
						const metadata = features[0].properties;

						if (Object.keys(metadata).length) {
							// Change the cursor style as a UI indicator.
							this.map.getCanvas().style.cursor = 'pointer';

							const coordinates = [parseFloat(e.lngLat.lng), parseFloat(e.lngLat.lat)];

							// Ensure that if the map is zoomed out such that multiple
							// copies of the feature are visible, the popup appears
							// over the copy being pointed to.
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}

							// Populate the popup and set its coordinates
							// based on the feature found.
							popup
								.setLngLat(coordinates)
								.setHTML(
									Object.keys(metadata)
										.map((key) => this.renderMetadataSection(key, metadata[key]))
										.join(''),
								)
								.addTo(this.map);
						}
					});

					this.map.on('mouseleave', id, () => {
						this.map.getCanvas().style.cursor = '';
						popup.remove();
					});
				}
			}
		}

		return layer;
	};

	addRasterLayerToMap = (rasterLayer, beforeId) => {
		const { mapboxId, minNativeZoom, maxNativeZoom, bounds, minZoom, maxZoom, opacity } = rasterLayer;

		const identifier = getLayerIdentifier(rasterLayer);

		// define source
		const source = {
			type: 'raster',
			tiles: [`https://api.mapbox.com/v4/${mapboxId}/{z}/{x}/{y}.png?access_token=${mapboxgl.accessToken}`],
			tileSize: 512,
			minzoom: minNativeZoom,
			maxzoom: maxNativeZoom,
			bounds,
		};

		// add source to map
		if (!this.map.getSource(identifier)) {
			this.map.addSource(identifier, source);
		}

		// define layer
		const layer = {
			id: identifier,
			type: 'raster',
			source: identifier,
		};

		const id = `${identifier}_raster`;
		const mapLayer = {
			id,
			type: 'raster',
			source: identifier,
			minzoom: minZoom,
			maxzoom: maxZoom,
			paint: {
				'raster-opacity': opacity,
			},
		};

		// add layer to map
		if (!this.map.getLayer(id)) {
			this.map.addLayer(mapLayer, beforeId);
		}

		return layer;
	};

	update(
		{
			baseMapLayer,
			rasterLayers,
			vectorLayers,
			observationVectorLayers,
			adminVectorLayers,
			center = DEFAULT_CENTER,
			zoom = DEFAULT_ZOOM,
			boundingBox,
		},
		{ initialRender = false } = {},
	) {
		if (initialRender) {
			this.map.jumpTo({ center, zoom });
		}
		if (boundingBox) {
			this.map.fitBounds(boundingBox);
		}

		let baseLayer = this.baseLayers.get(getLayerIdentifier(baseMapLayer));
		if (!baseLayer) {
			for (const [layerIdentifier, layer] of this.baseLayers) {
				this.baseLayers.delete(layerIdentifier);
			}
			this.baseLayers.set(getLayerIdentifier(baseMapLayer), baseMapLayer);

			this.map.setStyle(baseMapLayer.mapboxStyle);
			this.map.once('style.load', () => {
				this.waitForStyleLoad(() => {
					for (const [layerIdentifier, layer] of this.adminVectorLayers) {
						this.removeLayerFromMap(layer);
						this.adminVectorLayers.delete(layerIdentifier);
					}
					for (const [layerIdentifier, layer] of this.rasterLayers) {
						this.removeLayerFromMap(layer);
						this.rasterLayers.delete(layerIdentifier);
					}
					for (const [layerIdentifier, layer] of this.vectorLayers) {
						this.removeLayerFromMap(layer);
						this.vectorLayers.delete(layerIdentifier);
					}
					for (const [layerIdentifier, layer] of this.observationVectorLayers) {
						this.removeLayerFromMap(layer);
						this.vectorLayers.delete(layerIdentifier);
					}
					this.update(
						{
							baseMapLayer,
							rasterLayers,
							vectorLayers,
							observationVectorLayers,
							adminVectorLayers,
							center,
							zoom,
						},
						{ initialRender: true },
					);
				});
			});
			return;
		}

		this.waitForStyleLoad(() => {
			const adminVectorLayerIdentifiersSet = new Set(
				adminVectorLayers.map((adminVectorLayer) => getLayerIdentifier(adminVectorLayer, true)),
			);
			for (const [layerIdentifier, layer] of this.adminVectorLayers) {
				if (!adminVectorLayerIdentifiersSet.has(layerIdentifier)) {
					this.removeLayerFromMap(layer);
					this.adminVectorLayers.delete(layerIdentifier);
				}
			}
			for (const vectorLayer of adminVectorLayers) {
				let layer = this.adminVectorLayers.get(getLayerIdentifier(vectorLayer, true));
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer, true);
					this.adminVectorLayers.set(getLayerIdentifier(vectorLayer, true), layer);
				} else {
					if (this.map.getSource(getLayerIdentifier(vectorLayer, true)) && vectorLayer.features.length) {
						this.map.getSource(getLayerIdentifier(vectorLayer, true)).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}
				}
			}

			const rasterLayerIdentifiersSet = new Set(
				rasterLayers.map((rasterLayer) => getLayerIdentifier(rasterLayer)),
			);
			for (const [layerIdentifier, layer] of this.rasterLayers) {
				if (!rasterLayerIdentifiersSet.has(layerIdentifier)) {
					this.removeLayerFromMap(layer);
					this.rasterLayers.delete(layerIdentifier);
				}
			}
			for (const rasterLayer of rasterLayers) {
				let layer = this.rasterLayers.get(getLayerIdentifier(rasterLayer));
				if (!layer) {
					layer = this.addRasterLayerToMap(
						rasterLayer,
						// place raster underneath first admin layer
						`${getLayerIdentifier(adminVectorLayers[0], true)}_${
							adminVectorLayers[0].mapboxLayerType instanceof Array
								? adminVectorLayers[0].mapboxLayerType[0]
								: adminVectorLayers[0].mapboxLayerType
						}`,
					);
					this.rasterLayers.set(getLayerIdentifier(rasterLayer), layer);
				} else {
					const id = `${getLayerIdentifier(rasterLayer)}_raster`;
					const currentOpacity = this.map.getPaintProperty(id, 'raster-opacity');
					if (rasterLayer.opacity !== currentOpacity) {
						this.map.setPaintProperty(id, 'raster-opacity', rasterLayer.opacity);
					}
				}
			}

			const vectorLayerIdentifiersSet = new Set(
				vectorLayers.map((vectorLayer) => getLayerIdentifier(vectorLayer)),
			);
			for (const [layerIdentifier, layer] of this.vectorLayers) {
				if (!vectorLayerIdentifiersSet.has(layerIdentifier)) {
					this.removeLayerFromMap(layer);
					this.vectorLayers.delete(layerIdentifier);
				}
			}
			for (const vectorLayer of vectorLayers) {
				let layer = this.vectorLayers.get(getLayerIdentifier(vectorLayer));
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer);
					this.vectorLayers.set(getLayerIdentifier(vectorLayer), layer);
				} else {
					if (this.map.getSource(getLayerIdentifier(vectorLayer))) {
						this.map.getSource(getLayerIdentifier(vectorLayer)).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}
				}
			}

			const observationVectorLayerIdentifiersSet = new Set(
				observationVectorLayers.map((observationVectorLayer) => getLayerIdentifier(observationVectorLayer)),
			);
			for (const [layerIdentifier, layer] of this.observationVectorLayers) {
				if (!observationVectorLayerIdentifiersSet.has(layerIdentifier)) {
					this.removeLayerFromMap(layer);
					this.observationVectorLayers.delete(layerIdentifier);
				}
			}
			for (const vectorLayer of observationVectorLayers) {
				let layer = this.observationVectorLayers.get(getLayerIdentifier(vectorLayer));
				if (!layer) {
					layer = this.addVectorLayerToMap(vectorLayer);
					this.observationVectorLayers.set(getLayerIdentifier(vectorLayer), layer);
				} else {
					if (this.map.getSource(getLayerIdentifier(vectorLayer))) {
						this.map.getSource(getLayerIdentifier(vectorLayer)).setData({
							type: 'FeatureCollection',
							features: vectorLayer.features,
						});
					}
				}
			}
		});
	}

	unload() {
		clearTimeout(this.styleTimeout);
	}
}
