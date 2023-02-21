import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import fboHelper from '@helpers/fboHelper';
import Mipmapper from '@effects/mipmapper/Mipmapper';

import math from '@utils/math';

import floorVertexShader from './floor.vert';
import floorFragmentShader from './floor.frag';

import * as THREE from 'three';

class Floor {
	container = new THREE.Object3D();

	material = null;
	mipmapper = null;
	textureSize = null;

	renderTarget = null;

	textureMatrix = null;
	meshTransformMatrix4 = null;
	m4 = null;

	clipBias = null;
	mirrorCamera = null;
	mirrorPlane = null;
	normal = null;
	mirrorWorldPosition = null;
	cameraWorldPosition = null;
	rotationMatrix = null;
	lookAtPosition = null;
	clipPlane = null;

	eye = null;
	view = null;
	target = null;
	q = null;

	infoTexture = null;

	preInit() {
		this.infoTexture = properties.loader.add(settings.TEXTURE_PATH + 'floor.jpg', { type: 'texture', weight: 519 }).content;
		this.infoTexture.wrapS = this.infoTexture.wrapT = THREE.RepeatWrapping;
	}

	init() {
		this.mipmapper = new Mipmapper();
		this.mipmapper.init();
		this.textureSize = new THREE.Vector2();

		this.renderTarget = fboHelper.createRenderTarget(1, 1);
		// this.renderTarget = fboHelper.createMultisampleRenderTarget(1, 1);
		this.renderTarget.depthBuffer = true;

		this.textureMatrix = new THREE.Matrix4();
		this.meshTransformMatrix4 = new THREE.Matrix4();
		this.m4 = new THREE.Matrix4();

		this.clipBias = 0.0;
		this.mirrorCamera = new THREE.PerspectiveCamera();
		this.mirrorPlane = new THREE.Plane();
		this.normal = new THREE.Vector3();
		this.mirrorWorldPosition = new THREE.Vector3();
		this.cameraWorldPosition = new THREE.Vector3();
		this.rotationMatrix = new THREE.Matrix4();
		this.lookAtPosition = new THREE.Vector3();
		this.clipPlane = new THREE.Vector4();

		this.eye = new THREE.Vector3();
		this.view = new THREE.Vector3();
		this.target = new THREE.Vector3();
		this.q = new THREE.Vector4();

		this.geometry = new THREE.PlaneGeometry(50, 50);
		this.geometry.rotateX(Math.PI * -0.5);

		this.mesh = new THREE.Mesh(
			this.geometry,
			(this.material = new THREE.ShaderMaterial({
				uniforms: {
					u_infoTexture: { value: this.infoTexture },
					u_textureMatrix: { value: this.textureMatrix },
					u_textureSize: { value: this.textureSize },
					u_mipmapTextureSize: { value: this.mipmapper.textureSize },
					u_mipmapTexture: { value: this.renderTarget.texture },
					u_mipmapMaxLod: { value: 1 },
					u_randSeed: { value: 0 },
				},
				vertexShader: floorVertexShader,
				fragmentShader: floorFragmentShader,
			})),
		);
		this.mesh.userData.skipReflection = true;

		this.container.add(this.mesh);

		this.mesh.onBeforeRender = this._onBeforeSceneRender.bind(this);
		this.meshTransformMatrix4.makeRotationX(Math.PI * -0.5);
		this.meshTransformMatrix4.premultiply(this.m4);
	}

	resize(width, height) {
		if (!this.textureSize) return;
		let scale = browser.isMobile ? 0.5 : 1;
		width = Math.ceil((width * scale) / 2) * 2;
		height = Math.ceil((height * scale) / 2) * 2;
		width = math.powerTwoFloor(width);
		height = math.powerTwoFloor(height);

		if (properties.renderer.xr.isPresenting) {
			width = Math.ceil(width / 4) * 2;
		}

		this.textureSize.set(width, height);
		this.renderTarget.setSize(this.textureSize.x * 1.5, this.textureSize.y);
		this.mipmapper.resize(this.textureSize.x, this.textureSize.y, this.renderTarget.width, this.renderTarget.height);
		this.mesh.material.uniforms.u_mipmapMaxLod.value = this.mipmapper.maxMipmapLevel;
	}

	update(dt) {
		return;
	}

	// ###########################################

