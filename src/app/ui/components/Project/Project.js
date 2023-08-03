import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

import ProjectItem from './ProjectItem';

class Project {
	state = {
		isOpen: false,
		currentProject: null,
	};
	closeBtnDOM;

	preInit() {
		this.closeBtnDOM = document.querySelector('.project-close-btn');
	}

	init() {
		this.initEvents();
	}

	initEvents() {
		this.closeBtnDOM.addEventListener('click', () => this.hide());
	}

	show() {
		console.log('show project');
	}

	hide() {
		console.log('hide project');
		return;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {}
}

export default new Project();
