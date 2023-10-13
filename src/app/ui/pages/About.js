import properties from '@core/properties';
import settings from '@core/settings';
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

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					const pElement = target.querySelector('p');
					const gradientBackground = target.querySelector('.gradientBackground');
					const title = target.querySelectorAll('span');
					const socialList = target.querySelector('.about-container_cta-social');
					const socialLinks = socialList.querySelectorAll('li');

					if (entry.isIntersecting) {
						gsap.fromTo(pElement, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.9 });
						gsap.fromTo(gradientBackground, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.inOut', delay: 0.8 });
						gsap.fromTo(
							title,
							{ y: 100 },
							{
								y: 0,
								transformOrigin: '50% 100%',
								opacity: 1,
								duration: 1.7,
								ease: 'expo.out',
								rotationX: 0,
								delay: 1,
								stagger: {
									each: 0.15,
									from: 'start',
								},
							},
						);
						gsap.fromTo(socialLinks, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.inOut', stagger: 0.15, delay: 1.2 });
					}
				});
			},
			{
				rootMargin: '0px',
				threshold: 0.2,
			},
		);

		const aboutCta = document.querySelector('.about-container_cta');
		observer.observe(aboutCta);
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