	_onBeforeSceneRender(renderer, scene, camera) {
		if (!this.textureSize || this.material !== this.mesh.material) return;
		if ('recursion' in camera.userData) {
			if (camera.userData.recursion === recursion) return;
			camera.userData.recursion++;
		}

		// this.mirrorWorldPosition.setFromMatrixPosition( mesh.matrixWorld );
		this.mirrorWorldPosition.setFromMatrixPosition(this.meshTransformMatrix4);
		this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

		// this.rotationMatrix.extractRotation( this.mesh.matrixWorld );
		this.rotationMatrix.extractRotation(this.meshTransformMatrix4);
		this.normal.set(0, 0, 1);
		this.normal.applyMatrix4(this.rotationMatrix);

		this.view.subVectors(this.mirrorWorldPosition, this.cameraWorldPosition);

		// Avoid rendering when mirror is facing away

		if (this.view.dot(this.normal) > 0) return;

		this.view.reflect(this.normal).negate();
		this.view.add(this.mirrorWorldPosition);

		this.rotationMatrix.extractRotation(camera.matrixWorld);

		this.lookAtPosition.set(0, 0, -1);
		this.lookAtPosition.applyMatrix4(this.rotationMatrix);
		this.lookAtPosition.add(this.cameraWorldPosition);

		this.target.subVectors(this.mirrorWorldPosition, this.lookAtPosition);
		this.target.reflect(this.normal).negate();
		this.target.add(this.mirrorWorldPosition);

		this.mirrorCamera.position.copy(this.view);
		this.mirrorCamera.up.set(0, 1, 0);
		this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
		this.mirrorCamera.up.reflect(this.normal);
		this.mirrorCamera.lookAt(this.target);

		this.mirrorCamera.near = camera.near; // Used in WebGLBackground
		this.mirrorCamera.far = camera.far; // Used in WebGLBackground

		this.mirrorCamera.updateMatrixWorld();

		this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

		// Update the texture matrix
		this.textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
		this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
		this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);
		this.textureMatrix.multiply(this.mesh.matrixWorld);

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
		this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

		this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

		let projectionMatrix = this.mirrorCamera.projectionMatrix;

		this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
		this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
		this.q.z = -1.0;
		this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

		// Calculate the scaled plane vector
		this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[2] = this.clipPlane.x;
		projectionMatrix.elements[6] = this.clipPlane.y;
		projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
		projectionMatrix.elements[14] = this.clipPlane.w;

		this.eye.setFromMatrixPosition(camera.matrixWorld);

		let currentRenderTarget = renderer.getRenderTarget();
		let currentXrEnabled = renderer.xr.enabled;
		let currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
		renderer.xr.enabled = false; // Avoid camera modification and recursion
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

		renderer.setRenderTarget(this.renderTarget);
		renderer.setViewport(0, 0, this.textureSize.x, this.textureSize.y);

		if (properties.renderer.xr.isPresenting) {
			renderer.setScissor(0, 0, properties.width, properties.height);
			renderer.setScissorTest(false);
		} else {
			renderer.setScissor(0, 0, this.textureSize.x, this.textureSize.y);
			renderer.setScissorTest(true);
		}
		properties.scene.traverse(this._traverseBeforeRender);
		renderer.render(scene, this.mirrorCamera);

		// fboHelper.clearMultisampleRenderTargetState(this.renderTarget);

		renderer.setRenderTarget(null);
		renderer.setViewport(0, 0, properties.width, properties.height);

		if (!properties.renderer.xr.isPresenting) {
			renderer.setScissor(0, 0, properties.width, properties.height);
		}

		this.mipmapper.render(this.renderTarget);

		renderer.xr.enabled = currentXrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		renderer.setRenderTarget(currentRenderTarget);
		renderer.setViewport(0, 0, properties.width, properties.height);
		renderer.setScissorTest(false);

		var viewport = camera.viewport;
		if (viewport !== undefined) {
			renderer.state.viewport(viewport);
		}

		properties.scene.traverse(this._traverseAfterRender);
		this.mesh.material.uniforms.u_randSeed.value = Math.random() * 1000;
	}

	_traverseBeforeRender(obj) {
		if (obj.userData.skipReflection) {
			obj.userData.isVisible = obj.visible;
			obj.visible = false;
		} else {
			if (obj.material && obj.material.uniforms && obj.material.uniforms.u_isReflection) {
				obj.material.uniforms.u_isReflection.value = 1;
			}
		}
	}

	_traverseAfterRender(obj) {
		if (obj.userData.skipReflection) {
			obj.visible = obj.userData.isVisible;
		} else {
			if (obj.material && obj.material.uniforms && obj.material.uniforms.u_isReflection) {
				obj.material.uniforms.u_isReflection.value = 0;
			}
		}
	}
}

export default new Floor();
