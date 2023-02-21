import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';
import blueNoise from '@effects/blueNoise/blueNoise';

import fragmentShader from './cameraMotionBlur.frag';

export default class Final extends PostEffect {
	needsSync = true;
	amount = 1;

	_position = null;
	_quaternion = null;
	_scale = null;

	_v1 = null;
	_q = null;
	_v2 = null;

	projectionMatrix = null;
	prevProjectionMatrix = null;

	projectionViewMatrix = null;
	prevProjectionViewMatrix = null;
	projectionViewInverseMatrix = null;

	init(cfg) {
		Object.assign(this, cfg);
		super.init();

		this._position = new THREE.Vector3();
		this._quaternion = new THREE.Quaternion();
		this._scale = new THREE.Vector3(1, 1, 1);

		this._v1 = new THREE.Vector3();
		this._q = new THREE.Quaternion();
		this._v2 = new THREE.Vector3();

		this.projectionViewMatrix = new THREE.Matrix4();
		this.prevProjectionViewMatrix = new THREE.Matrix4();
		this.projectionViewInverseMatrix = new THREE.Matrix4();

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: Object.assign(
				{
					u_texture: { value: null },
					u_depthTexture: { value: null },
					u_amount: { value: 1 },
					u_projectionViewInverseMatrix: { value: this.projectionViewInverseMatrix },
					u_prevProjectionViewMatrix: { value: this.prevProjectionViewMatrix },
				},
				blueNoise.sharedUniforms,
			),
			fragmentShader: fragmentShader,
		});
	}

	needsRender(postprocessing) {
		let needsRender = this.amount > 0;
		this.needsSync = !needsRender;
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
		let camera = postprocessing.camera;

		this.material.uniforms.u_depthTexture = postprocessing.sharedUniforms.u_sceneDepthTexture;
		this.material.uniforms.u_amount.value = this.amount;

		if (this.needsSync || postprocessing.hasSizeChanged) {
			this.syncCamera(camera);
			this.needsSync = false;
		} else {
			this.prevProjectionViewMatrix.copy(this.projectionViewMatrix);
		}

		this.projectionViewMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		this.projectionViewInverseMatrix.copy(this.projectionViewMatrix).invert();

		super.render(postprocessing, toScreen);
	}
}
