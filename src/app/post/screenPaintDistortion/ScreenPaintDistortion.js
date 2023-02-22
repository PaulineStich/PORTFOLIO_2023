import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';

import frag from './screenPaintDistortion.frag';

export default class ScreenPaintDistortion extends PostEffect {
	screenPaint = null;
	amount = 20;
	rgbShift = 1;
	multiplier = 1.25;
	shade = 1.25;

	init(cfg) {
		Object.assign(this, cfg);
		super.init();
		if (!this.screenPaint) throw new Error('screenPaint is required');

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_screenPaintTexture: this.screenPaint.sharedUniforms.u_currPaintTexture,
				u_screenPaintTexelSize: this.screenPaint.sharedUniforms.u_paintTexelSize,
				u_amount: { value: 0 },
				u_rgbShift: { value: 0 },
				u_multiplier: { value: 0 },
				u_shade: { value: 0 },
			},
			fragmentShader: frag,
		});
	}

	needsRender(postprocessing) {
		let needsRender = this.amount > 0;
		return needsRender;
	}

	syncCamera(camera) {
		this.needsSync = true;
		if (camera) {
			camera.matrixWorldInverse.decompose(this._position, this._quaternion, this._scale);
			this.projectionViewMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
			this.projectionViewInverseMatrix.copy(this.projectionViewMatrix).invert();
		}
		this.prevProjectionViewMatrix.copy(this.projectionViewMatrix);
	}

	render(postprocessing, toScreen = false) {
		this.material.uniforms.u_amount.value = this.amount;
		this.material.uniforms.u_rgbShift.value = this.rgbShift;
		this.material.uniforms.u_multiplier.value = this.multiplier;
		this.material.uniforms.u_shade.value = this.shade;
		super.render(postprocessing, toScreen);
	}
}
