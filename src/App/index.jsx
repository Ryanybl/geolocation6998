import styles from './styles.css';

import React, { Component } from 'react';
import { withRouter, NavLink, Route, Switch } from 'react-router-dom';

import Explore from '../Explore';
import MapWrapper from '../MapWrapper';
import About from '../About';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

const CustomTitle = withStyles({
	root: {
		fontSize: 20,
	},
})(Typography);

const CustomSubTitle = withStyles({
	root: {
		marginLeft: 10,
		fontSize: 20,
		color: grey[600],
	},
})(Typography);

class App extends Component {
	constructor(props) {
		super(props);
		const { history } = props;
		let path = localStorage.getItem('path');
		if (path) {
			localStorage.removeItem('path');
			history.replace(`/${path}`);
		}
	}

	renderHeader = () => {
		return (
			<div className={styles.headerWrapper}>
				<div className={styles.header}>
					<CustomTitle component={'h4'}>{'Subsaharan Satellite Imagery Project'}</CustomTitle>
					<CustomSubTitle component={'h4'}>{'Graphical Landscape in Africa'}</CustomSubTitle>
				</div>
				<div className={styles.navigation}>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={process.env.ROOT_PATH}
					>
						{'Region'}
					</NavLink>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={`${process.env.ROOT_PATH}/map`}
					>
						{'Map'}
					</NavLink>
					<NavLink
						exact={true}
						className={styles.link}
						activeClassName={styles.active}
						to={`${process.env.ROOT_PATH}/about`}
					>
						{'About'}
					</NavLink>
				</div>
			</div>
		);
	};

	renderBody = () => {
		return (
			<div className={styles.bodyWrapper}>
				<Switch>
					<Route exact={true} path={`${process.env.ROOT_PATH}/map`} component={MapWrapper} />
					<Route exact={true} path={`${process.env.ROOT_PATH}/about`} component={About} />
					<Route component={Explore} />
				</Switch>
			</div>
		);
	};

	render() {
		return (
			<div className={styles.appWrapper}>
				{this.renderHeader()}
				{this.renderBody()}
			</div>
		);
	}
}

export default withRouter(App);
