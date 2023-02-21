import 'regenerator-runtime/runtime'; // polyfill
import * as THREE from 'three';

// core
import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

// post
import { Postprocessing } from '@post/PostProcessing';
// import Fxaa from '@post/fxaa/Fxaa';
import Smaa from '@post/smaa/Smaa';
import Bloom from '@post/bloom/Bloom';
import Bokeh from '@post/bokeh/Bokeh';
import ScreenPaintDistortion from '@post/screenPaintDistortion/ScreenPaintDistortion';
// import Gtao from '@post/gtao/Gtao';
// import CameraMotionBlur from '@post/cameraMotionBlur/CameraMotionBlur';
import Final from '@post/final/Final';
import Upscaler from '@app/post/upscaler/Upscaler';

// helpers
import fboHelper from '@helpers/fboHelper';
import packHelper from '@helpers/packHelper';
import shaderHelper from '@helpers/shaderHelper';
import textureHelper from '@helpers/textureHelper';

import BufItem from '@loaders/BufItem';
import TextureItem from '@loaders/TextureItem';
import FontItem from '@loaders/FontItem';
import ThreeLoaderItem from '@loaders/ThreeLoaderItem';

import blueNoise from '@effects/blueNoise/blueNoise';
import glPositionOffset from '@effects/glPositionOffset/glPositionOffset';
import screenPaint from '@effects/screenPaint/screenPaint';

import cameraControls from '@controls/cameraControls';
// utils
import support from '@utils/support';

import ease from '@utils/ease';
import math from '@utils/math';

// main visuals
import visuals from '@visuals/visuals';

// #################################################################################################

