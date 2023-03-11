import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

import {gsap} from 'gsap';

class About {

	tlFadeOut = gsap.timeline({paused: true});
	tlFadeIn = gsap.timeline({paused: true})

	preInit() {
		this.domContainer = document.querySelector('#about');

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
		this.isActive = true;
		this.fadeInAnimation();
		this.tlFadeIn.play()
	}
	
	hide() {
		this.isActive = false;
		this.fadeOutAnimation();
		this.tlFadeOut.play()
	}
    
	fadeInAnimation() {
		this.tlFadeIn
			.to(this.domContainer, {
				opacity: 1,
				duration: 1,
				onComplete: () => {
					
				}
			})
	}

	fadeOutAnimation() {
		this.tlFadeOut
			.to(this.domContainer, {
				opacity: 0,
				duration: 1,
				onComplete: () => {
					
				}
			})
	}

	delete() {}

	update(dt) {}
}

export default new About();