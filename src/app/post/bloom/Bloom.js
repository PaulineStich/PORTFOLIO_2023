import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';

import fragmentShader from './bloom.frag';
import highPassFragmentShader from './bloomHighPass.frag';
import blurFragmentShader from './bloomBlur.frag';

export default class Bloom extends PostEffect {
	ITERATION = 5;

	amount = 1;
	radius = 0;
	threshold = 0.1;
	smoothWidth = 1;

	haloWidth = 0.8;
	haloRGBShift = 0.03;
	haloStrength = 0.21;

	haloMaskInner = 0.3;
	haloMaskOuter = 0.5;

	highPassMaterial;
	highPassRenderTarget;

	renderTargetsHorizontal = [];
	renderTargetsVertical = [];
	blurMaterials = [];

	directionX = new THREE.Vector2(1, 0);
	directionY = new THREE.Vector2(0, 1);

	USE_HD = true;

	init(cfg) {
		Object.assign(this, cfg);
		super.init();

		this.highPassRenderTarget = fboHelper.createRenderTarget(1, 1);
		this.highPassMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_luminosityThreshold: { value: 1.0 },
				u_smoothWidth: { value: 1.0 },

				u_haloWidth: { value: 1.0 },
				u_haloRGBShift: { value: 1.0 },
				u_haloStrength: { value: 1.0 },
				u_haloMaskInner: { value: 1.0 },
				u_haloMaskOuter: { value: 1.0 },
				u_texelSize: null,
				u_aspect: null,
			},
			fragmentShader: highPassFragmentShader,
		});

		for (let i = 0; i < this.ITERATION; i++) {
			this.renderTargetsHorizontal.push(fboHelper.createRenderTarget(1, 1, false, this.USE_HD));
			this.renderTargetsVertical.push(fboHelper.createRenderTarget(1, 1, false, this.USE_HD));

			const kernelRadius = 3 + i * 2;
			this.blurMaterials[i] = fboHelper.createRawShaderMaterial({
				uniforms: {
					u_texture: { value: null },
					u_resolution: { value: new THREE.Vector2() },
					u_direction: { value: null },
				},
				fragmentShader: blurFragmentShader,
				defines: {
					KERNEL_RADIUS: kernelRadius,
					SIGMA: kernelRadius,
				},
			});
		}

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_bloomStrength: { value: 1.0 },
				u_bloomWeights: { value: [] },
			},
			fragmentShader: fragmentShader,
			blending: THREE.NoBlending,
			defines: {
				ITERATION: this.ITERATION,
			},
		});
		for (let i = 0; i < this.ITERATION; i++) {
			this.material.uniforms['u_blurTexture' + i] = { value: this.renderTargetsVertical[i].texture };
		}
	}

	setPostprocessing(postprocessing) {
		super.setPostprocessing(postprocessing);
		const width = postprocessing.width;
		const height = postprocessing.height;

		let resx = Math.ceil(width / 2);
		let resy = Math.ceil(height / 2);
		this.highPassRenderTarget.setSize(resx, resy);

		for (let i = 0; i < this.ITERATION; i++) {
			this.renderTargetsHorizontal[i].setSize(resx, resy);
			this.renderTargetsVertical[i].setSize(resx, resy);
			this.blurMaterials[i].uniforms.u_resolution.value.set(resx, resy);
			resx = Math.ceil(resx / 2);
			resy = Math.ceil(resy / 2);
		}
	}

	dispose() {
		if (this.highPassRenderTarget) {
			this.highPassRenderTarget.dispose();
		}
		for (let i = 0; i < this.ITERATION; i++) {
			if (this.renderTargetsHorizontal[i]) {
				this.renderTargetsHorizontal[i].dispose();
			}
			if (this.renderTargetsVertical[i]) {
				this.renderTargetsVertical[i].dispose();
			}
		}
	}

	needsRender() {
		return !!this.amount;
	}

	render(postprocessing, toScreen = false) {
		this.highPassMaterial.uniforms.u_texture.value = postprocessing.fromTexture;
		this.highPassMaterial.uniforms.u_luminosityThreshold.value = this.threshold;
		this.highPassMaterial.uniforms.u_smoothWidth.value = this.smoothWidth;

		this.highPassMaterial.uniforms.u_haloWidth.value = this.haloWidth;
		this.highPassMaterial.uniforms.u_haloRGBShift.value = this.haloRGBShift * postprocessing.width;
		this.highPassMaterial.uniforms.u_haloStrength.value = this.haloStrength;
		this.highPassMaterial.uniforms.u_haloMaskInner.value = this.haloMaskInner;
		this.highPassMaterial.uniforms.u_haloMaskOuter.value = this.haloMaskOuter;

		this.highPassMaterial.uniforms.u_texelSize = postprocessing.sharedUniforms.u_texelSize;
		this.highPassMaterial.uniforms.u_aspect = postprocessing.sharedUniforms.u_aspect;
		let useHalo = this.haloStrength > 0;

		if (this.highPassMaterial.defines.USE_HALO !== useHalo) {
			this.highPassMaterial.defines.USE_HALO = useHalo;
			this.highPassMaterial.needsUpdate = true;
		}

		postprocessing.renderMaterial(this.highPassMaterial, this.highPassRenderTarget);

		let inputRenderTarget = this.highPassRenderTarget;
		for (let i = 0; i < this.ITERATION; i++) {
			const blurMaterial = this.blurMaterials[i];
			blurMaterial.uniforms.u_texture.value = inputRenderTarget.texture;
			blurMaterial.uniforms.u_direction.value = this.directionX;
			postprocessing.renderMaterial(blurMaterial, this.renderTargetsHorizontal[i]);

			blurMaterial.uniforms.u_texture.value = this.renderTargetsHorizontal[i].texture;
			blurMaterial.uniforms.u_direction.value = this.directionY;
			postprocessing.renderMaterial(blurMaterial, this.renderTargetsVertical[i]);
			inputRenderTarget = this.renderTargetsVertical[i];
		}

		this.material.uniforms.u_texture.value = postprocessing.fromTexture;

		for (let i = 0; i < this.ITERATION; i++) {
			const bloomFactor = (this.ITERATION - i) / this.ITERATION;
			this.material.uniforms.u_bloomWeights.value[i] = (this.amount * (bloomFactor + (1.2 - bloomFactor * 2) * this.radius)) / Math.pow(2, this.ITERATION - i - 1);
		}
		super.render(postprocessing, toScreen);
	}
}
