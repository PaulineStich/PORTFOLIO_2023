import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';
import blueNoise from '@effects/blueNoise/blueNoise';
import ease from '@utils/ease';

import fragmentShader from './final.frag';
import transitionFragmentShader from './finalTransition.frag';

export default class Final extends PostEffect {
	vignetteFrom = 0.6;
	vignetteTo = 1.6;
	vignetteAspect = new THREE.Vector2();
	vignetteColor = new THREE.Color();

	saturation = 1;
	contrast = 0;
	brightness = 1;

	tintColor = new THREE.Color();
	tintOpacity = 1;

	bgColor = new THREE.Color();
	opacity = 1;

	transitionRatio = 1;
	cacheRenderTarget = null;

	init(cfg) {
		Object.assign(this, cfg);
		super.init();

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_vignetteFrom: { value: 0 },
				u_vignetteTo: { value: 0 },
				u_vignetteAspect: { value: this.vignetteAspect },
				u_vignetteColor: { value: this.vignetteColor },

				u_saturation: { value: 0 },
				u_contrast: { value: 0 },
				u_brightness: { value: 0 },

				u_tintColor: { value: this.tintColor },
				u_tintOpacity: { value: 0 },

				u_bgColor: { value: this.bgColor },
				u_opacity: { value: 0 },

				u_ditherSeed: { value: 0 },
			},
			fragmentShader: fragmentShader,
		});

		this.cacheRenderTarget = fboHelper.createRenderTarget(1, 1);
		this.transitionMaterial = fboHelper.createRawShaderMaterial({
			uniforms: Object.assign(
				{
					u_texture: { value: null },
					u_cacheTexture: { value: this.cacheRenderTarget.texture },
					u_transitionRatio: { value: 0 },
					u_aspect: { value: new THREE.Vector2() },
				},
				blueNoise.sharedUniforms,
			),
			fragmentShader: transitionFragmentShader,
		});
	}

	startTransition(postprocessing) {
		let width = postprocessing.width;
		let height = postprocessing.height;
		this.cacheRenderTarget.setSize(width, height);
		fboHelper.copy(postprocessing.fromRenderTarget.texture, this.cacheRenderTarget);
		postprocessing.swap();

		this.transitionRatio = 0;
	}

	render(postprocessing, toScreen = false) {
		const width = postprocessing.width;
		const height = postprocessing.height;

		let uniforms = this.material.uniforms;
		uniforms.u_vignetteFrom.value = this.vignetteFrom;
		uniforms.u_vignetteTo.value = this.vignetteTo;

		const aspectScalar = height / Math.sqrt(width * width + height * height);
		this.vignetteAspect.set((width / height) * aspectScalar, aspectScalar);

		uniforms.u_saturation.value = this.saturation - 1;
		uniforms.u_contrast.value = this.contrast;
		uniforms.u_brightness.value = this.brightness - 1;

		uniforms.u_tintOpacity.value = this.tintOpacity;
		uniforms.u_opacity.value = this.opacity;

		uniforms.u_ditherSeed.value = Math.random() * 1000;

		let transitionRatio = this.transitionRatio;
		let needsTransition = transitionRatio < 1;

		this.material.uniforms.u_texture.value = postprocessing.fromTexture;

		if (needsTransition) {
			postprocessing.renderMaterial(this.material, postprocessing.toRenderTarget);
			postprocessing.swap();
			this.transitionMaterial.uniforms.u_texture.value = postprocessing.fromTexture;
			this.transitionMaterial.uniforms.u_transitionRatio.value = transitionRatio;
			this.transitionMaterial.uniforms.u_aspect.value.copy(this.vignetteAspect);
			postprocessing.renderMaterial(this.transitionMaterial, toScreen ? null : postprocessing.toRenderTarget);
		} else {
			postprocessing.renderMaterial(this.material, toScreen ? null : postprocessing.toRenderTarget);
			postprocessing.swap();
		}
	}
}
