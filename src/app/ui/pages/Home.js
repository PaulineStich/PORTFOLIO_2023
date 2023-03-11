import properties from '@core/properties';
import settings from '@core/settings';
import {STATUS} from '../constants';

import {gsap} from 'gsap';

import menu from '@app/ui/components/Menu/Menu';

class Home {
	_home;
	_galleryListMenu;
	components = [menu];

	_tlFadeOut = gsap.timeline({paused: true});
	_tlFadeIn = gsap.timeline({paused: true})

	preInit() {
		this._home = document.querySelector('#home');
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
		this._galleryListMenu = menu;
		this.components.forEach((component) => component.init());
	}
	
	show() {
		clearTimeout(this._hiddenTimeout);
		this._home.style.display = 'block';
		this._home.style.pointerEvents = 'auto';

		this.isActive = true;
		this.fadeInAnimation();
		this._tlFadeIn.play()
	}
	
	hide() {
		clearTimeout(this._hiddenTimeout);
		this._home.style.pointerEvents = 'none';

		this.isActive = false;
		this.fadeOutAnimation();
		this._tlFadeOut.play()

		this._hiddenTimeout = setTimeout(() => {
			this._home.style.display = 'none';
		}, 2000);
	}

	resize(width, height) {
		this.components.forEach((component) => component.resize(width, height));
	}

    fadeInAnimation() {
		this._tlFadeIn
			.to(this._home, {
				opacity: 1
			})
	}

	fadeOutAnimation() {
		this._tlFadeOut
			.to(this._home, {
				opacity: 0
			})
	}

	delete() {}

	update(dt) {
		this.components.forEach((component) => component.update(dt));
	}
}

export default new Home();
