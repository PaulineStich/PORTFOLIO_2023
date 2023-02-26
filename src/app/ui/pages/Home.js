import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

class Home {

	preInit() {
		this.domContainer = document.querySelector('#home');
	}

	init() {
        // this.fadeInAnimation();
		// this.fadeOutAnimation();
		return;
	}

	show() {
		this.isActive = true;
	}

	hide() {
		console.log('hide home')
		return;
	}

	resize(width, height) {
		return;
	}

    fadeInAnimation() {}

	fadeOutAnimation() {}

	delete() {}

	update(dt) {}
}

export default new Home();
