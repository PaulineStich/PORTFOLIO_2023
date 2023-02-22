import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import blitVert from '@glsl/blit.vert';
import blitFrag from '@glsl/blit.frag';

export default class PostEffect {
	sharedUniforms = {};
	enabled = true;
	material = null;
	_hasShownWarning = false;

	init(cfg) {
		Object.assign(this, cfg);
	}

	needsRender() {
		return true;
	}

	warn(message) {
		if (!this._hasShownWarning) {
			console.warn(message);
			this._hasShownWarning = true;
		}
	}

	setPostprocessing(postprocessing) {}

	render(postprocessing, toScreen = false) {
		if (this.material.uniforms.u_texture) this.material.uniforms.u_texture.value = postprocessing.fromTexture;
		fboHelper.render(this.material, toScreen ? null : postprocessing.toRenderTarget);
		postprocessing.swap();
	}
}
