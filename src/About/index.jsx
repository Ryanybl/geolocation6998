import styles from './styles.css';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import marked from 'marked';

import about from '../config/about.md';

class About extends Component {
	render() {
		return (
			<div className={styles.aboutWrapper}>
				<div
					className={styles.markdownWrapper}
					dangerouslySetInnerHTML={{ __html: marked(about, { breaks: true, gfm: true }) }}
				/>
			</div>
		);
	}
}

export default withRouter(About);
