import shaderHelper from '@helpers/shaderHelper';
import * as THREE from 'three';

import shader from './glPositionOffset.glsl';

class GlPositionOffset {
	offset = new THREE.Vector2();
	sharedUniforms = {
		u_glPositionOffset: { value: null },
	};

	init() {
		this.sharedUniforms.u_glPositionOffset.value = this.offset;
		shaderHelper.addChunk('glPositionOffset', shader);
	}
	setOffset(x, y) {
		return this.offset.set(x, y);
	}
}

export default new GlPositionOffset();