class App {
	initEngine() {
		properties.canvas = document.getElementById('canvas');
		properties.isSupported = support.isSupported();

		if (properties.isSupported) {
			properties.loader.register(BufItem);
			properties.loader.register(TextureItem);
			properties.loader.register(FontItem);
			properties.loader.register(ThreeLoaderItem);

			// stage
			properties.renderer = new THREE.WebGLRenderer({ canvas: properties.canvas, context: properties.gl });
			properties.scene = new THREE.Scene();
			properties.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 50);
			properties.scene.add(properties.camera);

			properties.sharedUniforms.u_resolution.value = properties.resolution = new THREE.Vector2();
			properties.sharedUniforms.u_viewportResolution.value = properties.viewportResolution = new THREE.Vector2();
			properties.sharedUniforms.u_bgColor.value = properties.bgColor = new THREE.Color();

			// postprocessing
			fboHelper.init(properties.renderer, settings.RENDER_TARGET_FLOAT_TYPE);
			textureHelper.init();

			properties.postprocessing = new Postprocessing();
			properties.postprocessing.init({
				scene: properties.scene,
				camera: properties.camera,
			});

			blueNoise.preInit();
			glPositionOffset.init();
			screenPaint.init();

			// if we are using WebGL2 msaa for render target will kick in. So we don't normally need SMAA for WebGL2
			if (!settings.USE_WEBGL2) {
				properties.smaa = new Smaa();
				properties.smaa.init();
				properties.smaa.setTextures(properties.loader.add(settings.TEXTURE_PATH + 'smaa-area.png', { weight: 32 }).content, properties.loader.add(settings.TEXTURE_PATH + 'smaa-search.png', { weight: 0.1 }).content);
				properties.postprocessing.queue.push(properties.smaa);

				// optionally use FXAA instead
				// properties.fxaa = new Fxaa();
				// properties.fxaa.init();
				// properties.postprocessing.queue.push(properties.fxaa);
			}

			// properties.gtao = new Gtao();
			// if (properties.postprocessing.useDepthTexture) {
			// 	properties.gtao.init();
			// 	properties.postprocessing.queue.push(properties.gtao);
			// }

			properties.bokeh = new Bokeh();
			if (properties.postprocessing.useDepthTexture) {
				properties.bokeh.init();
				properties.bokeh.quality = browser.isMobile ? 0 : 1;
				properties.postprocessing.queue.push(properties.bokeh);
			}

			properties.bloom = new Bloom();
			properties.bloom.init();
			properties.postprocessing.queue.push(properties.bloom);

			properties.screenPaintDistortion = new ScreenPaintDistortion();
			properties.screenPaintDistortion.init({
				screenPaint: screenPaint,
			});
			properties.postprocessing.queue.push(properties.screenPaintDistortion);

			// properties.cameraMotionBlur = new CameraMotionBlur();
			// if (properties.postprocessing.useDepthTexture) {
			// 	properties.cameraMotionBlur.init();
			// 	properties.postprocessing.queue.push(properties.cameraMotionBlur);
			// }

			properties.final = new Final();
			properties.final.init();
			properties.postprocessing.queue.push(properties.final);

			if (settings.UP_SCALE > 1) {
				properties.upscaler = new Upscaler();
				properties.upscaler.init();
				properties.postprocessing.queue.push(properties.upscaler);
			}
		}
	}

	preInit() {
		cameraControls.preInit();
		visuals.preInit();
	}

	init() {
		if (properties.smaa) {
			properties.smaa.updateTextures();
		}

		cameraControls.init();
		visuals.init();

		properties.scene.add(visuals.container);

		if (settings.IS_DEV === false && settings.IS_API_MODE !== true) {
			console.log(
				// credit
				'%c Created by Lusion: https://lusion.co',
				'border:2px solid gray; padding:5px; font-family:monospace; font-size:11px;',
			);
		}
	}

	start() {}

	resize(viewportWidth, viewportHeight) {
		let upscalerUpScale = settings.UP_SCALE;
		let dprWidth = viewportWidth * settings.DPR;
		let dprHeight = viewportHeight * settings.DPR;

		if (settings.USE_PIXEL_LIMIT === true && dprWidth * dprHeight > settings.MAX_PIXEL_COUNT) {
			let aspect = dprWidth / dprHeight;
			dprHeight = Math.sqrt(settings.MAX_PIXEL_COUNT / aspect);
			dprWidth = Math.ceil(dprHeight * aspect);
			dprHeight = Math.ceil(dprHeight);
		}
		properties.width = Math.ceil(dprWidth / upscalerUpScale);
		properties.height = Math.ceil(dprHeight / upscalerUpScale);
		properties.resolution.set(properties.width, properties.height);
		properties.viewportResolution.set(viewportWidth, viewportHeight);

		properties.renderer.setSize(dprWidth, dprHeight);
		properties.canvas.style.width = `${properties.viewportWidth}px`;
		properties.canvas.style.height = `${properties.viewportHeight}px`;

		properties.camera.aspect = properties.width / properties.height;
		properties.camera.updateProjectionMatrix();
		properties.postprocessing.setSize(properties.width, properties.height);

		screenPaint.resize(properties.width, properties.height);
		visuals.resize(properties.width, properties.height);
	}

	update(dt = 0) {
		properties.time = properties.sharedUniforms.u_time.value += dt;
		properties.deltaTime = properties.sharedUniforms.u_deltaTime.value = dt;

		blueNoise.update(dt);
		screenPaint.update(dt);
		cameraControls.update(dt);
		visuals.update(dt);

		properties.renderer.setClearColor(properties.bgColor, 1);
		properties.bgColor.setStyle(properties.bgColorHex);

		properties.bloom.amount = properties.bloomAmount;
		properties.bloom.radius = properties.bloomRadius;
		properties.bloom.threshold = properties.bloomThreshold;
		properties.bloom.smoothWidth = properties.bloomSmoothWidth;
		properties.bloom.haloWidth = properties.haloWidth;
		properties.bloom.haloRGBShift = properties.haloRGBShift;
		properties.bloom.haloStrength = properties.haloStrength;
		properties.bloom.haloMaskInner = properties.haloMaskInner;
		properties.bloom.haloMaskOuter = properties.haloMaskOuter;

		properties.final.vignetteFrom = properties.vignetteFrom;
		properties.final.vignetteTo = properties.vignetteTo;
		properties.final.vignetteColor.setStyle(properties.vignetteColorHex);
		properties.final.saturation = properties.saturation;
		properties.final.contrast = properties.contrast;
		properties.final.brightness = properties.brightness;
		properties.final.tintColor.setStyle(properties.tintColorHex);
		properties.final.tintOpacity = properties.tintOpacity;
		properties.final.bgColor.setStyle(properties.bgColorHex);
		properties.final.opacity = properties.opacity;

		properties.bokeh.amount = properties.bokehAmount;
		properties.bokeh.fNumber = properties.bokehFNumber;
		properties.bokeh.focusDistance = properties.cameraDistance; //properties.bokehFocusDistance;
		properties.bokeh.focalLength = properties.bokehFocalLength;
		properties.bokeh.kFilmHeight = properties.bokehKFilmHeight;

		screenPaint.needsMouseDown = properties.screenPaintNeedsMouseDown;
		screenPaint.minRadius = properties.screenPaintMinRadius;
		screenPaint.maxRadius = properties.screenPaintMaxRadius;
		screenPaint.radiusDistanceRange = properties.screenPaintRadiusDistanceRange;
		screenPaint.pushStrength = properties.screenPaintPushStrength;
		screenPaint.velocityDissipation = properties.screenPaintVelocityDissipation;
		screenPaint.weight1Dissipation = properties.screenPaintWeight1Dissipation;
		screenPaint.weight2Dissipation = properties.screenPaintWeight2Dissipation;
		screenPaint.useNoise = properties.screenPaintUseNoise;
		screenPaint.curlScale = properties.screenPaintCurlScale;
		screenPaint.curlStrength = properties.screenPaintCurlStrength;

		properties.screenPaintDistortion.amount = properties.screenPaintDistortionAmount;
		properties.screenPaintDistortion.rgbShift = properties.screenPaintDistortionRGBShift;
		properties.screenPaintDistortion.colorMultiplier = properties.screenPaintDistortionColorMultiplier;
		properties.screenPaintDistortion.multiplier = properties.screenPaintDistortionMultiplier;

		// properties.cameraMotionBlur.amount = properties.cameraMotionBlurAmount;

		// properties.gtao.amount = properties.gtaoAmount;
		// properties.gtao.resScale = properties.gtaoResScale;
		// properties.gtao.falloffStart = properties.gtaoFalloffStart;
		// properties.gtao.falloffEnd = properties.gtaoFalloffEnd;
		// properties.gtao.radius = properties.gtaoRadius;
		// properties.gtao.indirectLightIntensity = properties.gtaoIndirectLightIntensity;
		// properties.gtao.aoIntensity = properties.gtaoAoIntensity;
		// properties.gtao.angularSamples = properties.gtaoAngularSamples;
		// properties.gtao.stepSamples = properties.gtaoStepSamples;
		// properties.gtao.useDepthAwareBlur = properties.gtaoUseDepthAwareBlur;

		if (properties.upscaler) {
			properties.upscaler.sharpness = properties.upscalerSharpness;
		}

		properties.postprocessing.render(properties.scene, properties.camera, true);
		if (window.__debugTexture) {
			fboHelper.debugTo(window.__debugTexture);
		}
	}
}

export default new App();
