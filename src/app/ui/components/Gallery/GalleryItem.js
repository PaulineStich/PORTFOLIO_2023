import { gsap, Power3, Expo } from 'gsap';
import data from '../../../data/projects';
import properties from '@app/core/properties';
import input from '@input/input';
import math from '@app/utils/math';

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
		this.hasFinishedIntroAnimation = false;
		this.animateProperties = gallery.animateProperties;
		this.positions;
		this.triggerDistance;

		// animateProperties = {
		// 	tx: { previous: 0, current: 0, amt: 0.05 },
		// 	ty: { previous: 0, current: 0, amt: 0.05 },
		// 	rotation: { previous: 0, current: 0, amt: 0.04 },
		// 	opacity: { previous: 0, current: 0, amt: 0.05 },
		// };

		this.init();
	}

	init() {
		// hide gallery at the bottom of the page
		gsap.set(this.DOM.el, {
			y: window.innerHeight,
			opacity: 0,
		});
	}

	show() {
		this._fadeIn();
	}

	hide() {}

	_fadeIn() {
		gsap.to('.gallery-view_menuImage', {
			y: 0,
			opacity: 1,
			duration: 1.5,
			ease: Power3.easeInOut,
			stagger: {
				amount: 0.5,
				grid: [Math.floor(window.innerWidth / 200), Math.floor(window.innerHeight / 200)],
				from: 'start',
			},
			onComplete: () => {
				// this._startGalleryTimer();
				this.hasFinishedIntroAnimation = true;
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

	_getPosition() {
		this.positions = this.DOM.el.getBoundingClientRect();
		this.triggerDistance = (window.innerWidth / 2) * 0.7;
	}

	_calculatePosition(left, top, width, height) {
		// calculate distance from mouse to center of button
		this.distanceMouseToTrigger = math.distance(input.mousePixelXY.x + window.scrollX, input.mousePixelXY.y + window.scrollY, left + width / 2, top + height / 2);
	}

	update(dt) {
		// get position of elements
		this._getPosition();
		let { left, top, width, height } = this.positions;
		this._calculatePosition(left, top, width, height);

		let x = 0;
		let y = 0;

		if (this.distanceMouseToTrigger < this.triggerDistance) {
			// console.log('im in');
			// I want the magnetic effect here, following the cursor movement
			x = (input.mousePixelXY.x + window.scrollX - (this.positions.left + this.positions.width / 2)) * 0.8;
			y = (input.mousePixelXY.y + window.scrollY - (this.positions.top + this.positions.height / 2)) * 0.8;
		} else {
			// console.log('im out');
			// go back to where your position was
		}

		if (this.hasFinishedIntroAnimation) {
			this.animateProperties.tx.current = x;
			this.animateProperties.ty.current = y;

			this.animateProperties.tx.previous = math.lerp(this.animateProperties.tx.previous, this.animateProperties.tx.current, this.animateProperties.tx.amt);
			this.animateProperties.ty.previous = math.lerp(this.animateProperties.ty.previous, this.animateProperties.ty.current, this.animateProperties.ty.amt);

			gsap.set('.gallery-view_menuImage', {
				x: this.animateProperties.tx.previous,
				y: this.animateProperties.ty.previous,
				ease: Power3.easeInOut,
				duration: 0.8,
				stagger: {
					amount: 0.5,
					from: 'end',
				},
			});

			// this.DOM.el.style.transform = `translate3d(${this.animateProperties['tx'].previous}px, ${this.animateProperties['ty'].previous}px, 0)`;
		}
	}
}
