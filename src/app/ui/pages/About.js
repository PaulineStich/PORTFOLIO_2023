import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS } from '../constants';

import { gsap, Power3 } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class About {
	_about;
	_speed = 0.08;
	_offset = 0;

	_tlFadeOut = gsap.timeline({ paused: true });
	_tlFadeIn = gsap.timeline({ paused: true });
	_tlTextAnimation = gsap.timeline();

	preInit() {
		this._about = document.querySelector('#about');
		this._aboutTitle = document.querySelectorAll('.about-container_title span');
		this._sections = gsap.utils.toArray('.about-container_fullscreen');
		this._sectionsTitle = document.querySelectorAll('.about-container_titleSection span');

		properties.statusSignal.add((status) => {
			if (status === STATUS.ABOUT) {
				this.show();
			} else {
				this.hide();
			}
		});
	}

	init() {}

	resize(width, height) {}

	show() {
		clearTimeout(this._hiddenTimeout);
		this._about.style.display = 'block';
		this._about.style.pointerEvents = 'auto';

		this.isActive = true;
		this._fadeInAnimation();
	}

	hide() {
		clearTimeout(this._hiddenTimeout);
		this._about.style.pointerEvents = 'none';

		this.isActive = false;
		this._fadeOutAnimation();

		this._hiddenTimeout = setTimeout(() => {
			this._about.style.display = 'none';
		}, 0);
	}

	_fadeInAnimation() {
		this._tlFadeIn.to(this._about, {
			opacity: 1,
		});
		this._tlFadeIn.play();

		this._sections.forEach((section, i) => {
			// console.log(section);
			gsap.set(this._sectionsTitle, {
				y: 100,
			});

			let animation = gsap.to(this._sectionsTitle, {
				y: 0,
				transformOrigin: '50% 100%',
				opacity: 1,
				duration: 1.7,
				ease: 'expo.out',
				rotationX: 0,
				stagger: {
					each: 0.15,
					from: 'start',
				},
			});

			ScrollTrigger.create({
				trigger: section,
				start: 'top 40%',
				end: 'bottom 45%',
				toggleActions: 'play none none restart', //https://codepen.io/GreenSock/pen/LYVKWGo
				animation: animation,
				// markers: true,
				// onUpdate: (self) => {
				// 	console.log('progress:', self.progress.toFixed(3), 'direction:', self.direction, 'velocity', self.getVelocity());
				// },
			});
		});
	}

	_fadeOutAnimation() {
		this._tlFadeOut.to(this._about, {
			opacity: 0,
		});
		this._tlFadeOut.play();
	}

	_smoothScroll() {
		this._offset += Math.round((window.scrollY - this._offset) * this._speed);

		let scroll = 'translateY(-' + this._offset + 'px) translateZ(0)';
		this._about.style.transform = scroll;
	}

	delete() {}

	update(dt) {
		if (!this.isActive) return;

		this._smoothScroll();
	}
}

export default new About();
