import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS } from '../constants';

import { gsap } from 'gsap';

class About {
	_about;
	_speed = 0.04;
	_offset = 0;

	_tlFadeOut = gsap.timeline({ paused: true });
	_tlFadeIn = gsap.timeline({ paused: true });

	preInit() {
		this._about = document.querySelector('#about');

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
		this._tlFadeIn.play();
	}

	hide() {
		clearTimeout(this._hiddenTimeout);
		this._about.style.pointerEvents = 'none';

		this.isActive = false;
		this._fadeOutAnimation();
		this._tlFadeOut.play();

		this._hiddenTimeout = setTimeout(() => {
			this._about.style.display = 'none';
		}, 0);
	}

	_fadeInAnimation() {
		this._tlFadeIn.to(this._about, {
			opacity: 1,
		});
	}

	_fadeOutAnimation() {
		this._tlFadeOut.to(this._about, {
			opacity: 0,
		});
	}

	_smoothScroll() {
		this._offset += (window.scrollY - this._offset) * this._speed;

		let scroll = 'translateY(-' + this._offset + 'px) translateZ(0)';
		this._about.style.transform = scroll;
	}

	delete() {}

	update(dt) {
		this._smoothScroll();
	}
}

export default new About();
