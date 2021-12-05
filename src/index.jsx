import React from 'react';
import { render as reactDOMRender } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
// Global styles
import './styles.css';

import App from './App';

let root = document.getElementById('root');

if (!root) {
	root = document.createElement('div');
	root.id = 'root';

	document.body.appendChild(root);
}

reactDOMRender(
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	root,
);
