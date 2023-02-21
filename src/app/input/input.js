import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import math from '@utils/math';

import * as THREE from 'three';
import MinSignal from 'min-signal';

import normalizeWheel from 'normalize-wheel';

class Input {
	onDowned = new MinSignal();
	onMoved = new MinSignal();
	onUped = new MinSignal();
	onClicked = new MinSignal();
	onWheeled = new MinSignal();
	onScrolled = new MinSignal();

	wasDown = false;
	isDown = false;
	isMobileScrollingY = false;
	downTime = 0;
	hasClicked = false;
	hasMoved = false;
	hadMoved = false;

	mouseXY = new THREE.Vector2();
	prevMouseXY = new THREE.Vector2();
	mousePixelXY = new THREE.Vector2();
	prevMousePixelXY = new THREE.Vector2();

	downXY = new THREE.Vector2();
	downPixelXY = new THREE.Vector2();

	deltaXY = new THREE.Vector2();
	deltaPixelXY = new THREE.Vector2();

	deltaDownXY = new THREE.Vector2();
	deltaDownPixelXY = new THREE.Vector2();
	deltaDownPixelDistance = 0;

	deltaWheel = 0;
	deltaDragScroll = 0;
	deltaScroll = 0;

	canDesktopDragScroll = false;

	downThroughElems = [];
	currThroughElems = [];
	prevThroughElems = [];
	clickThroughElems = [];

	preInit() {
		const target = document;

		target.addEventListener('mousedown', this._onDown.bind(this));
		target.addEventListener('touchstart', this._getTouchBound(this, this._onDown, false));

		target.addEventListener('mousemove', this._onMove.bind(this));
		target.addEventListener('touchmove', this._getTouchBound(this, this._onMove, false));

		target.addEventListener('mouseup', this._onUp.bind(this));
		target.addEventListener('touchend', this._getTouchBound(this, this._onUp, false));

		target.addEventListener('wheel', this._onWheel.bind(this));
		target.addEventListener('mousewheel', this._onWheel.bind(this));
	}

	init() {
		return;
	}

	update(dt) {
		return;
	}

	postUpdate(dt) {
		this.prevThroughElems.length = 0;
		this.prevThroughElems.concat(this.currThroughElems);
		this.deltaWheel = 0;
		this.deltaDragScroll = 0;
		this.deltaScroll = 0;

		this.prevMouseXY.copy(this.mouseXY);
		this.prevMousePixelXY.copy(this.mousePixelXY);
		this.hadMoved = this.hasMoved;
		this.wasDown = this.isDown;
	}

	_onWheel(event) {
		let deltaWheel = normalizeWheel(event).pixelY;
		this.deltaWheel += deltaWheel;
		this.deltaScroll = this.deltaDragScroll + this.deltaWheel;
		this.onWheeled.dispatch(event.target);
		this.onScrolled.dispatch(event.target);
	}

	_onDown(event) {
		this.isDown = true;
		this.downTime = +new Date();

		this.prevThroughElems.length = 0;
		this._setThroughElementsByEvent(event, this.downThroughElems);

		this._getInputXY(event, this.downXY);
		this._getInputPixelXY(event, this.downPixelXY);
		this.prevMouseXY.copy(this.downXY);
		this.prevMousePixelXY.copy(this.downPixelXY);
		this.deltaXY.set(0, 0);
		this.deltaPixelXY.set(0, 0);
		this._getInputXY(event, this.mouseXY);

		this._onMove(event);
		this.onDowned.dispatch(event);
	}

	_onMove(event) {
		this._getInputXY(event, this.mouseXY);
		this._getInputPixelXY(event, this.mousePixelXY);
		this.deltaXY.copy(this.mouseXY).sub(this.prevMouseXY);
		this.deltaPixelXY.copy(this.mousePixelXY).sub(this.prevMousePixelXY);
		this.hasMoved = true;

		if (this.isDown) {
			this.deltaDownXY.copy(this.mouseXY).sub(this.downXY);
			this.deltaDownPixelXY.copy(this.mousePixelXY).sub(this.downPixelXY);
			this.deltaDownPixelDistance = this.deltaDownPixelXY.length();

			if (browser.isMobile || this.canDesktopDragScroll) {
				this.isMobileScrollingY = Math.abs(this.deltaPixelXY.y) > 0.1;
				if (this.isMobileScrollingY) {
					this.deltaDragScroll = -this.deltaPixelXY.y;
					this.deltaScroll = this.deltaDragScroll + this.deltaWheel;
					this.onScrolled.dispatch(event.target);
				}
			}
		}

		this._setThroughElementsByEvent(event, this.currThroughElems);
		this.onMoved.dispatch(event);
	}

	_onUp(event) {
		const dX = event.clientX - this.downPixelXY.x;
		const dY = event.clientY - this.downPixelXY.y;

		// emulate click event
		if (Math.sqrt(dX * dX + dY * dY) < 40 && +new Date() - this.downTime < 300) {
			this._setThroughElementsByEvent(event, this.clickThroughElems);
			this._getInputXY(event, this.mouseXY);
			this.hasClicked = true;
			this.onClicked.dispatch(event);
		}

		// reset
		this.deltaXY.set(0, 0);
		this.deltaPixelXY.set(0, 0);

		this.deltaDownXY.set(0, 0);
		this.deltaDownPixelXY.set(0, 0);
		this.deltaDownPixelDistance = 0;

		this.isDown = false;
		this.isMobileScrollingY = false;

		this.onUped.dispatch(event);
	}

	_getTouchBound(context, fn, usePreventDefault) {
		return function (event) {
			if (usePreventDefault && event.preventDefault) event.preventDefault();
			fn.call(context, event.changedTouches[0] || event.touches[0]);
		};
	}

	_getInputXY(event, v2) {
		// normalize the mouse position into viewport coord: -1 to 1
		v2.set((event.clientX / window.innerWidth) * 2 - 1, 1 - (event.clientY / window.innerHeight) * 2);
		return v2;
	}

	_getInputPixelXY(event, v2) {
		v2.set(event.clientX, event.clientY);
	}

	_setThroughElementsByEvent(event, throughElems) {
		let elem = event.target;
		throughElems.length = 0;
		while (elem.parentNode) {
			throughElems.push(elem);
			elem = elem.parentNode;
		}
	}

	// ###########################################

	hasThroughElem(element, inputType) {
		let throughElems = this[inputType + 'ThroughElems'] || this.currThroughElems;
		let i = throughElems.length;
		while (i--) {
			if (throughElems[i] === element) {
				return true;
			}
		}
		return false;
	}

	hasThroughElemWithClass(className, inputType) {
		let throughElems = this[inputType + 'ThroughElems'] || this.currThroughElems;
		let i = throughElems.length;
		while (i--) {
			if (throughElems[i].classList.contains(className)) {
				return throughElems[i];
			}
		}
		return null;
	}
}

export default new Input();
