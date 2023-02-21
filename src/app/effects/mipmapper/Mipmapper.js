import fboHelper from '@helpers/fboHelper';
import shaderHelper from '@helpers/shaderHelper';
import math from '@utils/math';

import lodMipmapSampleShader from './lodMipmapSample.glsl';
import textureBicubicShader from '@glsl/textureBicubic.glsl';

import * as THREE from 'three';

const MAX_LEVEL = 14; // 2 ^ 14 = 16384

export default class Mipmapper {
	tmpRenderTarget = null;
	fixedMaxMipmapLevel = 14;
	maxMipmapLevel = 0;
	textureSize = new THREE.Vector2();
	levelCount = MAX_LEVEL + 1;

	init(cfg) {
		Object.assign(this, cfg);

		// common use case
		shaderHelper.addChunk('textureBicubic', textureBicubicShader);

		this.tmpRenderTarget = fboHelper.createRenderTarget(1, 1);

		if (!THREE.ShaderChunk.lodMipmapSample) {
			shaderHelper.addChunk('lodMipmapSample', lodMipmapSampleShader);
		}

		this.geometry = this._createGeometry(this.levelCount);
		this.oddGeometry = this._createGeometry(this.levelCount);
	}

	_createGeometry(levelCount) {
		let uvs = new Float32Array(levelCount * 6 * 2);
		let positions = new Float32Array(levelCount * 6 * 3);
		let geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		return geometry;
	}

	resize(width, height, textureWidth, textureHeight) {
		let maxMipmapLevel = math.powerTwoFloorBase(height);
		this.maxMipmapLevel = Math.min(maxMipmapLevel, this.fixedMaxMipmapLevel);

		this.tmpRenderTarget.setSize(textureWidth, textureHeight);
		this.textureSize.set(textureWidth, textureHeight);

		let positions = this.geometry.attributes.position.array;
		let uvs = this.geometry.attributes.uv.array;

		let i12 = 0;
		for (let i = 0, len = maxMipmapLevel; i < len; i++) {
			let x = (i > 0 ? width : 0) / textureWidth;
			let y = (textureHeight - (textureHeight >> Math.max(0, i - 1))) / textureHeight;
			let w = Math.max(1, width >> i) / textureWidth;
			let h = Math.max(1, height >> i) / textureHeight;
			uvs[i12 + 0] = x;
			uvs[i12 + 1] = y + h;
			uvs[i12 + 2] = x;
			uvs[i12 + 3] = y;
			uvs[i12 + 4] = x + w;
			uvs[i12 + 5] = y + h;
			uvs[i12 + 6] = x + w;
			uvs[i12 + 7] = y + h;
			uvs[i12 + 8] = x;
			uvs[i12 + 9] = y;
			uvs[i12 + 10] = x + w;
			uvs[i12 + 11] = y;
			i12 += 12;
		}

		let oddFromUvs = this.oddGeometry.attributes.uv.array;
		let oddPositions = this.oddGeometry.attributes.position.array;
		i12 = 0;
		let i18 = 0;
		let halfi12 = 0;
		let halfi18 = 0;
		for (let i = 0, len = maxMipmapLevel - 1; i < len; i++) {
			positions[i18 + 0] = uvs[i12 + 12] * 2 - 1;
			positions[i18 + 1] = uvs[i12 + 13] * 2 - 1;
			positions[i18 + 3] = uvs[i12 + 14] * 2 - 1;
			positions[i18 + 4] = uvs[i12 + 15] * 2 - 1;
			positions[i18 + 6] = uvs[i12 + 16] * 2 - 1;
			positions[i18 + 7] = uvs[i12 + 17] * 2 - 1;
			positions[i18 + 9] = uvs[i12 + 18] * 2 - 1;
			positions[i18 + 10] = uvs[i12 + 19] * 2 - 1;
			positions[i18 + 12] = uvs[i12 + 20] * 2 - 1;
			positions[i18 + 13] = uvs[i12 + 21] * 2 - 1;
			positions[i18 + 15] = uvs[i12 + 22] * 2 - 1;
			positions[i18 + 16] = uvs[i12 + 23] * 2 - 1;

			if ((i + 1) % 2) {
				oddPositions[halfi18 + 0] = (oddFromUvs[halfi12 + 0] = uvs[i12 + 12]) * 2 - 1;
				oddPositions[halfi18 + 1] = (oddFromUvs[halfi12 + 1] = uvs[i12 + 13]) * 2 - 1;
				oddPositions[halfi18 + 3] = (oddFromUvs[halfi12 + 2] = uvs[i12 + 14]) * 2 - 1;
				oddPositions[halfi18 + 4] = (oddFromUvs[halfi12 + 3] = uvs[i12 + 15]) * 2 - 1;
				oddPositions[halfi18 + 6] = (oddFromUvs[halfi12 + 4] = uvs[i12 + 16]) * 2 - 1;
				oddPositions[halfi18 + 7] = (oddFromUvs[halfi12 + 5] = uvs[i12 + 17]) * 2 - 1;
				oddPositions[halfi18 + 9] = (oddFromUvs[halfi12 + 6] = uvs[i12 + 18]) * 2 - 1;
				oddPositions[halfi18 + 10] = (oddFromUvs[halfi12 + 7] = uvs[i12 + 19]) * 2 - 1;
				oddPositions[halfi18 + 12] = (oddFromUvs[halfi12 + 8] = uvs[i12 + 20]) * 2 - 1;
				oddPositions[halfi18 + 13] = (oddFromUvs[halfi12 + 9] = uvs[i12 + 21]) * 2 - 1;
				oddPositions[halfi18 + 15] = (oddFromUvs[halfi12 + 10] = uvs[i12 + 22]) * 2 - 1;
				oddPositions[halfi18 + 16] = (oddFromUvs[halfi12 + 11] = uvs[i12 + 23]) * 2 - 1;
				halfi12 += 12;
				halfi18 += 18;
			}

			i12 += 12;
			i18 += 18;
		}

		this.geometry.attributes.uv.needsUpdate = true;
		this.geometry.attributes.position.needsUpdate = true;
		this.oddGeometry.attributes.uv.needsUpdate = true;
		this.oddGeometry.attributes.position.needsUpdate = true;
	}

	render(rt) {
		let colorState = fboHelper.getColorState();
		let mat = fboHelper.uvCopyMaterial;

		if (this.textureSize.x != rt.width || this.textureSize.y != rt.height) {
			rt.setSize(rt.width, rt.height);
			this.resize(Math.round((rt.width / 3) * 2), rt.height, rt.width, rt.height);
		}

		fboHelper.renderer.autoClear = false;
		let from = rt;
		let to = this.tmpRenderTarget;
		let oddCount = 0;
		for (let i = 0, len = this.maxMipmapLevel - 1; i < len; i++) {
			mat.uniforms.u_texture.value = from.texture;
			this.geometry.drawRange.start = 6 * i;
			this.geometry.drawRange.count = 6;
			fboHelper.renderGeometry(this.geometry, mat, to);

			if (to === this.tmpRenderTarget) {
				oddCount++;
			}
			// swap
			let tmp = to;
			to = from;
			from = tmp;
		}

		this.oddGeometry.drawRange.start = 0;
		this.oddGeometry.drawRange.count = 6 * oddCount;

		mat.uniforms.u_texture.value = this.tmpRenderTarget.texture;
		fboHelper.renderGeometry(this.oddGeometry, mat, rt);

		fboHelper.setColorState(colorState);
	}
}
