import * as THREE from 'three';

import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import input from '@input/input';
import math from '@utils/math';
import ease from '@utils/ease';

import preloader from '@app/ui/pages/Preloader';
import home from '@app/ui/pages/Home';
import about from '@app/ui/pages/About';

export class UI {
	components = [preloader, home, about];

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
		home.show();
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
