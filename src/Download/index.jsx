import styles from './styles.css';
import downloads from '../config/downloads';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class About extends Component {
	render() {
		return (
			<div className={styles.wrapper}>
				{downloads.map((download, i) => {
					return (
						<div key={i} className={styles.downloadItem}>
							<span className={styles.downloadLabel}>{download.label}</span>
							<br />
							{download.links.map((link, i) => {
								return (
									<a
										key={i}
										className={styles.downloadLink}
										target={'_blank'}
										rel={'noopener noreferrer'}
										href={link.href}
									>
										{link.name}
									</a>
								);
							})}
						</div>
					);
				})}
			</div>
		);
	}
}

export default withRouter(About);
