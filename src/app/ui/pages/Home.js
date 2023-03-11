import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

import {gsap} from 'gsap';

import menu from '@app/ui/components/Menu/Menu';

class Home {

	galleryListMenu;
	components = [menu];
	tlFadeOut = gsap.timeline({paused: true});
	tlFadeIn = gsap.timeline({paused: true})

	preInit() {
		this.domContainer = document.querySelector('#home');
		this.components.forEach((component) => component.preInit());
	
		properties.statusSignal.add((status) => {
			if (status === STATUS.GALLERY) {
				this.show();
			} else {
				this.hide();
			}
		});
	}
	
	init() {
		this.galleryListMenu = menu;
		this.components.forEach((component) => component.init());
	}
	
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

	resize(width, height) {
		this.components.forEach((component) => component.resize(width, height));
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

	update(dt) {
		this.components.forEach((component) => component.update(dt));
	}
}

export default new Home();
