import scrollManager from '@app/scroll/scrollManager';
import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import math from '@utils/math';
import * as THREE from 'three';

class EndSection {
	domContainer;
	domTitle;
	domDesc;

	preInit() {
		this.domContainer = document.querySelector('#end-section');
		this.domHero = this.domContainer.querySelector('.hero');
		this.domHeroTitle = this.domContainer.querySelector('.hero-title');
		this.domHeroDesc = this.domContainer.querySelector('.hero-desc');
	}

	init() {}

	show() {}

	hide() {}

	resize(width, height) {
		return;
	}

	update(dt) {
		let scrollState = scrollManager.getCurrentScrollState('end');
		this.domContainer.style.display = scrollState.isActive ? 'block' : 'none';

		if (scrollState.isActive) {
			let offsetY = (1 - scrollState.showRatio) * properties.viewportHeight;
			// console.log(scrollState.showRatio);
			this.domHero.style.transform = `translate3d(0, ${offsetY}px, 0) translate(-50%, -50%)`;
		}
	}
}

export default new EndSection();
