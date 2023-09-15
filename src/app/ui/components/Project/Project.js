import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

import ProjectItem from './ProjectItem';

// Project.js is responsible for handling project-level tasks

class Project {
	domProject;
	domHeader;
	listItems = [];
	state = {
		isOpen: false,
		currentProject: null,
	};
	closeBtnDOM;

	constructor(items) {
		this.listItems = items.map((item) => new ProjectItem(item));
		this.closeBtnDOM = document.querySelector('.project-close-btn');
		this.domProject = document.getElementById('project');
		this.domHeader = document.querySelector('header');
		this.init();
	}

	init() {
		this.initEvents();
	}

	initEvents() {
		this.closeBtnDOM.addEventListener('click', () => this.hide());
	}

	show() {
		// console.log('show project');

		this.domProject.style.display = 'block';
		this.domHeader.style.pointerEvents = 'none';

		this.tlFadeIn = gsap
			.timeline()
			.to(this.domProject, {
				autoAlpha: 1,
				ease: 'Power2.out',
				duration: 0.6,
			})
			.to(
				this.domHeader,
				{
					opacity: 0,
					duration: 0.3,
					ease: 'Power2.out',
				},
				0,
			);

		this.tlFadeIn.play();
	}

	hide() {
		// console.log('hide project');

		this.tlFadeOut = gsap
			.timeline()
			.to(this.domProject, {
				autoAlpha: 0,
				ease: 'Power2.out',
				duration: 0.8,
				onComplete: () => {
					this.domProject.style.display = 'none';
				},
			})
			.to(
				this.domHeader,
				{
					opacity: 1,
					duration: 0.3,
					ease: 'Power2.out',
					onComplete: () => {
						this.domHeader.style.pointerEvents = 'auto';
					},
				},
				0,
			);

		this.tlFadeOut.play();
	}

	resize(width, height) {}

	delete() {}

	update(dt) {}
}

export default Project;
