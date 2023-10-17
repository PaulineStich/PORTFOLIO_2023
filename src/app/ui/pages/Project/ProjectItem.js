import properties from '@core/properties';
import settings from '@core/settings';
import { gsap, Power3, Expo } from 'gsap';

// ProjectItem.js is responsible for managing individual project items

class ProjectItem {
	project = {
		title: null,
		description: null,
		tags: [],
		imgHero: 'null',
		imgLeft: 'null',
		imgRight: 'null',
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
		this.project.imgHero = itemData.imgHero;
		this.project.imgLeft = itemData.imgLeft;
		this.project.imgRight = itemData.imgRight;
		this.project.link = itemData.link;

		this.domTitle = document.getElementById('project-title');
		this.domDescription = document.getElementById('project-description');
		this.domHeroImage = document.getElementById('project-hero');
		this.domLeftImage = document.getElementById('project-left');
		this.domRightImage = document.getElementById('project-right');
		this.domLinkContainer = document.querySelector('.project-container__links');
		this.domLink = document.getElementById('project-link');
	}

	preInit() {}

	init() {
		this.initEvents();
	}

	initEvents() {}

	refreshPageContent() {
		this.domTitle.textContent = this.project.title;
		this.domDescription.textContent = this.project.description;
		if (this.project.link) {
			this.domLink.href = this.project.link;
			this.domLinkContainer.style.display = 'flex';
		} else {
			this.domLinkContainer.style.display = 'none';
		}

		this._setBackgroundImageOrHide(this.domHeroImage, this.project.imgHero);
		this._setBackgroundImageOrHide(this.domLeftImage, this.project.imgLeft);
		this._setBackgroundImageOrHide(this.domRightImage, this.project.imgRight);

		// console.log('Title: ', this.project.title);
		// console.log('Description: ', this.project.description);
		// console.log('Tags: ', this.project.tags);
	}

	_setBackgroundImageOrHide(el, imageUrl) {
		// check if image is available, if not hide it
		if (imageUrl) {
			el.style.backgroundImage = `url(${imageUrl})`;
			el.style.display = 'block';
		} else {
			el.style.display = 'none';
		}
	}

	show() {
		// console.log('show project item');
		// properties.statusSignal.dispatch(STATUS.PROJECT);
	}

	hide() {
		// console.log('hide project item');
	}

	resize(width, height) {}

	delete() {}

	update(dt) {}
}

export default ProjectItem;
