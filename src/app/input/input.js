import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import math from '@utils/math';

import * as THREE from 'three';
import MinSignal from 'min-signal';

class Input {
	onDowned = new MinSignal();
	onMoved = new MinSignal();
	onUped = new MinSignal();
	onClicked = new MinSignal();
	onWheeled = new MinSignal();

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

	wheel = 0;
	wheelDelta = 0;
	lastWheelTime = 0;

	downThroughElems = [];
	currThroughElems = [];
	prevThroughElems = [];
	clickThroughElems = [];

	preInit() {
		const target = document;

		target.addEventListener('mousedown', this._onDown.bind(this));
		target.addEventListener('touchstart', this._getTouchBound(this, this._onDown, true));

		target.addEventListener('mousemove', this._onMove.bind(this));
		target.addEventListener('touchmove', this._getTouchBound(this, this._onMove, true));

		target.addEventListener('mouseup', this._onUp.bind(this));
		target.addEventListener('touchend', this._getTouchBound(this, this._onUp, true));

		target.addEventListener('wheel', this._onWheel.bind(this));
		target.addEventListener('mousewheel', this._onWheel.bind(this));
		target.addEventListener('DOMMouseScroll', this._onWheel.bind(this));
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
		this.wheelDelta = 0;

		this.prevMouseXY.copy(this.mouseXY);
		this.prevMousePixelXY.copy(this.mousePixelXY);
		this.hadMoved = this.hasMoved;
		this.wasDown = this.isDown;
	}

	// ###########################################

	_onWheel(event) {
		const newTime = +new Date();
		this.lastWheelTime = newTime;

		const wheelData = this._normalizeWheel(event);
		this._updateWheelData(event, wheelData.spinY);
	}

	_onDown(event) {
		this.isDown = true;
		this.downTime = +new Date();

		this.prevThroughElems.length = 0;
		this._setThroughElementsByEvent(event, this.downThroughElems);

		this._getInputXY(event, this.downXY);
		this._getInputPixelXY(event, this.downPixelXY);
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

		if (this.isDown === true) {
			this.deltaDownXY.copy(this.mouseXY).sub(this.downXY);
			this.deltaDownPixelXY.copy(this.mousePixelXY).sub(this.downPixelXY);
			this.deltaDownPixelDistance = this.deltaDownPixelXY.length();

			if (browser.isMobile === true) {
				this.isMobileScrollingY = Math.abs(this.deltaPixelXY.y) > 0.1;
				if (this.isMobileScrollingY) {
					const { pixelY } = this._normalizeWheel({ deltaX: this.deltaXY.x, deltaY: this.deltaXY.y });
					this._updateWheelData(event, pixelY);
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

	_updateWheelData(event, wheel) {
		const _wheel = wheel * (browser.isMobile === true ? -100 : 1);
		this.wheelDelta += _wheel < 0 ? Math.floor(_wheel) : Math.ceil(_wheel);
		this.wheel += this.wheelDelta;

		// settings.LOG && console.log(this.wheelDelta, this.wheel);

		this.onWheeled.dispatch(event.target, this.wheelDelta);
	}

	// ###########################################

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

	// ###########################################

	_normalizeWheel(event) {
		// reasonable defaults
		const PIXEL_STEP = 10;
		const LINE_HEIGHT = 40;
		const PAGE_HEIGHT = window.innerHeight;

		let // spinX, spinY
			sX = 0,
			sY = 0,
			// pixelX, pixelY
			pX = 0,
			pY = 0;

		// legacy
		if ('detail' in event) sY = event.detail;
		if ('wheelDelta' in event) sY = -event.wheelDelta / 120;
		if ('wheelDeltaY' in event) sY = -event.wheelDeltaY / 120;
		if ('wheelDeltaX' in event) sX = -event.wheelDeltaX / 120;

		// side scrolling on FF with DOMMouseScroll
		if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
			sX = sY;
			sY = 0;
		}

		pX = sX * PIXEL_STEP;
		pY = sY * PIXEL_STEP;

		if ('deltaY' in event) pY = event.deltaY;
		if ('deltaX' in event) pX = event.deltaX;

		if ((pX || pY) && event.deltaMode) {
			if (event.deltaMode === 1) {
				// delta in LINE units
				pX *= LINE_HEIGHT;
				pY *= LINE_HEIGHT;
			} else {
				// delta in PAGE units
				pX *= PAGE_HEIGHT;
				pY *= PAGE_HEIGHT;
			}
		}

		// fall-back if spin cannot be determined
		if (pX && !sX) sX = pX < 1 ? -1 : 1;
		if (pY && !sY) sY = pY < 1 ? -1 : 1;

		const normalizedWheel = { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };

		return normalizedWheel;
	}
}

export default new Input();
