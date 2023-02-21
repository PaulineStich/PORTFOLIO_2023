import scrollManager from '@app/scroll/scrollManager';
import ufx from '@app/ui/ufx/ufx';
import UfxMesh from '@app/ui/ufx/ufxComps/UfxMesh';
import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import math from '@utils/math';
import * as THREE from 'three';

class HomeSection {
	domContainer;
	domTitle;
	domDesc;

	domTestBox;
	ufxTestBox;
	needsSyncUfx = true;

	preInit() {
		this.domContainer = document.querySelector('#home-section');
		this.domHero = this.domContainer.querySelector('.hero');
		this.domHeroTitle = this.domContainer.querySelector('.hero-title');
		this.domHeroDesc = this.domContainer.querySelector('.hero-desc');

		this.domTestBox = this.domContainer.querySelector('.hero-test-box');
		this.ufxTestBox = new UfxMesh({
			refDom: this.domTestBox,
			requireBg: true,
			uniforms: {
				u_texture: { value: properties.loader.add(settings.TEXTURE_PATH + 'test.png', { type: 'texture' }).content },
			},
		});

		ufx.scene.add(this.ufxTestBox);
	}

	init() {}

	resize(width, height) {
		this.needsSyncUfx = true;
		return;
	}

	update(dt) {
		let scrollState = scrollManager.getCurrentScrollState('home');
		this.domContainer.style.display = scrollState.isActive ? 'block' : 'none';
		this.ufxTestBox.visible = scrollState.isActive;

		if (scrollState.isActive) {
			let offsetY = (1 - scrollState.showRatio - scrollState.hideRatio) * properties.viewportHeight;
			this.domHero.style.transform = `translate3d(0, ${offsetY}px, 0) translate(-50%, -50%)`;

			if (!scrollState.wasActive || this.needsSyncUfx) {
				this.needsSyncUfx = false;
				this.ufxTestBox.syncDom(offsetY);
			}
			this.ufxTestBox.update(offsetY);
		}
	}
}

export default new HomeSection();
