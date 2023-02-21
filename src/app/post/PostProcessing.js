import * as THREE from 'three';
import MinSignal from 'min-signal';

import fboHelper from '@helpers/fboHelper';

let _geom;

export class Postprocessing {
	width = 1;
	height = 1;
	scene = null;
	camera = null;
	resolution = new THREE.Vector2(0, 0);
	texelSize = new THREE.Vector2(0, 0);
	aspect = new THREE.Vector2(1, 1);

	onBeforeSceneRendered = new MinSignal();
	onAfterSceneRendered = new MinSignal();
	onAfterRendered = new MinSignal();

	sceneRenderTarget = null;
	fromRenderTarget = null;
	toRenderTarget = null;

	useDepthTexture = true;
	depthTexture = null;
	fromTexture = null;
	toTexture = null;
	sceneTexture = null;
	mesh = null;
	queue = [];
	sharedUniforms = {};
	geom;
	hasSizeChanged = true;

	init(cfg) {
		Object.assign(this, cfg);

		if (!_geom) {
			this.geom = _geom = new THREE.BufferGeometry();
			this.geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]), 3));
			this.geom.setAttribute('a_uvClamp', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]), 4));
		} else {
			this.geom = _geom;
		}

		this.sceneRenderTarget = fboHelper.createMultisampleRenderTarget(1, 1);
		this.sceneRenderTarget.depthBuffer = true;

		this.fromRenderTarget = fboHelper.createRenderTarget(1, 1);
		this.toRenderTarget = this.fromRenderTarget.clone();

		this.useDepthTexture = !!this.useDepthTexture && fboHelper.renderer && (fboHelper.renderer.capabilities.isWebGL2 || fboHelper.renderer.extensions.get('WEBGL_depth_texture'));

		this.fromTexture = this.fromRenderTarget.texture;
		this.toTexture = this.toRenderTarget.texture;

		this.sceneTexture = this.sceneRenderTarget.texture;
		this.mesh = new THREE.Mesh();

		this.sharedUniforms = Object.assign(this.sharedUniforms, {
			u_sceneTexture: { value: this.sceneRenderTarget.texture },
			u_fromTexture: { value: null },
			u_toTexture: { value: null },
			u_sceneDepthTexture: { value: null },
			u_cameraNear: { value: 0 },
			u_cameraFar: { value: 1 },
			u_cameraFovRad: { value: 1 },
			u_resolution: { value: this.resolution },
			u_texelSize: { value: this.texelSize },
			u_aspect: { value: this.aspect },
		});

		if (this.useDepthTexture && fboHelper.renderer) {
			const depthTexture = new THREE.DepthTexture(this.resolution.width, this.resolution.height);
			if (fboHelper.renderer.capabilities.isWebGL2) {
				// depthTexture.type = THREE.FloatType;
				depthTexture.type = THREE.UnsignedIntType;
				// depthTexture.type = THREE.UnsignedInt248Type;
			} else {
				depthTexture.format = THREE.DepthStencilFormat;
				depthTexture.type = THREE.UnsignedInt248Type;
			}
			depthTexture.minFilter = THREE.NearestFilter;
			depthTexture.magFilter = THREE.NearestFilter;

			this.sceneRenderTarget.depthTexture = depthTexture;
			this.depthTexture = this.sharedUniforms.u_sceneDepthTexture.value = depthTexture;
		}
	}

	swap() {
		const tmp = this.fromRenderTarget;
		this.fromRenderTarget = this.toRenderTarget;
		this.toRenderTarget = tmp;
		this.fromTexture = this.fromRenderTarget.texture;
		this.toTexture = this.toRenderTarget.texture;

		this.sharedUniforms.u_fromTexture.value = this.fromTexture;
		this.sharedUniforms.u_toTexture.value = this.toTexture;
	}

	setSize(width, height) {
		if (this.width !== width || this.height !== height) {
			this.hasSizeChanged = true;
			this.width = width;
			this.height = height;
			this.resolution.set(width, height);
			this.texelSize.set(1 / width, 1 / height);

			const aspectScalar = (height / Math.sqrt(width * width + height * height)) * 2;
			this.aspect.set((width / height) * aspectScalar, aspectScalar);

			this.sceneRenderTarget.setSize(width, height);
			this.fromRenderTarget.setSize(width, height);
			this.toRenderTarget.setSize(width, height);
		}
	}

	dispose() {
		if (this.fromRenderTarget) {
			this.fromRenderTarget.dispose();
		}
		if (this.toRenderTarget) {
			this.toRenderTarget.dispose();
		}
		if (this.sceneRenderTarget) {
			this.sceneRenderTarget.dispose();
		}
	}

	_filterQueue(postEffect) {
		return postEffect.enabled && postEffect.needsRender();
	}

	renderMaterial(material, renderTarget) {
		this.mesh.material = material;
		fboHelper.renderMesh(this.mesh, renderTarget);
	}

	render(scene, camera, toScreen) {
		if (!fboHelper.renderer) return;

		this.scene = scene;
		this.camera = camera;
		this.mesh.geometry = this.geom;
		const renderableQueue = this.queue.filter(this._filterQueue);
		const sharedUniforms = this.sharedUniforms;

		renderableQueue.sort((a, b) => (a.renderOrder == b.renderOrder ? 0 : a.renderOrder - b.renderOrder));

		sharedUniforms.u_sceneTexture.value = this.sceneRenderTarget.texture;

		sharedUniforms.u_cameraNear.value = camera.near;
		sharedUniforms.u_cameraFar.value = camera.far;
		sharedUniforms.u_cameraFovRad.value = (camera.fov / 180) * Math.PI;

		this.onBeforeSceneRendered.dispatch();

		if (renderableQueue.length) {
			fboHelper.renderer.setRenderTarget(this.sceneRenderTarget);
			fboHelper.renderer.render(scene, camera);
			fboHelper.renderer.setRenderTarget(null);
			fboHelper.copy(this.sceneRenderTarget.texture, this.fromRenderTarget);

			this.onAfterSceneRendered.dispatch(this.sceneRenderTarget);
			const state = fboHelper.getColorState();
			fboHelper.renderer.autoClear = false;
			for (let i = 0, len = renderableQueue.length; i < len; i++) {
				const isToScreen = i === len - 1 && toScreen;
				const postEffect = renderableQueue[i];
				postEffect.setPostprocessing(this);
				postEffect.render(this, isToScreen);
			}
			fboHelper.setColorState(state);
		} else {
			fboHelper.renderer.render(scene, camera);
			this.onAfterSceneRendered.dispatch();
		}
		this.onAfterRendered.dispatch();
		this.hasSizeChanged = false;
	}
}
