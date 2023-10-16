import * as THREE from 'three';

import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS } from './constants';

import input from '@input/input';
import math from '@utils/math';
import ease from '@utils/ease';

import preloader from '@app/ui/pages/Preloader';
import home from '@app/ui/pages/Home';
import about from '@app/ui/pages/About';
import cursor from './components/Cursor/Cursor';

import { splitText } from '../utils/splitting';

export class UI {
	components = [preloader, home, about, cursor];

	preInit() {
		this.headerAbout = document.getElementById('header-about');
		this.headerHome = document.getElementById('header-projects');
		this.cursor = cursor;

		splitText();

		document.documentElement.classList.add('is-ready');
		this.components.forEach((component) => component.preInit());
	}

	preload(initCallback, startCallback) {
		preloader.start(initCallback, startCallback);
	}

	init() {
		this.components.forEach((component) => component.init());

		this.headerAbout.addEventListener('mousedown', () => this.showPage(STATUS.ABOUT));
		this.headerHome.addEventListener('mousedown', () => this.showPage(STATUS.GALLERY));
	}

	start() {
		if (settings.SKIP_ANIMATION) {
			preloader.skip();
		} else {
			preloader.fadeOutAnimation();
		}
		this.showPage(STATUS.GALLERY);
		this.headerHome.classList.add('active');
		this.cursor.show();
	}

	showPage(pageName) {
		properties.statusSignal.dispatch(pageName);
	}

	resize(width, height) {
		document.documentElement.style.setProperty('--vh', properties.viewportHeight * 0.01 + 'px');
		this.components.forEach((component) => component.resize(width, height));
	}

	update(dt) {
		this.components.forEach((component) => component.update(dt));
	}
}

export default new UI();
