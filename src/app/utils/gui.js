import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';
import screenPaint from '@effects/screenPaint/screenPaint';

class GUI {
	preInit() {
		if (!window.dat) return;
		this._addTextureHelper();
	}
	init() {
		if (!window.dat) return;
		this._post();
	}

	_post() {
		const postGui = new dat.GUI();

		if (properties.bloom) {
			const folderBloom = postGui.addFolder('bloom');
			folderBloom.add(properties, 'bloomAmount', 0, 5, 0.00001).listen();
			folderBloom.add(properties, 'bloomRadius', -1, 1, 0.00001).listen();
			folderBloom.add(properties, 'bloomThreshold', 0, 1, 0.00001).listen();
			folderBloom.add(properties, 'bloomSmoothWidth', 0, 2, 0.00001).listen();
			folderBloom.add(properties, 'haloWidth', 0, 2, 0.00001).listen();
			folderBloom.add(properties, 'haloRGBShift', 0, 0.2, 0.00001).listen();
			folderBloom.add(properties, 'haloStrength', 0, 3, 0.00001).listen();
			folderBloom.add(properties, 'haloMaskInner', 0, 1, 0.00001).listen();
			folderBloom.add(properties, 'haloMaskOuter', 0, 1, 0.00001).listen();
			// folderBloom.open();
		}

		if (properties.final) {
			const folderColor = postGui.addFolder('color');
			folderColor.add(properties, 'vignetteFrom', 0, 3, 0.00001).listen();
			folderColor.add(properties, 'vignetteTo', 0, 3, 0.00001).listen();
			folderColor.addColor(properties, 'vignetteColorHex').listen();
			folderColor.add(properties, 'saturation', 0, 3, 0.00001).listen();
			folderColor.add(properties, 'contrast', -1, 3, 0.00001).listen();
			folderColor.add(properties, 'brightness', 0, 2, 0.00001).listen();
			folderColor.addColor(properties, 'tintColorHex').listen();
			folderColor.add(properties, 'tintOpacity', 0, 1, 0.00001).listen();
			// folderColor.open();
		}

		if (properties.bokeh) {
			const folderBokeh = postGui.addFolder('bokeh');
			folderBokeh.add(properties, 'bokehAmount', 0, 1, 0.00001).listen();
			folderBokeh.add(properties, 'bokehFNumber', 0.0001, 1, 0.00001).listen();
			folderBokeh.add(properties, 'bokehFocusDistance', 0, 20, 0.00001).listen();
			folderBokeh.add(properties, 'bokehFocalLength', 0, 3, 0.00001).listen();
			folderBokeh.add(properties, 'bokehKFilmHeight', 0.00001, 90, 0.00001).listen();
			folderBokeh.add(properties.bokeh, 'quality', 0, 3, 1).listen();
			// folderBokeh.open();
		}

		if (properties.cameraMotionBlur) {
			const folderMotion = postGui.addFolder('cameraMotionBlur');
			folderMotion.add(properties, 'cameraMotionBlurAmount', 0, 3, 0.00001).listen();
			// folderMotion.open();
		}

		const folderScreenPaint = postGui.addFolder('screenPaint');
		folderScreenPaint.add(properties, 'screenPaintNeedsMouseDown');
		folderScreenPaint.add(properties, 'screenPaintMinRadius', 0, 200, 1).listen();
		folderScreenPaint.add(properties, 'screenPaintMaxRadius', 0, 300, 1).listen();
		folderScreenPaint.add(properties, 'screenPaintRadiusDistanceRange', 0, 300, 1).listen();
		folderScreenPaint.add(properties, 'screenPaintPushStrength', 0, 100, 0.00001).listen();
		folderScreenPaint.add(properties, 'screenPaintVelocityDissipation', 0, 0.999, 0.00001).listen();
		folderScreenPaint.add(properties, 'screenPaintWeight1Dissipation', 0, 0.999, 0.00001).listen();
		folderScreenPaint.add(properties, 'screenPaintWeight2Dissipation', 0, 0.999, 0.00001).listen();

		folderScreenPaint.add(properties, 'screenPaintUseNoise');
		folderScreenPaint.add(properties, 'screenPaintCurlScale', 0, 0.5, 0.00001).listen();
		folderScreenPaint.add(properties, 'screenPaintCurlStrength', 0, 5, 0.00001).listen();

		if (properties.screenPaintDistortion) {
			const folderScreenPaintDistortion = postGui.addFolder('screenPaintDistortion');
			folderScreenPaintDistortion.add(properties, 'screenPaintDistortionAmount', 0, 100, 0.00001).listen();
			folderScreenPaintDistortion.add(properties, 'screenPaintDistortionRGBShift', 0, 3, 0.00001).listen();
			folderScreenPaintDistortion.add(properties, 'screenPaintDistortionMultiplier', 0, 3, 0.00001).listen();
			// folderMotion.open();
		}

		// if (properties.gtao) {
		// 	const folderGtao = postGui.addFolder('gtao');
		// 	folderGtao.add(properties, 'gtaoAmount', 0, 1, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoResScale', 0.25, 1, 0.25).listen();
		// 	folderGtao.add(properties, 'gtaoFalloffStart', 0, 2, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoFalloffEnd', 0, 8, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoRadius', 0.0001, 8, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoIndirectLightIntensity', 0, 5, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoAoIntensity', 0, 3, 0.00001).listen();
		// 	folderGtao.add(properties, 'gtaoAngularSamples', 1, 4, 1).listen();
		// 	folderGtao.add(properties, 'gtaoStepSamples', 1, 4, 1).listen();
		// 	folderGtao.add(properties, 'gtaoUseDepthAwareBlur').listen();
		// 	// folderGtao.open();
		// }

		// if (properties.upscalerSharpness) {
		const folderUpscaler = postGui.addFolder('upscaler');
		folderUpscaler.add(properties, 'upscalerSharpness', 0, 1, 0.00001).listen();
		// folderUpscaler.open();
		// }
	}
	_addTextureHelper() {
		let addFunc = dat.GUI.prototype.add;
		dat.GUI.prototype.add = function (obj, id) {
			let texture = obj[id];
			if (texture && texture.isTexture) {
				let image = new Image();
				let elem;
				let gui = this;
				let data = {};
				let lastTime = 0;
				image.src = texture.image.src;

				function loadFile(file) {
					image.onload = function () {
						texture.image = image;
						texture.needsUpdate = true;
					};
					image.src = URL.createObjectURL(file);
				}

				function openImageFile() {
					if (+new Date() - lastTime < 100) return;
					lastTime = +new Date();
					let input = document.createElement('input');
					input.type = 'file';
					input.style.display = 'none';
					input.onchange = function () {
						document.body.removeChild(input);
						let file = input.files[0];
						loadFile(file);
					};
					document.body.appendChild(input);
					input.click();
				}
				data[id] = openImageFile;
				elem = addFunc.call(this, data, id);
				elem.domElement.innerHTML = '';
				elem.domElement.appendChild(image);
				image.style.width = image.style.height = '26px';
				elem.domElement.dragover = (evt) => {
					evt.preventDefault();
				};
				elem.domElement.parentNode.parentNode.style.position = 'relative';
				function preventDefault(evt) {
					evt.stopPropagation();
					evt.preventDefault();
				}
				elem.domElement.parentNode.parentNode.ondragenter = elem.domElement.parentNode.parentNode.ondragleave = elem.domElement.parentNode.parentNode.ondragover = preventDefault;

				elem.domElement.parentNode.parentNode.addEventListener('drop', function (evt) {
					evt.stopPropagation();
					evt.preventDefault();
					let file = evt.dataTransfer.files[0];
					loadFile(file);
				});
				return elem;
			} else {
				return addFunc.apply(this, arguments);
			}
		};
	}
}

export default new GUI();
