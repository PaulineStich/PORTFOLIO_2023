import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';

import bokehCocShader from './bokehCoc.frag';
import bokehSimShader from './bokehSim.frag';
import bokehBlurShader from './bokehBlur.frag';
import bokehFragmentShader from './bokeh.frag';

export default class Bokeh extends PostEffect {
	amount = 1;
	fNumber = 0.07;
	focusDistance = 5;
	useCameraFov = false;
	focalLength = 0.463;
	kFilmHeight = 36; // Height of the 35mm full-frame format (36mm x 24mm)
	quality = 1; // constant 0 lowest 3 highest (Kernel size in KinoBokeh)
	_prevQuality = -1;
	useFloatTexture = false;
	_prevUseFloatTexture = null;
	useAdditionalBlur = true;
	_halfWidth = 0;
	_halfHeight = 0;

	init(cfg) {
		Object.assign(
			this,
			{
				sharedUniforms: {
					u_depthTexture: { value: null },
					u_texelSize: { value: null },
					u_focusDistance: { value: 0 },
					u_fNumber: { value: 0 },
					u_lensCoeff: { value: 0 },
					u_maxCoC: { value: 0 },
					u_rcpMaxCoC: { value: 0 },
					u_rcpAspect: { value: 0 },
					u_cameraNear: { value: 0 },
					u_cameraFar: { value: 0 },
					u_amount: { value: 0 },
					u_halfTexelSize: { value: new THREE.Vector2() },
				},
			},
			cfg,
		);
		super.init();

		this.rt2 = fboHelper.createRenderTarget(1, 1);
		this.rt3 = fboHelper.createRenderTarget(1, 1);

		this.cocMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_hashNoise: { value: 0 },
				u_depthTexture: this.sharedUniforms.u_depthTexture,
				u_texelSize: this.sharedUniforms.u_texelSize,
				u_focusDistance: this.sharedUniforms.u_focusDistance,
				u_lensCoeff: this.sharedUniforms.u_lensCoeff,
				u_maxCoC: this.sharedUniforms.u_maxCoC,
				u_rcpMaxCoC: this.sharedUniforms.u_rcpMaxCoC,
				u_cameraNear: this.sharedUniforms.u_cameraNear,
				u_cameraFar: this.sharedUniforms.u_cameraFar,
			},
			fragmentShader: bokehCocShader,
		});
		this.simMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_cocTexture: { value: null },
				u_cocTexelSize: this.sharedUniforms.u_halfTexelSize,

				u_rcpAspect: this.sharedUniforms.u_rcpAspect,
				u_maxCoC: this.sharedUniforms.u_maxCoC,
			},
			fragmentShader: bokehSimShader,
		});
		this.blurMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_bokehTexture: { value: null },
				u_bokehTexelSize: this.sharedUniforms.u_halfTexelSize,
			},
			fragmentShader: bokehBlurShader,
		});

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_blurTexture: { value: null },
				u_amount: this.sharedUniforms.u_amount,
			},
			fragmentShader: fboHelper.precisionPrefix + bokehFragmentShader,
		});
	}

	dispose() {
		if (this.rt1) {
			this.rt1.dispose();
		}
		this.rt2.dispose();
		this.rt3.dispose();
	}

	needsRender() {
		return this.amount > 0;
	}

	_calculateFocalLength(fovRad, filmHeight) {
		return (0.5 * filmHeight) / Math.tan(0.5 * fovRad);
	}
	_calculateMaxCoCRadius(screenHeight, quality) {
		// Estimate the allowable maximum radius of CoC from the kernel
		// size (the equation below was empirically derived).
		let radiusInPixels = quality * 4 + 6;

		// Applying a 5% limit to the CoC radius to keep the size of
		// TileMax/NeighborMax small enough.
		return Math.min(0.05, radiusInPixels / screenHeight);
	}

	setPostprocessing(postprocessing) {
		super.setPostprocessing.call(this, postprocessing);
		let width = postprocessing.width;
		let height = postprocessing.height;
		let resx = Math.ceil(width / 2);
		let resy = Math.ceil(height / 2);
		this._halfWidth = resx;
		this._halfHeight = resy;
		if (this.rt1) {
			this.rt1.setSize(resx, resy);
		}
		this.rt2.setSize(resx, resy);
		this.rt3.setSize(resx, resy);
		this.sharedUniforms.u_halfTexelSize.value.set(1 / resx, 1 / resy);
	}

	render(postprocessing, toScreen = false) {
		let hasQualityChange = this._prevQuality !== this.quality;
		let hasUseFloatTextureChange = this._prevUseFloatTexture !== this.useFloatTexture;

		let focalLength = this.useCameraFov ? this._calculateFocalLength(postprocessing.sharedUniforms.u_cameraFovRad.value, postprocessing.camera.getFilmHeight()) : this.focalLength;

		// let focusDistance = Math.max(Math.max(0.01, this.focusDistance), focalLength);
		// let fNumber = Math.max(0.1, this.fNumber);
		let focusDistance = this.focusDistance;
		let fNumber = this.fNumber;
		let coeff = (focalLength * focalLength) / (fNumber * (focusDistance - focalLength) * this.kFilmHeight * 2);
		let maxCoC = this._calculateMaxCoCRadius(postprocessing.height, this.quality);

		this.sharedUniforms.u_amount.value = this.amount;

		this.sharedUniforms.u_texelSize.value = postprocessing.sharedUniforms.u_texelSize.value;
		this.sharedUniforms.u_depthTexture.value = postprocessing.sharedUniforms.u_sceneDepthTexture.value;
		this.sharedUniforms.u_cameraNear.value = postprocessing.sharedUniforms.u_cameraNear.value;
		this.sharedUniforms.u_cameraFar.value = postprocessing.sharedUniforms.u_cameraFar.value;

		this.sharedUniforms.u_focusDistance.value = focusDistance;
		this.sharedUniforms.u_fNumber.value = fNumber;
		this.sharedUniforms.u_lensCoeff.value = coeff;
		this.sharedUniforms.u_maxCoC.value = maxCoC;

		this.sharedUniforms.u_rcpMaxCoC.value = 1 / maxCoC;
		this.sharedUniforms.u_rcpAspect.value = postprocessing.height / postprocessing.width;

		if (hasUseFloatTextureChange) {
			if (this.rt1) {
				this.rt1.dispose();
			}
			this.rt1 = fboHelper.createRenderTarget(this._halfWidth, this._halfHeight, false, this.useFloatTexture);
		}

		// COC
		postprocessing.fromTexture.minFilter = postprocessing.fromTexture.magFilter = THREE.NearestFilter;
		if (hasUseFloatTextureChange) {
			this.cocMaterial.defines.USE_FLOAT = this.useFloatTexture;
			this.cocMaterial.needsUpdate = true;
		}
		this.cocMaterial.uniforms.u_hashNoise.value = (this.cocMaterial.uniforms.u_hashNoise.value + 1.2415) % 100;
		this.cocMaterial.uniforms.u_texture.value = postprocessing.fromTexture;
		postprocessing.renderMaterial(this.cocMaterial, this.rt1);

		postprocessing.fromTexture.minFilter = postprocessing.fromTexture.magFilter = THREE.LinearFilter;

		// SIM
		this.simMaterial.defines.QUALITY = this.quality;
		this.simMaterial.uniforms.u_cocTexture.value = this.rt1.texture;
		if (hasQualityChange) this.simMaterial.needsUpdate = true;
		if (hasUseFloatTextureChange) {
			this.simMaterial.defines.USE_FLOAT = this.useFloatTexture;
			this.simMaterial.needsUpdate = true;
		}

		postprocessing.renderMaterial(this.simMaterial, this.rt2);

		if (this.useAdditionalBlur) {
			// ADDITIONAL BLUR
			this.blurMaterial.uniforms.u_bokehTexture.value = this.rt2.texture;
			postprocessing.renderMaterial(this.blurMaterial, this.rt3);
		}

		this.material.uniforms.u_blurTexture.value = this.useAdditionalBlur ? this.rt3.texture : this.rt2.texture;

		this._prevQuality = this.quality;
		this._prevUseFloatTexture = this.useFloatTexture;
		super.render.call(this, postprocessing, toScreen, postprocessing.fromTexture);
	}
}
