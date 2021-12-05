import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { grey } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

import vectorStyles from './vectorStyles';

import groupOptions from '../groupOptions';

import styles from './styles.css';

const CustomSwitch = withStyles({
	switchBase: {
		color: grey[200],
		'&$checked': {
			color: grey[500],
		},
		'&$checked + $track': {
			backgroundColor: grey[500],
		},
	},
	checked: {},
	track: {
		backgroundColor: grey[300],
	},
})(Switch);

const CustomRadio = withStyles({
	root: {
		color: grey[300],
		'&$checked': {
			color: grey[500],
		},
	},
	checked: {},
})((props) => <Radio color="default" {...props} />);

const CustomSlider = withStyles({
	thumb: {
		backgroundColor: grey[500],
		// '&:focus, &:hover, &$active': {
		// 	boxShadow: '#ccc 0 2px 3px 1px',
		// },
	},
	track: {
		backgroundColor: grey[500],
	},
	rail: {
		backgroundColor: grey[500],
	},
	mark: {
		backgroundColor: grey[500],
	},
})(Slider);

const LegendSlider = withStyles({
	thumb: {
		backgroundColor: grey[500],
		display: 'none',
		// '&:focus, &:hover, &$active': {
		// 	boxShadow: '#ccc 0 2px 3px 1px',
		// },
	},
	track: {
		backgroundColor: grey[500],
		display: 'none',
	},
	rail: {
		backgroundColor: grey[500],
		display: 'none',
	},
	mark: {
		backgroundColor: grey[500],
	},
	root: {
		padding: 0,
	},
	markLabel: {
		top: 5,
	},
})(Slider);

const CustomCircularProgress = withStyles({
	root: {
		color: grey[500],
		marginRight: 5,
	},
})((props) => <CircularProgress size={20} {...props} />);

const CustomCollapse = withStyles({
	entered: {
		marginBottom: 10,
	},
})(Collapse);

const CustomFormControl = withStyles({
	root: {
		width: '100%',
	},
})(FormControl);

const CustomFormControlLabel = withStyles({
	root: {
		whiteSpace: 'nowrap',
	},
})(FormControlLabel);

const CustomListItem = withStyles({
	root: {
		width: 'calc(100% + 60px)',
		color: grey[900],
		paddingLeft: 30,
		marginLeft: -30,
		marginRight: -30,
	},
})(ListItem);

const CustomListItemText = withStyles({
	primary: {
		fontWeight: 'bold',
	},
})(ListItemText);

const CustomFormHelperText = withStyles({
	root: {
		color: grey[500],
		marginBottom: 0,
		'&:not(:last-of-type)': {
			marginBottom: 0,
		},
	},
})(FormHelperText);

const LegendList = withStyles({
	root: {
		paddingLeft: 20,
		paddingBottom: 10,
		marginRight: 16,
	},
})(List);

function hexToRgba(hex, opacity) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function ValueLabelComponent(props) {
	const { children, open, value } = props;

	return (
		<Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
			{children}
		</Tooltip>
	);
}

function sortValues(a, b) {
	if (!isNaN(a) && !isNaN(b)) {
		return parseInt(b, 10) - parseInt(a, 10);
	} else {
		return b.localeCompare(a);
	}
}

