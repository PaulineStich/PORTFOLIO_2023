import properties from '@core/properties';
import settings from '@core/settings';
import { TRANSITIONS, STATUS } from '../constants';

import { gsap, Power3, Expo } from 'gsap';

// import * as THREE from 'three';

class Preloader {
	percentTarget = 0;
	percent = 0;
	percentToStart = 0;
	hideRatio = 0;
	_compileList = [];
	_compileCount = 0;
	// _tmpCamera = new THREE.Camera();

	MIN_PRELOAD_DURATION = 1;
	PERCENT_BETWEEN_INIT_AND_START = 0.15;
	MIN_DURATION_BETWEEN_INIT_AND_START = 0.25;
	HIDE_DURATION = 0.5;

	tlLoaded = gsap.timeline({ paused: true });

	preInit() {
		this._preloader = document.querySelector('#preloader');
		this._preloaderTitle = document.querySelectorAll('#preloader-title span');
		this._percetage = document.querySelector('#preloader-percentage');
		this._title = document.querySelector('#preloader-title');
		this._text = document.querySelector('#preloader-text');
		this._bar = document.querySelector('#preloader-bar');
		this._circle = document.querySelector('#preloader-circle');
	}

	init() {}

	start(initCallback, startCallback) {
		this._initCallback = initCallback;
		this._startCallback = startCallback;
		this.isActive = true;

		properties.loader.start((percent) => {
			this.percentTarget = percent;
		});
	}

	resize(width, height) {}

	fadeOutAnimation() {
		this._preloader.style.pointerEvents = 'none';

		this.tlLoaded
			.fromTo(
				this._circle,
				{
					x: 0,
					y: 0,
				},
				{
					x: '-50%',
					y: '-50%',
					left: '50%',
					top: '50%',
					ease: Expo.easeInOut,
					duration: 1.5,
				},
			)
			.to(this._circle, {
				scale: 10,
				ease: Power3.easeInOut,
				duration: 3,
				delay: 0.5,
			})
			.fromTo(
				this._preloaderTitle,
				{
					willChange: 'transform, opacity',
					transformOrigin: '50% 100%',
					opacity: 1,
				},
				{
					duration: 0.7,
					ease: Power3.easeIn,
					opacity: 0,
					stagger: {
						each: 0.01,
						from: 'start',
					},
				},
				0.6,
			)
			.to(this._preloader, {
				opacity: 0,
				duration: 1,
				onComplete: () => {
					properties.onTransition.dispatch(TRANSITIONS.SHOW_GALLERY);
					this.skip();
				},
			});

		this.tlLoaded.play();
	}

	delete() {
		this._preloader.style.display = 'none';
		this._preloader.remove();
	}

	skip() {
		this.delete();
		document.getElementById('ui').classList.add('is-ready');
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
				// properties.renderer.compile(compileItem, this._tmpCamera);
			}

			if (!properties.hasStarted && this.percentToStart == 1) {
				this._text.innerText = 'loaded';

				this._startCallback();

				if (settings.SKIP_ANIMATION) {
					properties.onTransition.dispatch(TRANSITIONS.SHOW_GALLERY);
				}
			}
		}

		let displayPercent = this.percentToStart * this.PERCENT_BETWEEN_INIT_AND_START + this.percent * (1 - this.PERCENT_BETWEEN_INIT_AND_START);

		this._percetage.innerHTML = `${Number((displayPercent * 100).toFixed(0))}%`;
		this._bar.style.transform = `scale3d(${displayPercent.toFixed(4)}, 1, 1)`;
	}
}

export default new Preloader();
