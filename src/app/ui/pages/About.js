import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

class About {

	preInit() {
		this.domContainer = document.querySelector('#about');
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
		console.log('hide about')
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

export default new About();