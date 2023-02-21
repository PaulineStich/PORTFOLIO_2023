import * as THREE from 'three';

import channelMixerFrag from './glsl/channelMixer.frag';
import fboHelper from './fboHelper';

export class TextureHelper {
	blackTexture;
	whiteTexture;
	transparentTexture;
	channelMixerMaterial;

	init() {
		this.blackTexture = this._createPixelTexture([0, 0, 0, 255]);
		this.whiteTexture = this._createPixelTexture([255, 255, 255, 255]);
		this.transparentTexture = this._createPixelTexture([0, 0, 0, 0]);
	}

	_createPixelTexture(arr) {
		const dataTexture = fboHelper.createDataTexture(new Uint8Array(arr), 1, 1, false, true);
		return dataTexture;
	}

	mixChannels(texture, renderTarget, r = -1, g = -1, b = -1, a = -1) {
		if (!this.channelMixerMaterial) {
			this.channelMixerMaterial = new THREE.RawShaderMaterial({
				uniforms: {
					u_texture: { value: null },
					u_channelMixerR: { value: new THREE.Vector4() },
					u_channelMixerG: { value: new THREE.Vector4() },
					u_channelMixerB: { value: new THREE.Vector4() },
					u_channelMixerA: { value: new THREE.Vector4() },
				},
				vertexShader: fboHelper.vertexShader,
				fragmentShader: fboHelper.precisionPrefix + channelMixerFrag,

				blending: THREE.CustomBlending,
				blendEquation: THREE.AddEquation,
				blendDst: THREE.OneFactor,
				blendSrc: THREE.OneFactor,
				blendEquationAlpha: THREE.AddEquation,
				blendDstAlpha: THREE.OneFactor,
				blendSrcAlpha: THREE.OneFactor,
			});
		}
		this.channelMixerMaterial.uniforms.u_texture.value = texture;
		this.channelMixerMaterial.uniforms.u_channelMixerR.value.set(+(r % 4 == 0), +(r % 4 == 1), +(r % 4 == 2), +(r % 4 == 3)).multiplyScalar(r < 0 ? 0 : 1);
		this.channelMixerMaterial.uniforms.u_channelMixerG.value.set(+(g % 4 == 0), +(g % 4 == 1), +(g % 4 == 2), +(g % 4 == 3)).multiplyScalar(g < 0 ? 0 : 1);
		this.channelMixerMaterial.uniforms.u_channelMixerB.value.set(+(b % 4 == 0), +(b % 4 == 1), +(b % 4 == 2), +(b % 4 == 3)).multiplyScalar(b < 0 ? 0 : 1);
		this.channelMixerMaterial.uniforms.u_channelMixerA.value.set(+(a % 4 == 0), +(a % 4 == 1), +(a % 4 == 2), +(a % 4 == 3)).multiplyScalar(a < 0 ? 0 : 1);

		let state = fboHelper.getColorState();
		fboHelper.renderer.autoClear = false;
		fboHelper.render(this.channelMixerMaterial, renderTarget);
		fboHelper.setColorState(state);
	}
}

export default new TextureHelper();
