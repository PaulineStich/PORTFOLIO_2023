import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';

import gtaoViewPositionDepthShader from './gtaoViewPositionDepth.frag';
import gtaoNormalShader from './gtaoNormal.frag';
import gtaoComputeShader from './gtaoCompute.frag';
import gtaoFragmentShader from './gtao.frag';

import gtaoUberVertexShader from './gtaoUber.vert';
import gtaoUberFragmentShader from './gtaoUber.frag';

import blueNoise from '@effects/blueNoise/blueNoise';
import blur from '@effects/blur/blur';

import blitVert from '@glsl/blit.vert';

export default class Gtao extends PostEffect {
	viewPositionDepthRenderTarget = null;

	normalRenderTarget = null;

	generateViewPositionFromDepthTexture = false;
	generateNormalFromDepthTexture = false;

	uberViewPositionDepthMaterial = null;
	uberNormalMaterial = null;
	_cacheList = [];
	_bypassList = [];
	_c = new THREE.Color();

	amount = 1;
	resScale = 1;
	falloffStart = 0.1;
	falloffEnd = 1;
	radius = 0.5;
	indirectLightIntensity = 1;
	aoIntensity = 1;
	directionOffset = 0;
	stepOffset = 0;

	angularSamples = 4;
	_prevAngularSamples = -1;

	stepSamples = 2;
	_prevStepSamples = -1;

	useDepthAwareBlur = true;
	_prevUseDepthAwareBlur = null;

	sharedUniforms = {
		u_projectionMatrix: { value: new THREE.Matrix4() },
		u_projectionMatrixInverse: { value: new THREE.Matrix4() },

		u_texture: { value: null },
		u_viewPositionDepthTexture: { value: null },
		u_normalTexture: { value: null },
		u_colorBounceAoTexture: { value: null },
		u_scaledTextureSize: { value: new THREE.Vector2() },
		u_projInfo: { value: new THREE.Vector4() },
		u_clipInfo: { value: new THREE.Vector4() },

		u_falloffStart: { value: 0 },
		u_falloffEnd: { value: 0 },
		u_radius: { value: 1 },
		u_directionOffset: { value: 1 },
		u_stepOffset: { value: 1 },
		u_aoIntensity: { value: 0 },
		u_indirectLightIntensity: { value: 0 },
	};

