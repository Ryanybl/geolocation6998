import styles from './styles.css';

import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import adminVectors from '../config/adminVectors';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import imagesByRegionGroup from '../config/images';

const REGION_GROUP_IMAGE_SIZE = 100;

const CustomNestedList = withStyles((theme) => ({
	root: {
		width: '100%',
		maxWidth: 400,
		backgroundColor: theme.palette.background.paper,
	},
	nested: {
		// paddingLeft: 30,
		paddingLeft: theme.spacing(4),
	},
}))((props) => {
	const {
		group: { regionGroup, regions },
		onToggleRegionIsCollapsed,
		onSelectRegion,
		regionIsCollapsed,
		classes,
	} = props;

	return (
		<List
			component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
					{regionGroup}
				</ListSubheader>
			}
			className={classes.root}
		>
			{regions
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((region) => {
					const { name, regions = [] } = region;
					const isCollapsed = regionIsCollapsed[regionGroup][name];
					return (
						<React.Fragment key={`${regionGroup}_${name}`}>
							<ListItem button onClick={() => onSelectRegion(region)}>
								<ListItemText primary={name} />
								<ListItemSecondaryAction>
									{!!regions.length && (
										<IconButton
											edge="end"
											aria-label="comments"
											onClick={() => onToggleRegionIsCollapsed(regionGroup, name)}
										>
											{isCollapsed ? <ExpandLess /> : <ExpandMore />}
										</IconButton>
									)}
								</ListItemSecondaryAction>
							</ListItem>
							<Collapse in={isCollapsed} timeout="auto" unmountOnExit>
								<List component="div" disablePadding dense={true}>
									{regions
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((region) => {
											return (
												<ListItem
													key={`${regionGroup}_${name}_${region.name}`}
													button
													className={classes.nested}
													onClick={() => onSelectRegion(region)}
												>
													<ListItemText primary={region.name} />
												</ListItem>
											);
										})}
								</List>
							</Collapse>
						</React.Fragment>
					);
				})}
		</List>
	);
});

const CustomCircularProgress = withStyles({
	root: {
		color: grey[300],
	},
})((props) => <CircularProgress size={30} {...props} />);

function nestRegions(parentRegions) {
	const lowerLevelRegion = parentRegions[0];
	const higherLevelRegion = parentRegions[1];

	if (parentRegions.length < 2) {
		lowerLevelRegion.regions = lowerLevelRegion.regions.map((region) => ({
			...region,
			regionLevel: lowerLevelRegion.regionLevel,
			hierarchyIndex: lowerLevelRegion.hierarchyIndex,
			regionGroup: lowerLevelRegion.regionGroup,
			// regions: [],
		}));
		return lowerLevelRegion;
	}

	higherLevelRegion.regions = higherLevelRegion.regions.map((region) => ({
		...region,
		regionLevel: higherLevelRegion.regionLevel,
		hierarchyIndex: higherLevelRegion.hierarchyIndex,
		regionGroup: higherLevelRegion.regionGroup,
		regions: [],
	}));

	const parentRegionIndexesByName = {};
	higherLevelRegion.regions.forEach((region, index) => {
		const name = region.name.toLowerCase();
		if (!parentRegionIndexesByName[name]) {
			parentRegionIndexesByName[name] = index;
		}
	});

	lowerLevelRegion.regions.forEach((region) => {
		const parent = region.parent ? region.parent.toLowerCase() : null;
		if (!parent || parentRegionIndexesByName[parent] === undefined) {
			console.error(
				`Region (${region.name}) does not have a parent or parent (${parent}) was not found in higher level regions`,
			);
			return;
		}
		higherLevelRegion.regions[parentRegionIndexesByName[parent]].regions.push({
			...region,
			regionLevel: lowerLevelRegion.regionLevel,
			hierarchyIndex: lowerLevelRegion.hierarchyIndex,
			regionGroup: lowerLevelRegion.regionGroup,
		});
	});

	parentRegions.splice(0, 1);

	return nestRegions(parentRegions);
}

