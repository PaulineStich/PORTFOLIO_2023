import * as THREE from 'three';

import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import input from '@input/input';
import math from '@utils/math';
import ease from '@utils/ease';

import preloader from '@app/ui/pages/Preloader';

export class UI {
	components = [preloader];

	preInit() {
		document.documentElement.classList.add('is-ready');
		this.components.forEach((component) => component.preInit());
	}

	preload(initCallback, startCallback) {
		preloader.show(initCallback, startCallback);
	}

	init() {
		this.components.forEach((component) => component.init());
	}

	start() {
		preloader.hide();
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
