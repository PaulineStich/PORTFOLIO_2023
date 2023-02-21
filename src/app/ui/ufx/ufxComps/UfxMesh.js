import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import scrollManager from '@app/scroll/scrollManager';
import ufxVert from './ufxVert.glsl';
import quadVert from './ufxQuad.vert';
import quadFrag from './ufxQuad.frag';
import properties from '@app/core/properties';

THREE.ShaderChunk.ufxVert = ufxVert;

let _v1 = new THREE.Vector3();
let _v2 = new THREE.Vector3();
let _m = new THREE.Matrix4();

class UfxMesh extends THREE.Mesh {
	pivot = new THREE.Vector2();

	paddingL = 0;
	paddingR = 0;
	paddingT = 0;
	paddingB = 0;

	refDom;
	requireBg;
	tick = 0;

	_domX = 0;
	_domY = 0;
	_domWidth = 0;
	_domHeight = 0;
	_capturedOffsetY = 0;

	constructor(cfg = {}) {
		let geometry = cfg.geometry || new THREE.PlaneGeometry(1, 1, cfg.segX || 1, cfg.segY || 1).translate(0.5, 0.5, 0); // position x y is expected to be in 0 to 1 for quad geometry
		super(geometry, cfg.material);

		this.refDom = cfg.refDom;
		this.pivot = cfg.pivot || new THREE.Vector2(0.5, 0.5); // like transform origin in percentage
		this.matrixAutoUpdate = false;
		this.frustumCulled = false;

		this.requireBg = cfg.requireBg === true; // fullscreen cache at the moment. TODO make it more flexible
		this.paddingL = cfg.paddingL || 50;
		this.paddingR = cfg.paddingR || 0;
		this.paddingT = cfg.paddingT || 0;
		this.paddingB = cfg.paddingB || 0;

		this._initMaterial(cfg);

		this.onBeforeRender = this._onBeforeRender.bind(this);
	}

	_onBeforeRender() {
		if (this.requireBg) {
			let renderer = fboHelper.renderer;
			let currentRenderTarget = renderer.getRenderTarget();
			fboHelper.clearMultisampleRenderTargetState();
			fboHelper.copy(properties.postprocessing.sceneTexture, properties.postprocessing.fromRenderTarget);
			renderer.setRenderTarget(currentRenderTarget);
		}
	}

	_initMaterial(cfg) {
		if (this.material != cfg.material) {
			this.material = new THREE.ShaderMaterial({
				uniforms: cfg.uniforms || {},
				vertexShader: cfg.vert || quadVert,
				fragmentShader: cfg.frag || quadFrag,
			});
		}

		this.material.side = THREE.DoubleSide;
		this.material.transparent = true;
		this.material.extensions.derivatives = true;
		let uniforms = this.material.uniforms;

		if (uniforms) {
			uniforms.u_position = { value: this.position };
			uniforms.u_quaternion = { value: this.quaternion };
			uniforms.u_scale = { value: this.scale };
			uniforms.u_domXY = { value: new THREE.Vector2() };
			uniforms.u_domWH = { value: new THREE.Vector2() };
			uniforms.u_domPivot = { value: new THREE.Vector2() };
			uniforms.u_domPadding = { value: new THREE.Vector4() };

			uniforms.u_bgTexture = properties.postprocessing.sharedUniforms.u_fromTexture;
			uniforms.u_resolution = properties.postprocessing.sharedUniforms.u_resolution;
			uniforms.u_viewportResolution = properties.sharedUniforms.u_viewportResolution;
		}
	}

	// trigger this when the viewport is resized or the dom placement has changed
	// make sure the dom is in the body and display is not none before calling this
	// otherwise `getBoundingClientRect` will return 0
	syncDom(offsetY = 0) {
		if (this.refDom) {
			let refDomRect = this.refDom.getBoundingClientRect();
			this._domX = refDomRect.left;
			this._domY = refDomRect.top;
			this._domWidth = Math.ceil(refDomRect.width);
			this._domHeight = Math.ceil(refDomRect.height);

			this.material.uniforms.u_domWH.value.set(this._domWidth, this._domHeight);
		}
		this._capturedOffsetY = offsetY;
	}

	update(offsetY = 0) {
		let uniforms = this.material.uniforms;
		if (this.refDom) {
			uniforms.u_domXY.value.set(this._domX, this._domY - this._capturedOffsetY + offsetY);
			uniforms.u_domPivot.value.set(this._domWidth * this.pivot.x, this._domHeight * this.pivot.y);
			uniforms.u_domPadding.value.set(this.paddingL, this.paddingR, this.paddingT, this.paddingB);
		}

		this.tick++;
	}
}

export default UfxMesh;
