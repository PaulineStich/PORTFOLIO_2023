// import * as THREE from 'three';

import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS, HOVER_STATE } from './constants';

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
		this.headerElements = document.querySelectorAll('.header-element');
		this.headerAbout = document.getElementById('header-about');
		this.headerHome = document.getElementById('header-projects');
		this.cursor = cursor;

		document.documentElement.classList.add('is-ready');
		this.components.forEach((component) => component.preInit());
	}

	preload(initCallback, startCallback) {
		preloader.start(initCallback, startCallback);
	}

	init() {
		this.components.forEach((component) => component.init());

		splitText();

		this.headerAbout.addEventListener('mousedown', () => this.showPage(STATUS.ABOUT));
		this.headerHome.addEventListener('mousedown', () => this.showPage(STATUS.GALLERY));

		this._initEvents();
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

	_initEvents() {
		this.headerElements.forEach(el => {
			el.addEventListener('mouseenter', this._mouseEnter);
			el.addEventListener('mouseleave', this._mouseLeave);
		});
	}

	_mouseEnter() {
		properties.onHover.dispatch(HOVER_STATE.HOVER);
	}

	_mouseLeave() {
		properties.onHover.dispatch(HOVER_STATE.DEFAULT);
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
