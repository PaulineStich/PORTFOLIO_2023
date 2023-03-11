import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

import {gsap} from 'gsap';

class About {
	_about;

	_tlFadeOut = gsap.timeline({paused: true});
	_tlFadeIn = gsap.timeline({paused: true})

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

	init() {
		return;
	}

	resize(width, height) {}

	show() {
		clearTimeout(this._hiddenTimeout);
		this._about.style.display = 'block';
		this._about.style.pointerEvents = 'auto';

		this.isActive = true;
		this.fadeInAnimation();
		this._tlFadeIn.play()
	}
	
	hide() {
		clearTimeout(this._hiddenTimeout);
		this._about.style.pointerEvents = 'none';

		this.isActive = false;
		this.fadeOutAnimation();
		this._tlFadeOut.play()

		this._hiddenTimeout = setTimeout(() => {
			this._about.style.display = 'none';
		}, 2000);
	}
    
	fadeInAnimation() {
		this._tlFadeIn
			.to(this._about, {
				opacity: 1
			})
	}

	fadeOutAnimation() {
		this._tlFadeOut
			.to(this._about, {
				opacity: 0
			})
	}

	delete() {}

	update(dt) {}
}

export default new About();