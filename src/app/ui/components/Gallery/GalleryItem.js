import { gsap, Power1, Power3, Expo } from 'gsap';
import data from '../../../data/projects';
import properties from '@app/core/properties';
import input from '@input/input';
import math from '@app/utils/math';

import { HOVER_STATE } from '../../constants';

export default class GalleryItem {
	static counter = 1; // Add this static variable

	constructor(el, index, gallery, project, projectItem) {
		this.DOM = {
			el: el,
			gallery: gallery,
			galleryCounter: document.querySelector('.gallery-view-counter'),
			galleryCounterIndex: document.querySelector('.gallery-view-counter_currentIndex'),
			galleryCounterTotal: document.querySelector('.gallery-view-counter_totalIndex'),
			galleryTitle: document.querySelector('.gallery-view_menuTitle'),
			galleryTitleSpans: document.querySelectorAll('.gallery-view_menuTitle span'),
		};
		this.index = index;
		this.totalImages = data.length;
		this.hasFinishedIntroAnimation = false;
		this.animateProperties = gallery.animateProperties;
		this.positions;
		this.triggerDistance;
		this.onHover = false;
		this.projectPage = project;
		this.projectPageItem = projectItem;

		this.tlFadeIn = gsap.timeline({ paused: true });

		// parrallax effect for title and gallery
		this.state = {
			aimX: 0,
			aimY: 0,
			current: {
				title: { x: 0, y: 0 },
				galleryCounter: { x: 0, y: 0 },
			},
		};

		this.init();
	}

	init() {
		// hide gallery at the bottom of the page
		gsap.set(this.DOM.el, {
			y: window.innerHeight,
			opacity: 0,
		});
		this._initEvents();
	}

	show() {
		this._fadeIn();
	}

	hide() {}

	_fadeIn() {
		this.tlFadeIn
			.to('.gallery-view_menuImage', {
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
			})
			.to(
				this.DOM.galleryTitle,
				{
					opacity: 1,
				},
				0.15,
			)
			.fromTo(
				this.DOM.galleryTitleSpans,
				{
					willChange: 'transform, opacity',
					transformOrigin: '50% 100%',
					opacity: 0,
					rotationX: 90,
					translateY: 100,
				},
				{
					duration: 1.7,
					ease: 'expo',
					opacity: 1,
					rotationX: 0,
					translateY: 0,
					stagger: {
						each: 0.015,
						from: 'start',
					},
				},
				0.15,
			);

		this.tlFadeIn.play();
	}

	_fadeOut() {
		// fade out first visible element in the gallery and put it back in the stack
		gsap.fromTo(
			this.DOM.el,
			{
				opacity: 1,
				duration: 1,
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

	_mouseEnter() {
		properties.onHover.dispatch(HOVER_STATE.OPEN);
	}

	_mouseLeave() {
		properties.onHover.dispatch(HOVER_STATE.DEFAULT);
	}

	_mouseOnClick() {
		// console.log('clicked');
		this.projectPage.show();
		this.projectPageItem.refreshPageContent();
	}

	_initEvents() {
		this.DOM.el.addEventListener('click', () => this._mouseOnClick());
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
		this.triggerDistance = (window.innerWidth / 2) * 0.6;
	}

	_calculatePosition(left, top, width, height) {
		// calculate distance from mouse to center of button
		this.distanceMouseToTrigger = math.distance(input.mousePixelXY.x + window.scrollX, input.mousePixelXY.y + window.scrollY, left + width / 2, top + height / 2);
	}

	_ease = (target, current, factor) => (target - current) * factor;

	_normalize = () => {
		// normalize from -1.-1 / 0.0 / 1.1
		this.state.aimX = (input.mousePixelXY.x * 2) / window.innerWidth - 1;
		this.state.aimY = (input.mousePixelXY.y * 2) / window.innerHeight - 1;
	};

	_animateElement = (element, factorX, factorY) => {
		this._normalize();
		const { aimX, aimY, current } = this.state;
		current[element].x += this._ease(aimX, current[element].x, factorX);
		current[element].y += this._ease(aimY, current[element].y, factorY);
	};

	update(dt) {
		// get position of elements
		this._getPosition();
		let { left, top, width, height } = this.positions;
		this._calculatePosition(left, top, width, height);

		let x = 0;
		let y = 0;

		// parallax the title + galleryCounter
		this._animateElement('title', 0.15, 0.15);
		this._animateElement('galleryCounter', 0.1, 0.1);

		this.DOM.galleryTitle.style.transform = `translate(-50%, -50%) translate(${2 * this.state.current.title.x}rem, ${2 * this.state.current.title.y}rem)`;
		this.DOM.galleryCounter.style.transform = `translate(-50%, -50%) translate(${1 * this.state.current.title.x}rem, ${1 * this.state.current.title.y}rem)`;

		// animate the Gallery
		if (this.distanceMouseToTrigger < this.triggerDistance) {
			// console.log('im in');
			// I want the magnetic effect here, following the cursor movement
			x = (input.mousePixelXY.x + window.scrollX - (this.positions.left + this.positions.width / 2)) * 0.4;
			y = (input.mousePixelXY.y + window.scrollY - (this.positions.top + this.positions.height / 2)) * 0.4;

			if (!this.onHover) {
				this._mouseEnter();
				this.onHover = true;
			}
		} else {
			// console.log('im out');
			// go back to where your position was

			// x = (input.mousePixelXY.x + window.scrollX - (this.positions.left + this.positions.width / 2)) * 0.05;
			// y = (input.mousePixelXY.y + window.scrollY - (this.positions.top + this.positions.height / 2)) * 0.05;

			if (this.onHover) {
				this._mouseLeave();
				this.onHover = false;
			}
		}

		this.animateProperties.tx.current = x;
		this.animateProperties.ty.current = y;

		this.animateProperties.tx.previous = math.lerp(this.animateProperties.tx.previous, this.animateProperties.tx.current, this.animateProperties.tx.amt);
		this.animateProperties.ty.previous = math.lerp(this.animateProperties.ty.previous, this.animateProperties.ty.current, this.animateProperties.ty.amt);

		if (this.hasFinishedIntroAnimation) {
			gsap.set('.gallery-view_menuImage', {
				x: this.animateProperties.tx.previous,
				y: this.animateProperties.ty.previous,
				ease: Power1.easeInOut,
				duration: 0.8,
				stagger: {
					amount: 0.5,
					from: 'end',
				},
			});
		} else if (this.hasFinishedIntroAnimation && !this.onHover) {
			// gsap.to('.gallery-view_menuImage', {
			// 	x: this.animateProperties.tx.previous,
			// 	ease: Power1.easeInOut,
			// 	duration: 0.8,
			// });
		}
	}
}
