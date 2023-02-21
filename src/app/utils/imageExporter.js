import * as THREE from 'three';

import properties from '@core/properties';
import fboHelper from '@helpers/fboHelper';
import blitFrag from '@glsl/blit.frag';

class ImageExporter {
	outRenderTarget = null;
	outMaterial = null;

	canvas = null;
	ctx = null;

	width = 0;
	height = 0;

	exporterProgress = 0;
	isExporting = false;

	buffer = new Uint8Array();
	imageData = null;
	waitingForExport = false;

	link = document.createElement('a');

	constructor() {}

	preInit() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.outRenderTarget = fboHelper.createRenderTarget(1, 1, true);
		this.outMaterial = new THREE.RawShaderMaterial({
			uniforms: {
				u_texture: { value: null },
			},
			vertexShader: `${fboHelper.precisionPrefix}
				attribute vec2 position;
				varying vec2 v_uv;

				void main() {
					v_uv = position * 0.5 + 0.5;
					v_uv.y = 1.0 - v_uv.y;
					gl_Position = vec4(position, 0.0, 1.0);
				}
			`,
			fragmentShader: `${fboHelper.precisionPrefix}${blitFrag}`,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending,
		});

		properties.exporterSignal.add(() => {
			this.waitingForExport = true;
		});
	}

	init() {}

	exportImage() {
		this.width = properties.width;
		this.height = properties.height;

		this.outRenderTarget.setSize(properties.width, properties.height);

		this.exporterProgress = 0;
		this.isExporting = true;

		if (this.isExporting) {
			this.exporterProgress = 1;

			this.outMaterial.uniforms.u_texture.value = properties.postprocessing.fromRenderTarget.texture;
			fboHelper.render(this.outMaterial, this.outRenderTarget);

			if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
				this.buffer = new Uint8Array(this.imageData.data.length);
			}

			fboHelper.renderer.readRenderTargetPixels(this.outRenderTarget, 0, 0, this.width, this.height, this.buffer);
			this.imageData.data.set(this.buffer);

			this.ctx.putImageData(this.imageData, 0, 0);

			this.link.download = 'Lusion_exported_image.png';
			this.link.href = this.canvas.toDataURL();
			this.link.click();

			this.isExporting = false;
		}
	}

	update(dt) {
		if (this.waitingForExport) {
			this.exportImage();
			this.waitingForExport = false;
		}
	}
}

export default new ImageExporter();
