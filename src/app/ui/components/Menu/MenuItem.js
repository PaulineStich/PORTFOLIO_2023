import properties from '@core/properties';
import settings from '@core/settings';
// const images = Object.entries(require('../../img/demo2/*.jpg'));
import { STATUS, HOVER_STATE } from '../../constants';

import { gsap, Power3, Expo } from 'gsap';
import math from '@app/utils/math';
import input from '@input/input';
import data from '../../../data/projects';

export default class MenuItem {
	constructor(el, index, animateProperties, project, projectItem) {
		this.DOM = {
			el: el,
			title: el.querySelector('h1').innerText,
		};
		this.data = data[index];
		this.index = index;
		this.animateProperties = animateProperties;
		this.direction = { x: 0, y: 0 };
		this.projectPage = project;
		this.projectPageItem = projectItem;

		this.init();
	}

	init() {
		this.createDiv();
		this.initEvents();
	}

	createDiv() {
		// we want to add/append to the menu item the following html:
		// <div class="hover-reveal">
		//   <div class="hover-reveal_inner" style="overflow: hidden;">
		//     <div class="hover-reveal_img" style="background-image: url(pathToImage);">
		//     </div>
		//   </div>
		// </div>

		this.DOM.reveal = document.createElement('div');
		this.DOM.reveal.className = 'hover-reveal';
		this.DOM.reveal.style.transformOrigin = '50% 50%';

		this.DOM.revealInner = document.createElement('div');
		this.DOM.revealInner.className = 'hover-reveal_inner';

		this.DOM.revealImg = document.createElement('div');
		this.DOM.revealImg.className = 'hover-reveal_img';
		this.DOM.revealImg.style.backgroundImage = `url(${this.data.imgHero})`;

		this.DOM.reveal.appendChild(this.DOM.revealInner);
		this.DOM.revealInner.appendChild(this.DOM.revealImg);
		this.DOM.el.appendChild(this.DOM.reveal);
	}

	initEvents() {
		this.mouseenterFn = (e) => {
			this.show();
			this.firstRAF = true;
			this.loopRender();
			properties.onHover.dispatch(HOVER_STATE.OPEN);
		};
		this.mouseleaveFn = () => {
			this.stopRendering();
			this.hide();
			properties.onHover.dispatch(HOVER_STATE.DEFAULT);
		};

		this.mouseOnClick = () => {
			// console.log('clicked');
			this.projectPage.show();
			this.projectPageItem.refreshPageContent();
		};

		this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
		this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
		this.DOM.el.addEventListener('click', this.mouseOnClick);
	}

	show() {
		gsap.killTweensOf(this.DOM.reveal);

		this.tlFadeIn = gsap
			.timeline({
				onStart: () => {
					this.DOM.reveal.style.opacity = 1;
					gsap.set(this.DOM.el, { zIndex: 50 });
				},
			})
			.to(this.DOM.reveal, {
				ease: 'Expo.easeInOut',
				scale: 1,
				duration: 1.2,
			});
	}

	hide() {
		gsap.killTweensOf(this.DOM.reveal);

		this.tl = gsap
			.timeline({
				onStart: () => {
					gsap.set(this.DOM.el, { zIndex: 1 });
				},
			})
			.to(this.DOM.reveal, {
				ease: 'Expo.easeOut',
				scale: 0.4,
				opacity: 0,
				duration: 1.2,
			});
	}

	calcBounds() {
		this.bounds = {
			el: this.DOM.el.getBoundingClientRect(),
			reveal: this.DOM.reveal.getBoundingClientRect(),
		};
	}

	resize(width, height) {}

	delete() {}

	// start the render loop animation (rAF)
	loopRender() {
		if (!this.requestId) {
			this.requestId = requestAnimationFrame(() => this.update());
		}
	}
	// stop the render loop animation (rAF)
	stopRendering() {
		if (this.requestId) {
			window.cancelAnimationFrame(this.requestId);
			this.requestId = undefined;
		}
	}

	update(dt) {
		this.requestId = undefined;

		if (this.firstRAF) {
			// calculate position/sizes the first time
			this.calcBounds();
		}

		const mouseDistanceX = math.clamp(Math.abs(input.prevMousePixelXY.x - input.mousePixelXY.x), 0, 100);

		this.direction = { x: input.prevMousePixelXY.x - input.mousePixelXY.x, y: input.prevMousePixelXY.y - input.mousePixelXY.y };

		// new translation values
		this.animateProperties.tx.current = input.mousePixelXY.x - this.bounds.el.left - this.DOM.reveal.offsetWidth / 2;
		this.animateProperties.ty.current = input.mousePixelXY.y - this.bounds.el.top - this.DOM.reveal.offsetHeight / 2;

		//
		this.animateProperties.rotation.current = this.firstRAFCycle ? 0 : math.map(mouseDistanceX, 0, 200, 0, this.direction.x < 0 ? 60 : -60);
		this.animateProperties.opacity.current = this.firstRAFCycle ? 1 : math.map(mouseDistanceX, 0, 100, 1, 3);

		// set up the interpolated values
		this.animateProperties.tx.previous = this.firstRAFCycle ? this.animateProperties.tx.current : math.lerp(this.animateProperties.tx.previous, this.animateProperties.tx.current, this.animateProperties.tx.amt);
		this.animateProperties.ty.previous = this.firstRAFCycle ? this.animateProperties.ty.current : math.lerp(this.animateProperties.ty.previous, this.animateProperties.ty.current, this.animateProperties.ty.amt);
		this.animateProperties.rotation.previous = this.firstRAFCycle ? this.animateProperties.rotation.current : math.lerp(this.animateProperties.rotation.previous, this.animateProperties.rotation.current, this.animateProperties.rotation.amt);
		this.animateProperties.opacity.previous = this.firstRAFCycle ? this.animateProperties.brightness.current : math.lerp(this.animateProperties.opacity.previous, this.animateProperties.opacity.current, this.animateProperties.opacity.amt);

		// set styles
		gsap.set(this.DOM.reveal, {
			x: this.animateProperties.tx.previous,
			y: this.animateProperties.ty.previous,
			rotation: this.animateProperties.rotation.previous,
			filter: `brightness(${this.animateProperties.opacity.previous})`,
		});

		this.firstRAF = false;
		this.loopRender();
	}
}
