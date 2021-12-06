import React, { Component, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import MapRenderer from './MapRenderer';

import styles from './styles.css';

export default class Map extends Component {
	static propTypes = {
		baseMapLayer: PropTypes.object,
		vectorLayers: PropTypes.arrayOf(PropTypes.object),
		rasterLayers: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		vectorLayers: [],
		rasterLayers: [],
	};

	componentDidMount() {
		this.mapRenderer = new MapRenderer(this.mapElement, this.props);
	}

	componentDidUpdate(prevProps) {
		this.mapRenderer.update(this.props);
	}

	componentWillUnmount() {
		this.mapRenderer.unload();
	}

	render() {
		return <div ref={(mapElement) => (this.mapElement = mapElement)} className={styles.wrapper} />;
	}
}