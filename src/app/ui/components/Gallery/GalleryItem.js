import { gsap, Power3, Expo } from 'gsap';
import data from '../../../data/projects';

export default class GalleryItem {
	constructor(el, index, gallery) {
		this.DOM = {
			el: el,
			gallery: gallery,
			galleryCounterIndex: document.querySelector('.gallery-view-counter_currentIndex'),
			galleryCounterTotal: document.querySelector('.gallery-view-counter_totalIndex'),
		};
		this.index = index;
		this.totalImages = data.length;

		// this.animateProperties = animateProperties;
		// this.data = data[index];
		// this.direction = { x: 0, y: 0 };
		// this.projectPage = project;
		// this.projectPageItem = projectItem;

		this.init();
	}

	init() {
		const delayStep = 3000;
		const delay = (this.totalImages - 1 - this.index) * delayStep;
		this.updateCounter();

		setTimeout(() => {
			this.startGallery();
		}, delay);
	}

	startGallery() {
		this.fadeOut();
		this.timer = setInterval(() => {
			this.fadeOut();
		}, this.totalImages * 3000);
	}

	fadeOut() {
		gsap.to(this.DOM.el, {
			opacity: 0,
			duration: 2,
			onComplete: () => {
				this.DOM.el.style.opacity = 1; // Reset opacity
				this.DOM.gallery.domGallery.insertBefore(this.DOM.el, this.DOM.gallery.domGallery.firstChild); // Move to the front of the queue
			},
		});
	}

	updateCounter() {
		this.DOM.galleryCounterTotal.textContent = this.totalImages.toString().padStart(2, '0');
		const currentIndex = (this.index + 1) % this.totalImages;
		this.DOM.galleryCounterIndex.textContent = currentIndex.toString().padStart(2, '0');
	}

	update(dt) {}
}
