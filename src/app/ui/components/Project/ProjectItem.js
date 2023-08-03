import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

// ProjectItem.js is responsible for managing individual project items

class ProjectItem {
	project = {
		title: null,
		description: null,
		tags: [],
	};

	domTitle;
	domDescription;
	domHeroImage;
	domLeftImage;
	domRightImage;

	constructor(itemData) {
		// console.log(itemData);
		this.project.title = itemData.title;
		this.project.description = itemData.description;
		this.project.tags = itemData.tags;

		this.domTitle = document.getElementById('project-title');
		this.domDescription = document.getElementById('project-description');
		// this.domHeroImage = document.getElementById('project-hero');
		// this.domLeftImage = document.getElementById('project-left');
		// this.domRightImage = document.getElementById('project-right');
	}

	preInit() {}

	init() {
		this.initEvents();
	}

	initEvents() {}

	refreshPageContent() {
		this.domTitle.textContent = this.project.title;
		this.domDescription.textContent = this.project.description;
		// console.log('Title: ', this.project.title);
		// console.log('Description: ', this.project.description);
		// console.log('Tags: ', this.project.tags);
	}

	show() {
		console.log('show project item');

		// properties.statusSignal.dispatch(STATUS.PROJECT);
	}

	hide() {
		console.log('hide project item');
	}

	resize(width, height) {}

	delete() {}

	update(dt) {}
}

export default ProjectItem;
