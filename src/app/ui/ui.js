import * as THREE from 'three';

import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import input from '@input/input';
import math from '@utils/math';
import ease from '@utils/ease';

import preloader from '@app/ui/widgets/preloader';
import homeSection from '@app/ui/sections/homeSection/homeSection';
import endSection from '@app/ui/sections/endSection/endSection';
import ufx from './ufx/ufx';

export class UI {
	preInit() {
		document.documentElement.classList.add('is-ready');
		ufx.init();
		properties.postprocessing.queue.push(ufx);

		preloader.preInit();

		homeSection.preInit();
		endSection.preInit();
	}

	preload(initCallback, startCallback) {
		preloader.show(initCallback, startCallback);
	}

	init() {
		homeSection.init();
		endSection.init();
	}

	start() {
		preloader.hide();
	}

	resize(width, height) {
		document.documentElement.style.setProperty('--vh', properties.viewportHeight * 0.01 + 'px');
		preloader.resize(width, height);
		homeSection.resize(width, height);
		endSection.resize(width, height);
	}

	update(dt) {
		preloader.update(dt);
		homeSection.update(dt);
		endSection.update(dt);
	}
}

export default new UI();
