import * as THREE from 'three';

import blitVert from '@glsl/blit.vert';
import blitFrag from '@glsl/blit.frag';
import uvBlitVert from '@glsl/uvBlit.vert';
import clearFrag from '@glsl/clear.frag';
import debugVert from '@glsl/debug.vert';

class FboHelper {
	isWebGL2;
	renderer;

	quadGeom;
	triGeom;
	floatType;

	precisionPrefix;
	precisionPrefix2;

	vertexShader;

	_scene;
	_camera;
	_tri;

	copyMaterial;
	uvCopyMaterial;
	clearMaterial;

	_debugScene;
	_debugMesh;
	_debugMaterial;

	init(refRenderer, floatType) {
		this.renderer = refRenderer;
		this.floatType = floatType;
		this.isWebGL2 = this.renderer.capabilities.isWebGL2;
		this._scene = new THREE.Scene();
		this._camera = new THREE.Camera();
		this._camera.position.z = 1;

		this.triGeom = new THREE.BufferGeometry();
		this.triGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]), 3));
		this.quadGeom = new THREE.PlaneGeometry(2, 2);

		this._tri = new THREE.Mesh(this.triGeom);
		this._tri.frustumCulled = false;
		this._scene.add(this._tri);

		this.precisionPrefix = `precision ${this.renderer.capabilities.precision} float;\n`;
		this.precisionPrefix2 = `#version 300 es
			precision ${this.renderer.capabilities.precision} float;
			precision ${this.renderer.capabilities.precision} int;
			#define IS_WEBGL2 true
		`;

		if (this.isWebGL2) {
			this.vertexPrefix = `${this.precisionPrefix2}
				precision mediump sampler2DArray;
				#define attribute in
				#define varying out
				#define texture2D texture
			`;

			this.fragmentPrefix = `${this.precisionPrefix2}
				#define varying in
				out highp vec4 pc_fragColor;
				#define gl_FragColor pc_fragColor
				#define gl_FragDepthEXT gl_FragDepth
				#define texture2D texture
				#define textureCube texture
				#define texture2DProj textureProj
				#define texture2DLodEXT textureLod
				#define texture2DProjLodEXT textureProjLod
				#define textureCubeLodEXT textureLod
				#define texture2DGradEXT textureGrad
				#define texture2DProjGradEXT textureProjGrad
				#define textureCubeGradEXT textureGrad
			`;
		} else {
			this.vertexPrefix = this.precisionPrefix;
			this.fragmentPrefix = this.precisionPrefix;
		}

		this.renderer.getContext().getExtension('OES_standard_derivatives');

		this.vertexShader = this.precisionPrefix + blitVert;

		this.copyMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.precisionPrefix + blitFrag,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});

		this.uvCopyMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
			},
			vertexShader: this.precisionPrefix + uvBlitVert,
			fragmentShader: this.precisionPrefix + blitFrag,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});

		this.clearMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_color: { value: new THREE.Vector4(1, 1, 1, 1) },
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.precisionPrefix + clearFrag,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});

		const debugGeometry = new THREE.PlaneGeometry(1, 1);
		debugGeometry.translate(0.5, -0.5, 0);

		this._debugMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_transform: { value: new THREE.Vector4(0, 0, 1, 1) },
			},
			vertexShader: this.precisionPrefix + debugVert,
			fragmentShader: this.precisionPrefix + blitFrag,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});
		this._debugMesh = new THREE.Mesh(debugGeometry, this._debugMaterial);
		this._debugScene = new THREE.Scene();
		this._debugScene.frustumCulled = false;
		this._debugScene.add(this._debugMesh);
	}

	copy(texture, renderTarget) {
		const material = this.copyMaterial;
		if (material) {
			material.uniforms.u_texture.value = texture;
			this.render(material, renderTarget);
		}
	}

	uvCopy(texture, renderTarget) {
		const material = this.uvCopyMaterial;
		if (material) {
			material.uniforms.u_texture.value = texture;
			this.render(material, renderTarget);
		}
	}

	render(material, renderTarget) {
		if (!(this._tri && this.renderer && this._scene && this._camera)) return;
		this._tri.material = material;
		if (renderTarget) {
			this.renderer.setRenderTarget(renderTarget);
		}
		this.renderer.render(this._scene, this._camera);
		if (renderTarget) {
			this.renderer.setRenderTarget(null);
		}
	}

	renderGeometry(geometry, material, renderTarget) {
		if (!(this._tri && this.triGeom)) return;
		this._tri.geometry = geometry;
		this.render(material, renderTarget);
		this._tri.geometry = this.triGeom;
	}

	renderMesh(mesh, renderTarget) {
		if (!(this._tri && this.renderer && this._scene && this._camera)) return;
		this._tri.visible = false;
		this._scene.add(mesh);
		if (renderTarget) {
			this.renderer.setRenderTarget(renderTarget || null);
		}
		this.renderer.render(this._scene, this._camera);
		if (renderTarget) {
			this.renderer.setRenderTarget(null);
		}
		this._scene.remove(mesh);
		this._tri.visible = true;
	}

	debugTo(texture, width, height, x, y) {
		if (!(this.renderer && this._debugMaterial && this._debugScene && this._camera)) return;

		width = width || texture.width || texture.image.width;
		height = height || texture.height || texture.image.height;
		x = x || 0;
		y = y || 0;

		const size = this.renderer.getSize(new THREE.Vector2());
		x = (x / size.width) * 2 - 1;
		y = 1 - (y / size.height) * 2;
		width = (width / size.width) * 2;
		height = (height / size.height) * 2;

		this._debugMaterial.uniforms.u_texture.value = texture;
		this._debugMaterial.uniforms.u_transform.value.set(x, y, width, height);

		const state = this.getColorState();
		this.renderer.autoClearColor = false;
		this.renderer.setRenderTarget(null);
		this.renderer.render(this._debugScene, this._camera);
		this.setColorState(state);
	}

	parseDefines(defines) {
		let str = '';
		for (const id in defines) {
			const value = defines[id];
			if (value === true) {
				str += `#define ${id}\n`;
			} else {
				str += `#define ${id} ${value}\n`;
			}
		}
		return str;
	}

	clearColor(r, g, b, a, renderTarget) {
		if (!this.clearMaterial) return;
		this.clearMaterial.uniforms.u_color.value.set(r, g, b, a);
		this.render(this.clearMaterial, renderTarget);
	}

	getColorState() {
		if (!this.renderer)
			return {
				autoClear: true,
				autoClearColor: true,
				autoClearStencil: true,
				autoClearDepth: true,
				clearColor: 0x000000,
				clearAlpha: 1,
			};
		const color = new THREE.Color();
		this.renderer.getClearColor(color);
		return {
			autoClear: this.renderer.autoClear,
			autoClearColor: this.renderer.autoClearColor,
			autoClearStencil: this.renderer.autoClearStencil,
			autoClearDepth: this.renderer.autoClearDepth,
			clearColor: color.getHex(),
			clearAlpha: this.renderer.getClearAlpha(),
		};
	}

	setColorState(state) {
		if (!this.renderer) return;
		this.renderer.setClearColor(state.clearColor, state.clearAlpha);
		this.renderer.autoClear = state.autoClear;
		this.renderer.autoClearColor = state.autoClearColor;
		this.renderer.autoClearStencil = state.autoClearStencil;
		this.renderer.autoClearDepth = state.autoClearDepth;
	}

	createRawShaderMaterial(cfg) {
		cfg = Object.assign(
			{
				depthTest: false,
				depthWrite: false,
				blending: THREE.NoBlending,
				vertexShader: blitVert,
				fragmentShader: blitFrag,
			},
			cfg,
		);
		cfg.vertexShader = (cfg.vertexShaderPrefix !== undefined ? cfg.vertexShaderPrefix : this.precisionPrefix) + cfg.vertexShader;
		cfg.fragmentShader = (cfg.fragmentShaderPrefix !== undefined ? cfg.fragmentShaderPrefix : this.precisionPrefix) + cfg.fragmentShader;
		delete cfg.vertexShaderPrefix;
		delete cfg.fragmentShaderPrefix;
		return new THREE.RawShaderMaterial(cfg);
	}

	createDataTexture(data, width, height, isFloat = false, isNearest = true) {
		let texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, isFloat ? THREE.FloatType : THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, isNearest ? THREE.NearestFilter : THREE.LinearFilter, isNearest ? THREE.NearestFilter : THREE.LinearFilter, 0);
		texture.needsUpdate = true;
		return texture;
	}

	createRenderTarget(width, height, isNearest = false, isFloat = false, samples = 0) {
		return new THREE.WebGLRenderTarget(width, height, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			magFilter: isNearest ? THREE.NearestFilter : THREE.LinearFilter,
			minFilter: isNearest ? THREE.NearestFilter : THREE.LinearFilter,
			type: isFloat ? this.floatType : THREE.UnsignedByteType,
			anisotropy: 0,
			encoding: THREE.LinearEncoding,
			depthBuffer: false,
			stencilBuffer: false,
			samples: samples,
		});
	}

	createMultisampleRenderTarget(width, height, isNearest = false, isFloat = false, samples = 8) {
		if (!(this.renderer && this.isWebGL2)) {
			return this.createRenderTarget(width, height, isNearest, isFloat);
		}
		let rt = new THREE.WebGLRenderTarget(width, height, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			magFilter: isNearest ? THREE.NearestFilter : THREE.LinearFilter,
			minFilter: isNearest ? THREE.NearestFilter : THREE.LinearFilter,
			type: isFloat ? this.floatType : THREE.UnsignedByteType,
			anisotropy: 0,
			encoding: THREE.LinearEncoding,
			depthBuffer: false,
			stencilBuffer: false,
			samples: samples,
		});
		return rt;
	}

	clearMultisampleRenderTargetState(renderTarget) {
		renderTarget = renderTarget || this.renderer.getRenderTarget();
		if (renderTarget && renderTarget.samples > 0) {
			const renderTargetProperties = this.renderer.properties.get(renderTarget);

			// https://github.com/mrdoob/three.js/blob/r118/src/renderers/webgl/WebGLTextures.js#L1167-L1181
			let gl = this.renderer.getContext();
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);

			const width = renderTarget.width;
			const height = renderTarget.height;
			let mask = gl.COLOR_BUFFER_BIT;

			if (renderTarget.depthBuffer) mask |= gl.DEPTH_BUFFER_BIT;
			if (renderTarget.stencilBuffer) mask |= gl.STENCIL_BUFFER_BIT;

			gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST);

			gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer); // see #18905
		}
	}
}

export default new FboHelper();
