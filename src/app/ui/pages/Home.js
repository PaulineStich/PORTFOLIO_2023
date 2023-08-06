import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS } from '../constants';

import { gsap } from 'gsap';

import Menu from '@app/ui/components/Menu/Menu';
import Gallery from '../components/Gallery/Gallery';

class Home {
	_home;
	_galleryView;
	_galleryList;
	_toggleMenuBtn;
	components = [Menu, Gallery];

	_tlFadeOut = gsap.timeline({ paused: true });
	_tlFadeIn = gsap.timeline({ paused: true });

	preInit() {
		this._home = document.querySelector('#home');
		this._toggleMenuBtn = document.querySelector('#gallery-toggle_button');
		this._galleryView = document.querySelector('#gallery-view');
		this._galleryList = document.querySelector('#gallery-list');

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
		this.components.forEach((component) => component.init());
		this.toggleToListView();
	}

	toggleToListView() {
		this._galleryView.style.display = 'block';
		this._galleryList.style.display = 'none';

		this._toggleMenuBtn.addEventListener('change', (e) => {
			if (e.target.checked) {
				this._galleryView.style.display = 'none';
				this._galleryList.style.display = 'block';
				// properties.statusSignal.dispatch(STATUS.MENU);
			} else {
				this._galleryView.style.display = 'block';
				this._galleryList.style.display = 'none';
				properties.statusSignal.dispatch(STATUS.GALLERY);
			}
		});
	}

	show() {
		clearTimeout(this._hiddenTimeout);
		this._home.style.display = 'block';
		this._home.style.pointerEvents = 'auto';

		this.isActive = true;
		this.fadeInAnimation();
		this._tlFadeIn.play();
	}

	hide() {
		clearTimeout(this._hiddenTimeout);
		this._home.style.pointerEvents = 'none';

		this.isActive = false;
		this.fadeOutAnimation();
		this._tlFadeOut.play();

		this._hiddenTimeout = setTimeout(() => {
			this._home.style.display = 'none';
		}, 2000);
	}

	resize(width, height) {
		this.components.forEach((component) => component.resize(width, height));
	}

	fadeInAnimation() {
		this._tlFadeIn.to(this._home, {
			opacity: 1,
		});
	}

	fadeOutAnimation() {
		this._tlFadeOut.to(this._home, {
			opacity: 0,
		});
	}

	delete() {}

	update(dt) {
		this.components.forEach((component) => component.update(dt));
	}
}

export default new Home();
