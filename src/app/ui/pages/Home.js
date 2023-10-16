import properties from '@core/properties';
import settings from '@core/settings';
import { STATUS, TRANSITIONS, HOVER_STATE } from '../constants';

import { gsap } from 'gsap';

import Menu from '@app/ui/components/Menu/Menu';
import Gallery from '../components/Gallery/Gallery';
import Header from '../components/Header/Header';

class Home {
	_home;
	_galleryView;
	_galleryList;
	_toggleMenuBtn;
	components = [Menu, Gallery, Header];

	_tlFadeOut = gsap.timeline({ paused: true });
	_tlFadeIn = gsap.timeline({ paused: true });

	preInit() {
		this._home = document.querySelector('#home');
		this._toggleMenuBtn = document.querySelector('#gallery-toggle_button');
		this._toggleMenuBtnText = document.getElementById('gallery-toggle_text');
		this._galleryView = document.querySelector('#gallery-view');
		this._galleryList = document.querySelector('#gallery-list');

		this.components.forEach((component) => component.preInit());

		properties.statusSignal.add((status) => {
			if (status === STATUS.GALLERY) {
				// console.log('show gallery page');
				this._show();
			} else {
				// add a fade out transition of the gallery
				properties.onTransition.dispatch(TRANSITIONS.HIDE_GALLERY);
				// console.log('hide gallery page');
				this._hide();
			}
		});
	}

	init() {
		this.components.forEach((component) => component.init());
		this._toggleToListView();
	}

	_toggleToListView() {
		this._galleryView.style.display = 'block';
		this._galleryList.style.display = 'none';

		// cursor ~ mouse
		this._toggleMenuBtn.addEventListener('mouseenter', (e) => {
			properties.onHover.dispatch(HOVER_STATE.HIDE);
		});

		this._toggleMenuBtn.addEventListener('mouseleave', (e) => {
			properties.onHover.dispatch(HOVER_STATE.DEFAULT);
		});

		this._toggleMenuBtn.addEventListener('change', (e) => {
			if (e.target.checked) {
				this._galleryView.style.display = 'none';
				this._galleryList.style.display = 'block';
				this._toggleMenuBtnText.style.opacity = 1;
				// properties.statusSignal.dispatch(STATUS.MENU);
			} else {
				this._galleryView.style.display = 'block';
				this._galleryList.style.display = 'none';
				this._toggleMenuBtnText.style.opacity = 0.2;
				// properties.statusSignal.dispatch(STATUS.GALLERY);
			}
		});
	}

	_show() {
		// is used when changing pages (menu)
		clearTimeout(this._hiddenTimeout);
		this.isActive = true;
		this._fadeInAnimation();

		// when preloader is finished, start gallery animations
		properties.onTransition.add((transition) => {
			if (transition === TRANSITIONS.SHOW_GALLERY) {
				// start the fade in animation of the gallery here
				this.components.forEach((component) => component.show());
			}
		});
	}

	_hide() {
		// don't forget to stop the animation of the gallery
		properties.onTransition.add((transition) => {
			if (transition === TRANSITIONS.HIDE_GALLERY) {
				// start the fade out animation of the gallery here
				this.components.forEach((component) => component.hide());
			}
		});

		// then we change the pages (menu)
		clearTimeout(this._hiddenTimeout);
		this.isActive = false;

		this._fadeOutAnimation();

		this._hiddenTimeout = setTimeout(() => {
			this._home.style.display = 'none';
		}, 2000);
	}

	_fadeInAnimation() {
		this._home.style.display = 'block';
		this._home.style.pointerEvents = 'auto';
		this._tlFadeIn.to(this._home, {
			opacity: 1,
		});

		this._tlFadeIn.play();
	}

	_fadeOutAnimation() {
		this._home.style.pointerEvents = 'none';
		this._tlFadeOut.to(this._home, {
			opacity: 0,
		});
		this._tlFadeOut.play();
	}

	resize(width, height) {
		this.components.forEach((component) => component.resize(width, height));
	}

	delete() {
		this.components.forEach((component) => component.delete());
	}

	update(dt) {
		if (!this.isActive) return;

		this.components.forEach((component) => component.update(dt));
	}
}

export default new Home();
