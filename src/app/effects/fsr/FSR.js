import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';

import easuFrag from './fsrEASU.frag';
import frag from './fsr.frag';

export default class Fsr {
	sharpness = 1;
	_easuMaterial;
	_material;

	_inResolution = new THREE.Vector2();
	_outResolution = new THREE.Vector2();

	_cacheRenderTarget = null;

	constructor() {
		this._cacheRenderTarget = fboHelper.createRenderTarget(1, 1);

		this._easuMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_inResolution: { value: this._inResolution },
				u_outResolution: { value: this._outResolution },
			},
			fragmentShader: easuFrag,
		});

		this._material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: this._cacheRenderTarget.texture },
				u_outResolution: this._easuMaterial.uniforms.u_outResolution,
				u_sharpness: { value: 0 },
			},
			fragmentShader: frag,
		});
	}

	render(texture, outRenderTarget) {
		let inWidth = texture.image.width;
		let inHeight = texture.image.height;

		this._material.uniforms.u_sharpness.value = this.sharpness;

		if (this._inResolution.width !== inWidth || this._inResolution.height !== inHeight) {
			this._inResolution.set(inWidth, inHeight);
		}

		let outWidth;
		let outHeight;
		if (outRenderTarget) {
			outWidth = outRenderTarget.width;
			outHeight = outRenderTarget.height;
		} else {
			outWidth = fboHelper.renderer.domElement.width;
			outHeight = fboHelper.renderer.domElement.height;
		}
		if (this._outResolution.width !== outWidth || this._outResolution.height !== outHeight) {
			this._outResolution.set(outWidth, outHeight);
			this._cacheRenderTarget.setSize(outWidth, outHeight);
		}

		this._easuMaterial.uniforms.u_texture.value = texture;
		fboHelper.render(this._easuMaterial, this._cacheRenderTarget);

		if (!outRenderTarget) {
			fboHelper.renderer.setRenderTarget(null);
			fboHelper.renderer.setViewport(0, 0, this._outResolution.x, this._outResolution.y);
		}
		fboHelper.render(this._material, outRenderTarget);
	}
}
