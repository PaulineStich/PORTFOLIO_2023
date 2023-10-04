import { gsap } from 'gsap';

class Header {
	constructor() {
		this._header = document.querySelector('header');

		this._tlFadeOut = gsap.timeline({ paused: true });
		this._tlFadeIn = gsap.timeline({ paused: true });

		this.active = false;
	}

	preInit() {}

	init() {}

	show() {
		this._header.style.display = 'block';

		this.active = true;

		this._tlFadeIn.to(this._header, {
			opacity: 1,
			ease: 'Expo.easeInOut',
		});

		this._tlFadeIn.play();
	}

	hide() {
		this.active = false;

		this._tlFadeOut.to(this._home, {
			opacity: 0,
			onComplete: () => {
				this._header.style.display = 'none';
			},
		});

		this._tlFadeOut.play();
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		if (!this.active) return;
	}
}

export default new Header();
