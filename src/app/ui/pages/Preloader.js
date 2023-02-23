import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import math from '@utils/math';
import * as THREE from 'three';

class Preloader {
	percentTarget = 0;
	percent = 0;
	percentToStart = 0;
	hideRatio = 0;
	_compileList = [];
	_compileCount = 0;
	_tmpCamera = new THREE.Camera();

	MIN_PRELOAD_DURATION = 1;
	PERCENT_BETWEEN_INIT_AND_START = 0.15;
	MIN_DURATION_BETWEEN_INIT_AND_START = 0.25;
	HIDE_DURATION = 0.5;

	preInit() {
		this.domContainer = document.querySelector('#preloader');
		this.domPercentage = document.querySelector('#preloader-percentage');
		this.domText = document.querySelector('#preloader-text');
		this.domBar = document.querySelector('#preloader-bar');
	}

	init() {
		return;
	}

	show(initCallback, startCallback) {
		this._initCallback = initCallback;
		this._startCallback = startCallback;
		this.isActive = true;
		properties.loader.start((percent) => {
			this.percentTarget = percent;
		});
	}

	hide() {
		this.domContainer.style.display = 'none';
		return;
	}

	resize(width, height) {
		return;
	}

	update(dt) {
		if (!this.isActive) return;

		this.percent = Math.min(this.percentTarget, this.percent + (settings.SKIP_ANIMATION ? 1 : this.percentTarget > this.percent ? dt : 0) / this.MIN_PRELOAD_DURATION);

		if (this.percent == 1) {
			if (!properties.hasInitialized) {
				this._initCallback();
				this._compileList = properties.initCompileList.splice(0, properties.initCompileList.length);
				this._compileCount = Math.max(1, this._compileList.length);
			}

			let compiledRatio = Math.max(0, this._compileCount - this._compileList.length) / this._compileCount;
			this.percentToStart = Math.min(compiledRatio, this.percentToStart + (settings.SKIP_ANIMATION ? 1 : this.percent == 1 ? dt : 0) / this.MIN_DURATION_BETWEEN_INIT_AND_START);

			if (this._compileList.length) {
				let compileItem = this._compileList.shift();
				properties.renderer.compile(compileItem, this._tmpCamera);
			}

			if (!properties.hasStarted && this.percentToStart == 1) {
				// this._startCallback();
			}
		}
		let displayPercent = this.percentToStart * this.PERCENT_BETWEEN_INIT_AND_START + this.percent * (1 - this.PERCENT_BETWEEN_INIT_AND_START);

		this.domPercentage.innerHTML = `${Number((displayPercent * 100).toFixed(0))}%`;
		this.domBar.style.transform = `scale3d(${displayPercent.toFixed(4)}, 1, 1)`;
	}
}

export default new Preloader();
