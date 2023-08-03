import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

class ProjectItem {
	project = {
		title: null,
		description: null,
		tags: [],
	};

	preInit() {}

	init() {
		this.initEvents();
	}

	initEvents() {}

	show() {
		console.log('show project item');
	}

	hide() {
		console.log('hide project item');
	}

	resize(width, height) {}

	delete() {}

	update(dt) {}
}

export default new ProjectItem();
