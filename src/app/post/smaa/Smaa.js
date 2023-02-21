import * as THREE from 'three';

import fboHelper from '@helpers/fboHelper';
import PostEffect from '@post/PostEffect';

import smaaBlendVert from './smaaBlend.vert';
import smaaBlendFrag from './smaaBlend.frag';
import smaaEdgesVert from './smaaEdges.vert';
import smaaEdgesFrag from './smaaEdges.frag';
import smaaWeightsVert from './smaaWeights.vert';
import smaaWeightsFrag from './smaaWeights.frag';

export default class Smaa extends PostEffect {
	edgesRenderTarget = null;
	weightsRenderTarget = null;
	edgesMaterial = null;
	weightsMaterial = null;

	init(cfg) {
		Object.assign(
			this,
			{
				sharedUniforms: {
					u_areaTexture: { value: null },
					u_searchTexture: { value: null },
				},
			},
			cfg,
		);
		super.init();
		this.weightsRenderTarget = fboHelper.createRenderTarget(1, 1);
		this.edgesRenderTarget = fboHelper.createRenderTarget(1, 1);

		this.edgesMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_texelSize: null,
			},
			vertexShader: fboHelper.precisionPrefix + smaaEdgesVert,
			fragmentShader: fboHelper.precisionPrefix + smaaEdgesFrag,
			defines: {
				SMAA_THRESHOLD: '0.1',
			},
			// transparent: true,
			blending: THREE.NoBlending,
			depthTest: false,
			depthWrite: false,
		});
		this.weightsMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_edgesTexture: { value: this.edgesRenderTarget.texture },
				u_areaTexture: this.sharedUniforms.u_areaTexture,
				u_searchTexture: this.sharedUniforms.u_searchTexture,
				u_texelSize: null,
			},
			vertexShader: fboHelper.precisionPrefix + smaaWeightsVert,
			fragmentShader: fboHelper.precisionPrefix + smaaWeightsFrag,
			defines: {
				SMAA_MAX_SEARCH_STEPS: '8',
				SMAA_AREATEX_MAX_DISTANCE: '16',
				SMAA_AREATEX_PIXEL_SIZE: '( 1.0 / vec2( 160.0, 560.0 ) )',
				SMAA_AREATEX_SUBTEX_SIZE: '( 1.0 / 7.0 )',
			},
			transparent: true,
			blending: THREE.NoBlending,
			depthTest: false,
			depthWrite: false,
		});

		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_weightsTexture: { value: this.weightsRenderTarget.texture },
				u_texelSize: null,
			},
			vertexShader: fboHelper.precisionPrefix + smaaBlendVert,
			fragmentShader: fboHelper.precisionPrefix + smaaBlendFrag,
		});
	}

	setTextures(areaImage, searchImage) {
		const areaTexture = (this.sharedUniforms.u_areaTexture.value = this._createTexture(areaImage));
		areaTexture.minFilter = THREE.LinearFilter;

		const searchTexture = (this.sharedUniforms.u_searchTexture.value = this._createTexture(searchImage));
		searchTexture.magFilter = THREE.NearestFilter;
		searchTexture.minFilter = THREE.NearestFilter;
	}

	updateTextures() {
		this.sharedUniforms.u_areaTexture.value.needsUpdate = true;
		this.sharedUniforms.u_searchTexture.value.needsUpdate = true;
	}

	setPostprocessing(postprocessing) {
		super.setPostprocessing(postprocessing);
		const width = postprocessing.width;
		const height = postprocessing.height;
		this.edgesRenderTarget.setSize(width, height);
		this.weightsRenderTarget.setSize(width, height);
	}

	dispose() {
		if (this.edgesRenderTarget) {
			this.edgesRenderTarget.dispose();
		}
		if (this.weightsRenderTarget) {
			this.weightsRenderTarget.dispose();
		}
	}

	needsRender() {
		return !this.sharedUniforms.u_areaTexture.value.needsUpdate;
	}

	render(postprocessing, toScreen) {
		const state = fboHelper.getColorState();

		if (!this.sharedUniforms.u_searchTexture.value) {
			console.warn('You need to use Smaa.setImages() to set the smaa textures manually and assign to this class.');
		}

		const renderer = fboHelper.renderer;
		if (renderer) {
			renderer.autoClear = true;
			renderer.setClearColor(0, 0);
		}

		this.edgesMaterial.uniforms.u_texelSize = this.weightsMaterial.uniforms.u_texelSize = this.material.uniforms.u_texelSize = postprocessing.sharedUniforms.u_texelSize;
		// pass 1
		this.edgesMaterial.uniforms.u_texture.value = postprocessing.fromTexture;
		postprocessing.renderMaterial(this.edgesMaterial, this.edgesRenderTarget);

		// // pass 2
		postprocessing.renderMaterial(this.weightsMaterial, this.weightsRenderTarget);
		fboHelper.setColorState(state);

		// pass 3
		this.material.uniforms.u_texture.value = postprocessing.fromTexture;
		super.render(postprocessing, toScreen);
	}

	_createTexture(src) {
		const texture = new THREE.Texture(src);
		texture.generateMipmaps = false;
		texture.flipY = false;
		return texture;
	}
}
