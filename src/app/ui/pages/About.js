import properties from '@core/properties';
import settings from '@core/settings';
import input from '@input/input';
import { STATUS } from '../constants';

import { gsap, Power3 } from 'gsap';

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
		this._chameleonSVG = document.getElementById('chameleon');
		this._chameleonEye = document.querySelector('.eye');
		this._chameleonPupils = document.querySelector('.pupils');

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

		// Define a common animation function to be reused for different sections.
		const animateSection = (section, delay = 0) => {
			const target = section.target;
			const pElement = target.querySelector('p');
			const gradientBackground = target.querySelector('.gradientBackground');
			const title = target.querySelectorAll('span');
			const socialList = target.querySelectorAll('.about-container_cta-social li');

			if (pElement) {
				gsap.fromTo(pElement, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.7 + delay });
			}

			if (gradientBackground) {
				gsap.fromTo(gradientBackground, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.inOut', delay: 0.6 + delay });
			}

			if (title.length > 0) {
				gsap.fromTo(
					title,
					{ y: 100 },
					{
						y: 0,
						transformOrigin: '50% 100%',
						opacity: 1,
						duration: 1.3,
						ease: 'expo.out',
						rotationX: 0,
						delay: 0.2 + delay,
						stagger: {
							each: 0.1,
							from: 'start',
						},
					},
				);
			}

			if (socialList.length > 0) {
				gsap.fromTo(socialList, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.inOut', stagger: 0.15, delay: 0.4 + delay });
			}
		};

		const sections = document.querySelectorAll('.about-container_fullscreen');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateSection(entry);
					}
				});
			},
			{
				rootMargin: '0px',
				threshold: 0.2,
			},
		);

		sections.forEach((section) => {
			observer.observe(section);
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

	_animateChameleon() {
		const eyeBounds = this._chameleonEye.getBoundingClientRect();

		// Get the center of the chameleon's eye
		const centerX = eyeBounds.x + eyeBounds.width / 2;
		const centerY = eyeBounds.y + eyeBounds.height / 2;

		// Calculate the angle between the cursor and the center of the eye
		const deltaX = input.mousePixelXY.x - centerX;
		const deltaY = input.mousePixelXY.y - centerY;
		const angle = Math.atan2(deltaY, deltaX);

		// Convert the angle from radians to degrees and rotate the pupils within the eye
		this._chameleonPupils.style.transform = `rotate(${(angle * 180) / Math.PI}deg)`;
	}

	delete() {}

	update(dt) {
		if (!this.isActive) return;

		this._smoothScroll();
		this._animateChameleon();
	}
}

export default new About();