export default function Filters({
	baseMapLayers,
	rasterLayers,
	vectorLayers,
	observationVectorLayers,
	adminVectorLayers,
	selectedAdminVectorLayerNamesByLabel,
	vectorFiltersByNamesMap,
	selectedBaseMapLayerName,
	selectedRasterLayerNamesSet,
	rasterOpacityByNameMap,
	selectedVectorLayerNamesSet,
	selectedObservationVectorLayerNamesSet,
	onUpdateBaseMapLayer,
	onUpdateRasterLayers,
	onUpdateRasterLayerOpacityByNameMap,
	onUpdateVectorLayers,
	onUpdateObservationVectorLayers,
	onUpdateAdminVectorLayers,
	onUpdateVectorFilters,
	isLoadingRasters,
	isLoadingVectors,
	isLoadingObservationVectors,
	isLoadingAdminVectors,
}) {
	function handleSelectBaseMapLayer(selectedBaseMapLayerName) {
		onUpdateBaseMapLayer(selectedBaseMapLayerName);
	}

	function handleToggleVectorLayer(name, checked) {
		let nextSelectedVectorLayerNamesSet = new Set([...selectedVectorLayerNamesSet]);
		if (checked) {
			nextSelectedVectorLayerNamesSet.add(name);
		} else {
			nextSelectedVectorLayerNamesSet.delete(name);
		}
		onUpdateVectorLayers(nextSelectedVectorLayerNamesSet);
	}

	function handleToggleRasterLayer(name, checked) {
		let nextSelectedRasterLayerNamesSet = new Set([...selectedRasterLayerNamesSet]);
		if (checked) {
			nextSelectedRasterLayerNamesSet.add(name);
		} else {
			nextSelectedRasterLayerNamesSet.delete(name);
		}
		onUpdateRasterLayers(nextSelectedRasterLayerNamesSet);
	}

	function handleUpdateRasterOpacity(name, opacity) {
		let nextRasterOpacityByNameMap = { ...rasterOpacityByNameMap };
		nextRasterOpacityByNameMap[name] = opacity;
		onUpdateRasterLayerOpacityByNameMap(nextRasterOpacityByNameMap);
	}

	function handleToggleObservationVectorLayer(name, checked) {
		let nextSelectedObservationVectorLayerNamesSet = new Set([...selectedObservationVectorLayerNamesSet]);
		if (checked) {
			nextSelectedObservationVectorLayerNamesSet.add(name);
		} else {
			nextSelectedObservationVectorLayerNamesSet.delete(name);
		}
		onUpdateObservationVectorLayers(nextSelectedObservationVectorLayerNamesSet);
	}

	function handleSelectAdminVectorLayers(selectedAdminVectorLayerLabel, selectedAdminVectorLayerName) {
		let nextSelectedAdminVectorLayerNamesByLabel = {
			...selectedAdminVectorLayerNamesByLabel,
			[selectedAdminVectorLayerLabel]: selectedAdminVectorLayerName,
		};

		onUpdateAdminVectorLayers(nextSelectedAdminVectorLayerNamesByLabel);
	}

	function handleToggleFilter(checked, value, filterName, vectorName) {
		const nextVectorFiltersByNamesMap = { ...vectorFiltersByNamesMap };

		const nextSelectedValuesSet = new Set([
			...nextVectorFiltersByNamesMap[vectorName][filterName].selectedValuesSet,
		]);

		if (checked) {
			nextSelectedValuesSet.add(value);
		} else {
			nextSelectedValuesSet.delete(value);
		}

		onUpdateVectorFilters({
			...vectorFiltersByNamesMap,
			[vectorName]: {
				...vectorFiltersByNamesMap[vectorName],
				[filterName]: {
					...vectorFiltersByNamesMap[vectorName][filterName],
					selectedValuesSet: nextSelectedValuesSet,
				},
			},
		});
	}

	function renderLegend(checked, option) {
		const { name, mapboxLayerOptions, legendVariable, legend, customLegend } = option;

		if (legendVariable) {
			const filtersMap = vectorFiltersByNamesMap[name];

			const legendFilter = {
				vectorName: name,
				filterName: legendVariable.name,
				valuesSet: ((filtersMap || {})[legendVariable.name] || {}).valuesSet,
				selectedValuesSet: ((filtersMap || {})[legendVariable.name] || {}).selectedValuesSet,
			};

			const { vectorName, filterName, valuesSet = new Set([]), selectedValuesSet = new Set([]) } = legendFilter;
			const values = [...valuesSet];

			const colorsByValue = {};
			const mapboxColorConfig = mapboxLayerOptions.paint[legendVariable.mapboxPaintProperty].slice(2);
			for (let i = 0; i < mapboxColorConfig.length; i += 2) {
				if (i === mapboxColorConfig.length - 1) {
					colorsByValue.default = mapboxColorConfig[i];
				} else {
					colorsByValue[mapboxColorConfig[i]] = mapboxColorConfig[i + 1];
				}
			}

			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						<CustomFormHelperText>{`${legendVariable.name} (${legendVariable.mapboxPaintProperty})`}</CustomFormHelperText>
						{values.sort(sortValues).map((value) => {
							const checked = selectedValuesSet.has(value);
							const LegendListItem = withStyles({
								root: {
									backgroundColor: checked
										? colorsByValue[value] || colorsByValue.default
										: grey[200],
								},
							})(ListItem);

							const LegendSwitch = withStyles({
								switchBase: {
									color: grey[200],
									'&$checked': {
										color: colorsByValue[value] || colorsByValue.default,
									},
									'&$checked + $track': {
										backgroundColor: grey[300],
									},
								},
								checked: {},
								track: {
									backgroundColor: grey[300],
								},
							})(Switch);

							return (
								<LegendListItem key={value}>
									<ListItemText primary={value} />
									<ListItemSecondaryAction>
										<LegendSwitch
											edge="end"
											onChange={(e) =>
												handleToggleFilter(e.target.checked, value, filterName, vectorName)
											}
											checked={checked}
										/>
									</ListItemSecondaryAction>
								</LegendListItem>
							);
						})}
					</LegendList>
				</Collapse>
			);
		} else if (customLegend) {
			const opacity = rasterOpacityByNameMap[name];
			const { type, categories, min, max } = customLegend;
			let legendNode = null;
			if (type === 'categorical') {
				legendNode = categories.map(({ name, color }) => {
					const LegendListItem = withStyles({
						root: {
							backgroundColor: hexToRgba(color, opacity),
						},
					})(ListItem);

					return (
						<LegendListItem key={name}>
							<ListItemText primary={name} />
							<ListItemSecondaryAction></ListItemSecondaryAction>
						</LegendListItem>
					);
				});
			} else if (type === 'continuous') {
				const LegendListItem = withStyles({
					root: {
						background: `linear-gradient(to right, ${hexToRgba(min.color, opacity)}, ${hexToRgba(
							max.color,
							opacity,
						)})`,
					},
				})(ListItem);
				const LeftAlignedListItemText = withStyles({
					root: {
						color: max.color,
					},
				})(ListItemText);

				const RightAlignedListItemText = withStyles({
					root: {
						textAlign: 'right',
						color: min.color,
					},
				})(ListItemText);

				const steps = [
					{ value: 0, label: '0.0' },
					{ value: 0.2, label: '0.2' },
					{ value: 0.4, label: '0.4' },
					{ value: 0.6, label: '0.6' },
					{ value: 0.8, label: '0.8' },
					{ value: 1, label: '1.0' },
				];

				legendNode = (
					<React.Fragment>
						<LegendListItem key={name}>
							<LeftAlignedListItemText primary={min.name} />
							<RightAlignedListItemText primary={max.name} />
						</LegendListItem>
						<LegendSlider
							step={0.1}
							min={0}
							max={1}
							valueLabelDisplay="auto"
							disabled={true}
							marks={steps}
						/>
					</React.Fragment>
				);
			}

			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						<CustomFormHelperText>{`Opacity: ${opacity}`}</CustomFormHelperText>
						<CustomSlider
							defaultValue={opacity}
							onChangeCommitted={(e, nextOpacity) => handleUpdateRasterOpacity(name, nextOpacity)}
							getAriaValueText={() => `${opacity}`}
							ValueLabelComponent={ValueLabelComponent}
							aria-labelledby="discrete-slider"
							valueLabelDisplay="auto"
							step={0.1}
							marks
							min={0}
							max={1}
						/>
						{legendNode}
					</LegendList>
				</Collapse>
			);
		} else if (legend) {
			const LegendListItem = withStyles({
				root: {
					backgroundColor: checked ? mapboxLayerOptions.paint[legend.mapboxPaintProperty] : grey[200],
				},
			})(ListItem);

			return (
				<Collapse in={checked} timeout="auto" unmountOnExit>
					<LegendList component="div" disablePadding dense={true}>
						<LegendListItem key={'legend'}>
							<ListItemText primary={legend.mapboxPaintProperty} />
						</LegendListItem>
					</LegendList>
				</Collapse>
			);
		} else {
			return null;
		}
	}

	const [showBasemap, setShowBasemap] = useState(false);
	const [showRasters, setShowRasters] = useState(false);
	const [showVectors, setShowVectors] = useState(false);
	const [showObservationVectors, setShowObservationVectors] = useState(false);
	const [showAdminVectors, setShowAdminVectors] = useState(false);

	return (
		<div className={styles.sideBarWrapper}>
			<div className={styles.bodyWrapper}>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowBasemap(!showBasemap)}>
							<CustomListItemText primary={'Base map'} />
							<Chip size={'small'} label={selectedBaseMapLayerName} />
							{showBasemap ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showBasemap}>
							<RadioGroup
								aria-label="Base map"
								name="Base map"
								value={selectedBaseMapLayerName}
								onChange={(e) => handleSelectBaseMapLayer(e.target.value)}
							>
								{baseMapLayers.map((layer) => {
									const { name } = layer;
									return (
										<CustomFormControlLabel
											key={name}
											value={name}
											control={<CustomRadio />}
											label={name}
										/>
									);
								})}
							</RadioGroup>
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowVectors(!showVectors)}>
							<CustomListItemText primary={'Pre-existing maps & data'} />
							{isLoadingVectors && <CustomCircularProgress />}
							{!!selectedVectorLayerNamesSet.size && (
								<Chip size={'small'} label={selectedVectorLayerNamesSet.size} />
							)}
							{showVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showVectors}>
							{groupOptions(vectorLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedVectorLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) =>
																		handleToggleVectorLayer(name, e.target.checked)
																	}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												);
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowRasters(!showRasters)}>
							<CustomListItemText primary={'Landscape predictions'} />
							{isLoadingRasters && <CustomCircularProgress />}
							{!!selectedRasterLayerNamesSet.size && (
								<Chip size={'small'} label={selectedRasterLayerNamesSet.size} />
							)}
							{showRasters ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showRasters}>
							{groupOptions(rasterLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedRasterLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) =>
																		handleToggleRasterLayer(name, e.target.checked)
																	}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												);
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowObservationVectors(!showObservationVectors)}>
							<CustomListItemText primary={'Landscape observations'} />
							{isLoadingObservationVectors && <CustomCircularProgress />}
							{!!selectedObservationVectorLayerNamesSet.size && (
								<Chip size={'small'} label={selectedObservationVectorLayerNamesSet.size} />
							)}
							{showObservationVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showObservationVectors}>
							{groupOptions(observationVectorLayers).map((group) => {
								const { label, options } = group;
								return (
									<React.Fragment key={label}>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										<FormGroup>
											{options.map((option) => {
												const { name } = option;
												const checked = selectedObservationVectorLayerNamesSet.has(name);
												return (
													<React.Fragment key={name}>
														<CustomFormControlLabel
															control={
																<CustomSwitch
																	checked={checked}
																	onChange={(e) =>
																		handleToggleObservationVectorLayer(
																			name,
																			e.target.checked,
																		)
																	}
																	name={name}
																/>
															}
															label={name}
														/>
														{renderLegend(checked, option)}
													</React.Fragment>
												);
											})}
										</FormGroup>
									</React.Fragment>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
				<div className={styles.sectionWrapper}>
					<CustomFormControl component="fieldset">
						<CustomListItem button onClick={() => setShowAdminVectors(!showAdminVectors)}>
							<CustomListItemText primary={'Admin polygons'} />
							{isLoadingAdminVectors && <CustomCircularProgress />}
							{showAdminVectors ? <ExpandMore edge={'end'} /> : <ExpandLess edge={'end'} />}
						</CustomListItem>
						<CustomCollapse in={showAdminVectors}>
							{groupOptions(adminVectorLayers).map((group) => {
								const { label, options } = group;
								const selectedAdminVectorLayerName = selectedAdminVectorLayerNamesByLabel[label];
								return (
									<RadioGroup
										aria-label="Admin polygons"
										name="Admin polygons"
										value={selectedAdminVectorLayerName}
										key={label}
										onChange={(e) => handleSelectAdminVectorLayers(label, e.target.value)}
									>
										<CustomFormHelperText>{label}</CustomFormHelperText>
										{options.map((option) => {
											const { name } = option;
											return (
												<CustomFormControlLabel
													key={name}
													value={name}
													control={<CustomRadio />}
													label={name}
												/>
											);
										})}
									</RadioGroup>
								);
							})}
						</CustomCollapse>
					</CustomFormControl>
				</div>
			</div>
		</div>
	);
}
