import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import floor from '@visuals/floor/floor';
import toy from '@app/visuals/toy/toy';

import * as THREE from 'three';

class Visuals {
	container = new THREE.Object3D();

	preInit() {
		floor.preInit();
		toy.preInit();

		this.container.add(floor.container);
		this.container.add(toy.container);
	}

	init() {
		floor.init();
		toy.init();
	}

	resize(width, height) {
		floor.resize(width, height);
		toy.resize(width, height);
	}

	update(dt) {
		floor.update(dt);
		toy.update(dt);
	}
}

export default new Visuals();
