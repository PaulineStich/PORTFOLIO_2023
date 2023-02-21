import fboHelper from '@helpers/fboHelper';
import * as THREE from 'three';
import blur9VaryingVertexShader from './blur9Varying.vert';
import blur9VaryingFragmentShader from './blur9Varying.frag';
import blur9FragmentShader from './blur9.frag';

class Blur {
	material = null;
	// renderTarget = fboHelper.createRenderTarget(1, 1);

	getBlur9Material() {
		let useVarying = fboHelper.MAX_VARYING_VECTORS > 8;
		if (!this.blur9Material) {
			this.blur9Material = new THREE.RawShaderMaterial({
				uniforms: {
					u_texture: { value: null },
					u_delta: { value: new THREE.Vector2() },
				},
				vertexShader: useVarying ? fboHelper.precisionPrefix + blur9VaryingVertexShader : fboHelper.vertexShader,
				fragmentShader: fboHelper.precisionPrefix + (useVarying ? blur9VaryingFragmentShader : blur9FragmentShader),
				depthWrite: false,
				depthTest: false,
			});
		}
		return this.blur9Material;
	}

	blur(radius, scale, fromRenderTarget, intermediateRenderTarget, toRenderTarget, skipResizeToRenderTarget) {
		let deltaRatio = 0.25;
		let scaledWidth = Math.ceil(fromRenderTarget.width * scale) || 0;
		let scaledHeight = Math.ceil(fromRenderTarget.height * scale) || 0;

		if (!this.material) {
			this.material = this.getBlur9Material();
		}
		if (!intermediateRenderTarget) {
			// intermediateRenderTarget = this.renderTarget; // bad practice remove this. [TEMPLATE FIX NEEDED]
			console.warn('You have to pass intermediateRenderTarget to blur');
		}

		if (scaledWidth !== intermediateRenderTarget.width || scaledHeight !== intermediateRenderTarget.height) {
			intermediateRenderTarget.setSize(scaledWidth, scaledHeight);
		}

		if (toRenderTarget) {
			if (!skipResizeToRenderTarget) {
				toRenderTarget.setSize(fromRenderTarget.width, fromRenderTarget.height);
			}
		} else {
			toRenderTarget = fromRenderTarget;
		}

		// horizontal
		this.material.uniforms.u_texture.value = fromRenderTarget.texture || fromRenderTarget;
		this.material.uniforms.u_delta.value.set((radius / scaledWidth) * deltaRatio, 0);
		fboHelper.render(this.material, intermediateRenderTarget);
		// vertical
		this.material.uniforms.u_texture.value = intermediateRenderTarget.texture || intermediateRenderTarget;
		this.material.uniforms.u_delta.value.set(0, (radius / scaledHeight) * deltaRatio);
		fboHelper.render(this.material, toRenderTarget);
	}
}
export default new Blur();
