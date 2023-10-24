import { gsap, Power1, Power3, Expo } from 'gsap';
import data from '../../../data/projects';
import properties from '@app/core/properties';
import input from '@input/input';
import math from '@app/utils/math';

import { TRANSITIONS, HOVER_STATE, STATUS } from '../../constants';

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
			galleryTitleSpans: '',
		};
		this.index = index;
		this.totalImages = data.length;
		this.animateProperties = gallery.animateProperties;
		this.positions;
		this.projectPage = project;
		this.projectPageItem = projectItem;

		this.tlFadeIn = gsap.timeline({ paused: true });
		this.tlFadeOut = gsap.timeline({ paused: true });

		this.init();
	}

	init() {
		this._setTitle();
		this._setCounter();
		this._setGallery();
		this._initEvents();
	}

	show() {
		this._fadeIn();
	}

	hide() {
		this._fadeOut();
	}

	_fadeIn() {
		this.tlFadeIn.to('#gallery', {
			display: 'block',
		});

		this.tlFadeIn.play();

		// console.log('fade in gallery');
	}

	_fadeOut() {
		// console.log('fade out gallery');

		this.tlFadeOut.to('#gallery', {
			display: 'none',
		});

		this.tlFadeOut.play();
	}

	_initEvents() {
		this.DOM.el.addEventListener('click', () => this._mouseOnClick());
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
		properties.statusSignal.dispatch(STATUS.PROJECT);
	}

	_setCounter() {
		// set counter
		this.DOM.galleryCounterTotal.textContent = data.length < 10 ? '0' + data.length : data.length;
	}

	_setGallery() {
		// hide gallery at the bottom of the page
		gsap.set(this.DOM.el, {
			y: window.innerHeight,
			opacity: 0,
		});
	}

	_updateCounter() {}

	_setTitle() {
		// set title
		this.DOM.galleryTitle.textContent = data[this.index].title;
		this.DOM.galleryTitleSpans = document.querySelectorAll('.gallery-view_menuTitle span');
	}

	_getPosition() {
		this.positions = this.DOM.el.getBoundingClientRect();
		this.triggerDistance = (window.innerWidth / 2) * 0.6;
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

		// this.animateProperties.tx.current = x;
		// this.animateProperties.ty.current = y;

		// this.animateProperties.tx.previous = math.lerp(this.animateProperties.tx.previous, this.animateProperties.tx.current, this.animateProperties.tx.amt);
		// this.animateProperties.ty.previous = math.lerp(this.animateProperties.ty.previous, this.animateProperties.ty.current, this.animateProperties.ty.amt);
	}
}
