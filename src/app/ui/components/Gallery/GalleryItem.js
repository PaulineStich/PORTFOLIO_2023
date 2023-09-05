import { gsap, Power3, Expo } from 'gsap';
import data from '../../../data/projects';
import properties from '@app/core/properties';

export default class GalleryItem {
	static counter = 1; // Add this static variable

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
		// hide gallery at the bottom of the page
		gsap.set(this.DOM.el, {
			y: window.innerHeight, // Start position from the bottom of the page
			opacity: 0,
		});
	}

	show() {
		this._fadeIn();
	}

	hide() {}

	_fadeIn() {
		gsap.to(this.DOM.el, {
			y: 0, // Move to the center of the page
			opacity: 1,
			duration: 1.5,
			ease: Power3.easeInOut,
			stagger: {
				amount: 0.1, // Adjust the stagger amount as needed
				grid: [Math.floor(window.innerWidth / 200), Math.floor(window.innerHeight / 200)],
				from: 'start',
			},
			onComplete: () => {
				this._startGalleryTimer();
			},
		});
	}

	_fadeOut() {
		// fade out first visible element in the gallery and put it back in the stack
		gsap.fromTo(
			this.DOM.el,
			{
				opacity: 1,
				duration: 1.5,
				ease: Power3.easeInOut,
			},
			{
				opacity: 0,
				duration: 1.5,
				ease: Power3.easeInOut,
				onComplete: () => {
					this.DOM.el.style.opacity = 1; // Reset opacity
					this.DOM.gallery.domGallery.insertBefore(this.DOM.el, this.DOM.gallery.domGallery.firstChild); // Move to the front of the queue
					this._updateCounter();
					GalleryItem.counter = (GalleryItem.counter % this.totalImages) + 1; // Increment and reset when reaching the total number of images
				},
			},
		);
	}

	_startGalleryTimer() {
		const delayStep = 3000;
		const delay = (this.totalImages - 1 - this.index) * delayStep;
		this.DOM.galleryCounterTotal.textContent = this.totalImages.toString().padStart(2, '0');

		setTimeout(() => {
			this._startGalleryAnimations();
		}, delay);
	}

	_startGalleryAnimations() {
		this._fadeOut();
		this.timer = setInterval(() => {
			this._fadeOut();
		}, this.totalImages * 3000);
	}

	_updateCounter() {
		const currentIndex = GalleryItem.counter;
		this.DOM.galleryCounterIndex.textContent = currentIndex.toString().padStart(2, '0');
	}
}
