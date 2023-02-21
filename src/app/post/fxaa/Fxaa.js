import PostEffect from '@post/PostEffect';

import fragmentShader from './fxaa.frag';

export default class Fxaa extends PostEffect {
	quality = 12;
	// 10 to 15 - default medium dither (10=fastest, 15=highest quality)
	// 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)
	// 39       - no dither, very expensive
	init(cfg) {
		Object.assign(this, cfg);
		super.init();
		this.material = fboHelper.createRawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_texelSize: null,
			},
			fragmentShader: fragmentShader,
		});
	}

	render(postProcessing, toScreen = false) {
		this.material.uniforms.u_texelSize = postProcessing.sharedUniforms.u_texelSize;

		if (this.material.defines.FXAA_QUALITY_PRESET !== this.quality) {
			this.material.defines.FXAA_QUALITY_PRESET = this.quality;
			this.material.needsUpdate = true;
		}

		super.render.call(this, postProcessing, toScreen);
	}
}
