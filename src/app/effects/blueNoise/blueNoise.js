import properties from '@core/properties';
import settings from '@core/settings';
import shaderHelper from '@helpers/shaderHelper';

import getBlueNoiseShader from './getBlueNoise.glsl';

import * as THREE from 'three';

class BlueNoise {
	sharedUniforms = {
		u_blueNoiseTexture: { value: null },
		u_blueNoiseLinearTexture: { value: null },
		u_blueNoiseTexelSize: { value: null },
		u_blueNoiseCoordOffset: { value: new THREE.Vector2() },
	};
	TEXTURE_SIZE = 128;

	preInit() {
		let linearTexture = new THREE.Texture();

		linearTexture.generateMipmaps = false;
		linearTexture.minFilter = linearTexture.magFilter = THREE.LinearFilter;
		linearTexture.wrapS = linearTexture.wrapT = THREE.RepeatWrapping;

		let texture = new THREE.Texture(
			properties.loader.add(settings.TEXTURE_PATH + 'LDR_RGB1_0.png', {
				weight: 55,
				onLoad: function () {
					texture.needsUpdate = true;
					linearTexture.needsUpdate = true;
				},
			}).content,
		);
		linearTexture.image = texture.image;

		texture.generateMipmaps = false;
		texture.minFilter = texture.magFilter = THREE.NearestFilter;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		this.sharedUniforms.u_blueNoiseTexture.value = texture;
		this.sharedUniforms.u_blueNoiseLinearTexture.value = linearTexture;
		this.sharedUniforms.u_blueNoiseTexelSize.value = new THREE.Vector2(1 / this.TEXTURE_SIZE, 1 / this.TEXTURE_SIZE);

		shaderHelper.addChunk('getBlueNoise', getBlueNoiseShader);
	}

	update(dt) {
		this.sharedUniforms.u_blueNoiseCoordOffset.value.set(Math.random(), Math.random());
	}
}

export default new BlueNoise();
