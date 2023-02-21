import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';
import properties from '@app/core/properties';

class Ufx extends PostEffect {
	scene;
	camera = new THREE.PerspectiveCamera(60, 1);
	frameIdx = -1;

	sharedUniforms = {
		u_fromTexture: { value: null },
	};

	init() {
		this.scene = new THREE.Scene();
	}

	setPostprocessing(postprocessing) {
		let camera = this.camera;
		let width = properties.viewportWidth;
		let height = properties.viewportHeight;

		camera.position.set(width / 2, -height / 2, height / (2 * Math.tan((camera.fov * Math.PI) / 360)));
		camera.aspect = width / height;
		camera.far = camera.position.z * 2;
		camera.near = camera.far / 1000;
		camera.updateProjectionMatrix();
	}

	render(postprocessing, toScreen = false) {
		let state = fboHelper.getColorState();
		let renderer = properties.renderer;
		fboHelper.copy(postprocessing.fromTexture, postprocessing.sceneRenderTarget);
		renderer.setRenderTarget(postprocessing.sceneRenderTarget);
		fboHelper.renderer.autoClear = false;
		fboHelper.renderer.autoClearColor = false;
		fboHelper.renderer.autoClearStencil = true;
		fboHelper.renderer.autoClearDepth = true;
		fboHelper.renderer.clear(false, true, true);
		renderer.render(this.scene, this.camera);
		renderer.setRenderTarget(null);

		let target = toScreen ? null : postprocessing.toRenderTarget;
		fboHelper.copy(postprocessing.sceneTexture, target);
		renderer.setRenderTarget(target);

		fboHelper.setColorState(state);

		// window.__debugTexture = postprocessing.fromTexture;
		postprocessing.swap();
	}
}

export default new Ufx();