	init(cfg) {
		Object.assign(this, cfg);
		super.init();

		// if no viewPositionDepthRenderTarget provided, assuming it is webgl2 and it will pick up the depthBuffer and generate the renderTarget
		this.viewPositionDepthRenderTarget = fboHelper.createRenderTarget(1, 1, true, true);
		this.viewPositionDepthRenderTarget.depthBuffer = true;
		this.sharedUniforms.u_viewPositionDepthTexture.value = this.viewPositionDepthRenderTarget.texture;

		// if no normalRenderTarget provided, it will calculate the normal based on the linear depth
		this.normalRenderTarget = fboHelper.createRenderTarget(1, 1, true);
		this.normalRenderTarget.depthBuffer = true;
		this.sharedUniforms.u_normalTexture.value = this.normalRenderTarget.texture;

		this.colorBounceAoRenderTarget = fboHelper.createRenderTarget(1, 1, true);
		this.sharedUniforms.u_colorBounceAoTexture.value = this.colorBounceAoRenderTarget.texture;

		this.blurRenderTarget = fboHelper.createRenderTarget(1, 1);

		this.uberViewPositionDepthMaterial = new THREE.ShaderMaterial({
			vertexShader: gtaoUberVertexShader,
			fragmentShader: gtaoUberFragmentShader,
		});
		this.uberNormalMaterial = new THREE.ShaderMaterial({
			vertexShader: gtaoUberVertexShader,
			fragmentShader: gtaoUberFragmentShader,
		});
		this.uberNormalMaterial.defines.RENDER_NORMAL = true;

		this.viewPositionDepthMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_depthTexture: null,
				u_projInfo: this.sharedUniforms.u_projInfo,
				u_clipInfo: this.sharedUniforms.u_clipInfo,
				u_scaledTextureSize: this.sharedUniforms.u_scaledTextureSize,
				u_projectionMatrix: this.sharedUniforms.u_projectionMatrix,
				u_projectionMatrixInverse: this.sharedUniforms.u_projectionMatrixInverse,
			},
			fragmentShader: gtaoViewPositionDepthShader,
		});

		this.normalMaterial = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_scaledTextureSize: this.sharedUniforms.u_scaledTextureSize,
				u_viewPositionDepthTexture: this.sharedUniforms.u_viewPositionDepthTexture,
			},
			vertexShaderPrefix: fboHelper.vertexPrefix,
			fragmentShaderPrefix: fboHelper.fragmentPrefix,
			vertexShader: blitVert,
			fragmentShader: gtaoNormalShader,
		});
		this.normalMaterial.extensions.derivatives = true;

		this.computeMaterial = fboHelper.createRawShaderMaterial({
			uniforms: Object.assign(
				{
					u_texture: this.sharedUniforms.u_texture,
					u_viewPositionDepthTexture: this.sharedUniforms.u_viewPositionDepthTexture,
					u_normalTexture: this.sharedUniforms.u_normalTexture,

					u_falloffStart: this.sharedUniforms.u_falloffStart,
					u_falloffEnd: this.sharedUniforms.u_falloffEnd,
					u_radius: this.sharedUniforms.u_radius,

					u_scaledTextureSize: this.sharedUniforms.u_scaledTextureSize,
					u_clipInfo: this.sharedUniforms.u_clipInfo,
					u_directionOffset: this.sharedUniforms.u_directionOffset,
					u_stepOffset: this.sharedUniforms.u_stepOffset,
					u_indirectLightIntensity: this.sharedUniforms.u_indirectLightIntensity,
				},
				blueNoise.sharedUniforms,
			),
			fragmentShader: gtaoComputeShader,
		});

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_depthTexture: null,
				u_resolution: null,
				u_texture: this.sharedUniforms.u_texture,
				u_colorBounceAoTexture: this.sharedUniforms.u_colorBounceAoTexture,
				u_viewPositionDepthTexture: this.sharedUniforms.u_viewPositionDepthTexture,
				u_normalTexture: this.sharedUniforms.u_normalTexture,

				u_scaledTextureSize: this.sharedUniforms.u_scaledTextureSize,
				u_aoIntensity: this.sharedUniforms.u_aoIntensity,
			},
			fragmentShader: gtaoFragmentShader,
		});
	}

	dispose() {
		if (this.rt1) {
			this.rt1.dispose();
		}
		this.rt2.dispose();
		this.rt3.dispose();
	}

	needsRender() {
		return this.amount > 0;
	}

	_renderEverythingWith(postprocessing, material, renderTarget, id) {
		const scene = postprocessing.scene;
		const camera = postprocessing.camera;
		const customMaterialId = '_gtaoCustom' + id;

		for (let i = 0, len = this._cacheList.length; i < len; i++) {
			let obj = this._cacheList[i];
			obj.material = obj.userData[customMaterialId] || material;
		}

		fboHelper.renderer.setRenderTarget(renderTarget);
		fboHelper.renderer.render(scene, camera);
	}

	_cacheAllMeshes(scene) {
		this._cacheList.length = 0;
		this._bypassList.length = 0;
		scene.traverseVisible((obj) => {
			if (obj.material) {
				if (obj.userData._gtaoBypass) {
					this._bypassList.push(obj);
					obj.visible = false;
				} else {
					obj.userData._gtaoMaterialCache = obj.material;
					this._cacheList.push(obj);
				}
			}
		});
	}
	_releaseMeshes() {
		for (let i = 0, len = this._cacheList.length; i < len; i++) {
			let obj = this._cacheList[i];
			obj.material = obj.userData._gtaoMaterialCache;
			delete obj.userData._gtaoMaterialCache;
		}
		for (let i = 0, len = this._bypassList.length; i < len; i++) {
			let obj = this._bypassList[i];
			obj.visible = true;
		}
		this._cacheList.length = 0;
		this._bypassList.length = 0;
	}

	render(postprocessing, toScreen = false) {
		let camera = postprocessing.camera;
		let scaledWidth = Math.floor(postprocessing.width * this.resScale);
		let scaledHeight = Math.floor(postprocessing.height * this.resScale);
		if (this.viewPositionDepthRenderTarget.width !== scaledWidth || this.viewPositionDepthRenderTarget.height !== scaledHeight) {
			this.viewPositionDepthRenderTarget.setSize(scaledWidth, scaledHeight);
			this.normalRenderTarget.setSize(scaledWidth, scaledHeight);
			this.colorBounceAoRenderTarget.setSize(scaledWidth, scaledHeight);
		}

		if (!this.useDepthAwareBlur && (this.blurRenderTarget.width !== scaledWidth || this.blurRenderTarget.height !== scaledHeight)) {
			this.blurRenderTarget.setSize(scaledWidth, scaledHeight);
		}

		const projection = camera.projectionMatrix;
		const fovRadians = (camera.fov / 180) * Math.PI;
		this.sharedUniforms.u_scaledTextureSize.value.set(scaledWidth, scaledHeight);
		this.sharedUniforms.u_projInfo.value.set((2.0 / (scaledWidth * projection.elements[4 * 0 + 0])) * scaledWidth, (2.0 / (scaledHeight * projection.elements[4 * 1 + 1])) * scaledHeight, -1.0 / projection.elements[4 * 0 + 0], -1.0 / projection.elements[4 * 1 + 1]);
		this.sharedUniforms.u_clipInfo.value.set(camera.near, camera.far, 0.5 * (scaledHeight / (2.0 * Math.tan(fovRadians * 0.5))), 0.0);

		this.sharedUniforms.u_projectionMatrix.value.copy(camera.projectionMatrix);
		this.sharedUniforms.u_projectionMatrixInverse.value.copy(camera.projectionMatrix).invert();

		this.sharedUniforms.u_falloffStart.value = this.falloffStart;
		this.sharedUniforms.u_falloffEnd.value = this.falloffEnd;
		this.sharedUniforms.u_radius.value = this.radius;
		this.sharedUniforms.u_indirectLightIntensity.value = this.indirectLightIntensity;
		this.sharedUniforms.u_aoIntensity.value = this.aoIntensity;

		this.sharedUniforms.u_directionOffset.value = this.directionOffset;
		this.sharedUniforms.u_stepOffset.value = this.stepOffset;

		this.material.uniforms.u_depthTexture = postprocessing.sharedUniforms.u_sceneDepthTexture;

		let state = fboHelper.getColorState();
		fboHelper.renderer.autoClear = true;
		fboHelper.renderer.autoClearColor = true;
		fboHelper.renderer.autoClearDepth = true;

		if (!this.generateViewPositionFromDepthTexture || !this.generateNormalFromDepthTexture) {
			this._cacheAllMeshes(postprocessing.scene);
		}

		if (this.generateViewPositionFromDepthTexture) {
			this.viewPositionDepthMaterial.uniforms.u_depthTexture = postprocessing.sharedUniforms.u_sceneDepthTexture;
			fboHelper.render(this.viewPositionDepthMaterial, this.viewPositionDepthRenderTarget);
		} else {
			this._c.set(0xffffff);
			fboHelper.renderer.setClearColor(this._c, 1);
			this._renderEverythingWith(postprocessing, this.uberViewPositionDepthMaterial, this.viewPositionDepthRenderTarget, 'Depth');
		}

		if (this.generateNormalFromDepthTexture) {
			fboHelper.render(this.normalMaterial, this.normalRenderTarget);
		} else {
			this._c.set(0x7f7f7f);
			fboHelper.renderer.setClearColor(this._c, 1);
			this._renderEverythingWith(postprocessing, this.uberNormalMaterial, this.normalRenderTarget, 'Normal');
		}

		if (!this.generateViewPositionFromDepthTexture || !this.generateNormalFromDepthTexture) {
			this._releaseMeshes(postprocessing.scene);
		}
		fboHelper.setColorState(state);

		this.sharedUniforms.u_texture.value = postprocessing.fromTexture;

		if (this.angularSamples !== this._prevAngularSamples || this.stepSamples !== this._prevStepSamples) {
			this._prevAngularSamples = this.angularSamples;
			this._prevStepSamples = this.stepSamples;

			this.computeMaterial.defines.ANGULAR_SAMPLES = this.angularSamples;
			this.computeMaterial.defines.STEP_SAMPLES = this.stepSamples;
			this.computeMaterial.needsUpdate = true;
		}

		fboHelper.render(this.computeMaterial, this.colorBounceAoRenderTarget);

		if (!this.useDepthAwareBlur) {
			blur.blur(2, 1, this.colorBounceAoRenderTarget, this.blurRenderTarget);
		}

		if (this.useDepthAwareBlur !== this._prevUseDepthAwareBlur) {
			this.material.defines.USE_BLUR = !!this.useDepthAwareBlur;
			this.material.needsUpdate = true;
			this._prevUseDepthAwareBlur = this.useDepthAwareBlur;
		}

		this.material.uniforms.u_resolution = postprocessing.sharedUniforms.u_resolution;
		super.render.call(this, postprocessing, toScreen, postprocessing.fromTexture);

		// window.__debugTexture = this.viewPositionDepthRenderTarget.texture;
	}
}
