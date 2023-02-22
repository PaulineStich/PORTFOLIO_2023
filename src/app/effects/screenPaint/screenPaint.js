import properties from '@core/properties';

import input from '@input/input';
import fboHelper from '@helpers/fboHelper';
import frag from '@effects/screenPaint/screenPaint.frag';
import blur from '@effects/blur/blur';
import math from '@utils/math';

import * as THREE from 'three';
import browser from '@app/core/browser';

class ScreenPaint {
	_lowRenderTarget;
	_lowBlurRenderTarget;
	_prevPaintRenderTarget;
	_currPaintRenderTarget;
	_material;
	_distortionMaterial;
	_fromDrawData;
	_toDrawData;

	drawEnabled = true;
	needsMouseDown = false;
	enabled = true;

	minRadius = 0; // in pixel based on the viewport size
	maxRadius = 100; // in pixel based on the viewport size
	radiusDistanceRange = 100; // in pixel
	pushStrength = 25;
	velocityDissipation = 0.985;
	weight1Dissipation = 0.985;
	weight2Dissipation = 0.5;

	useNoise = false;
	curlScale = 0.1;
	curlStrength = 5;
	_prevUseNoise = null;

	sharedUniforms = {
		u_paintTexelSize: { value: new THREE.Vector2() },
		u_prevPaintTexture: { value: null },
		u_currPaintTexture: { value: null },
		u_lowPaintTexture: { value: null },
	};

	init() {
		this._lowRenderTarget = fboHelper.createRenderTarget(1, 1);
		this._lowBlurRenderTarget = fboHelper.createRenderTarget(1, 1);
		this._prevPaintRenderTarget = fboHelper.createRenderTarget(1, 1);
		this._currPaintRenderTarget = fboHelper.createRenderTarget(1, 1);

		this.sharedUniforms.u_lowPaintTexture.value = this._lowRenderTarget.texture;

		this._material = new THREE.RawShaderMaterial({
			uniforms: {
				u_lowPaintTexture: { value: this._lowRenderTarget.texture },
				u_prevPaintTexture: this.sharedUniforms.u_prevPaintTexture,
				u_paintTexelSize: this.sharedUniforms.u_paintTexelSize,
				u_drawFrom: { value: (this._fromDrawData = new THREE.Vector4(0, 0, 0, 0)) }, //X, Y, radius, weight,  pixel based in paintTexture
				u_drawTo: { value: (this._toDrawData = new THREE.Vector4(0, 0, 0, 0)) },
				u_pushStrength: { value: 0 },
				u_curlScale: { value: 0 },
				u_curlStrength: { value: 0 },
				u_dissipations: { value: new THREE.Vector3() },
			},
			vertexShader: fboHelper.vertexShader,
			fragmentShader: fboHelper.precisionPrefix + frag,
		});
	}

	resize(width, height) {
		let paintWidth = width >> 2;
		let paintHeight = height >> 2;
		let lowWidth = width >> 4;
		let lowHeight = height >> 4;

		if (paintWidth !== this._currPaintRenderTarget.width || paintHeight !== this._currPaintRenderTarget.height) {
			this._currPaintRenderTarget.setSize(paintWidth, paintHeight);
			this._prevPaintRenderTarget.setSize(paintWidth, paintHeight);
			this._lowRenderTarget.setSize(lowWidth, lowHeight);
			this._lowBlurRenderTarget.setSize(lowWidth, lowHeight);
			this.sharedUniforms.u_paintTexelSize.value.set(1 / paintWidth, 1 / paintHeight);
			this.clear();
		}
	}

	clear = () => {
		fboHelper.clearColor(0.5, 0.5, 0, 0, this._lowRenderTarget);
		fboHelper.clearColor(0.5, 0.5, 0, 0, this._lowBlurRenderTarget);
		fboHelper.clearColor(0.5, 0.5, 0, 0, this._currPaintRenderTarget);
	};

	update(dt) {
		if (!this.enabled) return;

		if (this.useNoise !== this._prevUseNoise) {
			this._material.defines.USE_NOISE = this.useNoise;
			this._material.needsUpdate = true;
			this._prevUseNoise = this.useNoise;
		}

		let paintWidth = this._currPaintRenderTarget.width;
		let paintHeight = this._currPaintRenderTarget.height;

		let tmp = this._prevPaintRenderTarget;
		this._prevPaintRenderTarget = this._currPaintRenderTarget;
		this._currPaintRenderTarget = tmp;

		this.sharedUniforms.u_prevPaintTexture.value = this._prevPaintRenderTarget.texture;
		this.sharedUniforms.u_currPaintTexture.value = this._currPaintRenderTarget.texture;

		this._material.uniforms.u_drawFrom.value.z = this._material.uniforms.u_drawTo.value.z;

		let dist = input.mousePixelXY.distanceTo(input.prevMousePixelXY);
		let radius = math.fit(dist, 0, this.radiusDistanceRange, this.minRadius, this.maxRadius);

		if (!input.hadMoved || !this.drawEnabled || ((this.needsMouseDown || browser.isMobile) && (!input.isDown || !input.wasDown))) {
			radius = 0;
		}

		radius = (radius / properties.viewportHeight) * paintHeight;

		this._material.uniforms.u_pushStrength.value = this.pushStrength;
		this._material.uniforms.u_curlScale.value = this.curlScale;
		this._material.uniforms.u_curlStrength.value = this.curlStrength;
		this._material.uniforms.u_dissipations.value.set(this.velocityDissipation, this.weight1Dissipation, this.weight2Dissipation);

		this._fromDrawData.copy(this._toDrawData);
		this._toDrawData.set(((input.mouseXY.x + 1) * paintWidth) / 2, ((input.mouseXY.y + 1) * paintHeight) / 2, radius, 1);

		fboHelper.render(this._material, this._currPaintRenderTarget);

		fboHelper.copy(this._currPaintRenderTarget.texture, this._lowRenderTarget);
		blur.blur(4, 1, this._lowRenderTarget, this._lowBlurRenderTarget);
	}
}

export default new ScreenPaint();