function formatData(adminRegions) {
	const groups = [];
	let indexByRegionGroup = {};
	for (const adminRegion of adminRegions) {
		const { regionGroup } = adminRegion;
		if (indexByRegionGroup[regionGroup] === undefined) {
			indexByRegionGroup[regionGroup] = groups.length;
			groups.push([]);
		}
		groups[indexByRegionGroup[regionGroup]].push(adminRegion);
	}

	return groups.map((group) => {
		group.sort((a, b) => b.hierarchyIndex - a.hierarchyIndex);
		return nestRegions(group);
	});
}

class Explore extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			regionGroups: [],
			regionIsCollapsed: {},
		};
	}

	componentDidMount() {
		this.loadAdminRegions();
	}

	loadAdminRegions = async () => {
		this.setState({ isLoading: true });
		const adminRegions = await Promise.all(
			adminVectors
				.filter(({ showOnHome }) => showOnHome)
				.map(async (vector) => {
					const { name, label, hierarchyIndex } = vector;

					const data = await vector.fetchMetadata();

					return {
						regionLevel: name,
						regionGroup: label,
						hierarchyIndex,
						regions: data.map(({ properties }) => {
							return {
								name: properties.regionName,
								parent: properties.parentRegionName,
								bbox: properties.bbox,
							};
						}),
					};
				}),
		);
		const regionGroups = formatData(adminRegions);

		const regionIsCollapsed = {};
		for (const regionGroup of regionGroups) {
			regionIsCollapsed[regionGroup.regionGroup] = {};
			for (const region of regionGroup.regions) {
				regionIsCollapsed[regionGroup.regionGroup][region.name] = false;
			}
		}

		this.setState({
			regionGroups,
			regionIsCollapsed,
			isLoading: false,
		});
	};

	handleToggleRegionIsCollapsed = (regionGroup, regionName) => {
		const { regionIsCollapsed } = this.state;
		const isCollapsed = regionIsCollapsed[regionGroup][regionName];
		const nextRegionIsCollapsed = {
			...regionIsCollapsed,
			[regionGroup]: {
				...regionIsCollapsed[regionGroup],
				[regionName]: !isCollapsed,
			},
		};
		this.setState({ regionIsCollapsed: nextRegionIsCollapsed });
	};

	handleSelectRegion = (region) => {
		const { history } = this.props;
		const { regionGroup, regionLevel, name, bbox } = region;
		const path = `${process.env.ROOT_PATH}/map?&bbox=${bbox}&region=${encodeURIComponent(
			name,
		)}&adminLayer_${encodeURIComponent(regionGroup)}=${encodeURIComponent(regionLevel)}`;
		history.push(path);
	};

	renderAdminRegions = () => {
		const { regionGroups, regionIsCollapsed, isLoading } = this.state;
		if (isLoading) {
			return (
				<div className={styles.loadingWrapper}>
					<CustomCircularProgress />
				</div>
			);
		}

		return regionGroups.map(({ regionGroup, regions }) => (
			<div key={regionGroup} className={styles.regionWrapper}>
				<div className={styles.imageWrapper}>
					<img
						width={REGION_GROUP_IMAGE_SIZE}
						height={REGION_GROUP_IMAGE_SIZE}
						src={`${process.env.ROOT_PATH}${(imagesByRegionGroup[regionGroup] || {}).src}`}
						alt={(imagesByRegionGroup[regionGroup] || {}).alt}
						onClick={() => {
							const { history } = this.props;
							history.push(imagesByRegionGroup[regionGroup].href);
						}}
					/>
				</div>
				<div className={styles.listWrapper}>
					<CustomNestedList
						group={{ regionGroup, regions }}
						regionIsCollapsed={regionIsCollapsed}
						onToggleRegionIsCollapsed={this.handleToggleRegionIsCollapsed}
						onSelectRegion={this.handleSelectRegion}
					/>
					{/*<CustomNestedListWrapper*/}
					{/*	group={{ regionGroup, regions }}*/}
					{/*	regionIsCollapsed={regionIsCollapsed}*/}
					{/*	onToggleRegionIsCollapsed={this.handleToggleRegionIsCollapsed}*/}
					{/*	onSelectRegion={this.handleSelectRegion}*/}
					{/*/>*/}
				</div>
			</div>
		));
	};

	render() {
		return <div className={styles.exploreWrapper}>{this.renderAdminRegions()}</div>;
	}
}

export default withRouter(Explore);
