import settings from '@core/settings';

import * as THREE from 'three';
import MinSignal from 'min-signal';
import quickLoader from 'quick-loader';

class Properties {
	win = window;
	isSecureConnection = window.location.protocol === 'https:';

	// loaders
	loader = quickLoader.create();
	percent = 0;
	easedPercent = 0;

	// support
	_isSupportedDevice = false;
	_isSupportedBrowser = false;
	_isSupportedWebGL = false;
	_isSupportedMobileOrientation = false;
	_isSupported = false;

	time = 0;
	deltaTime = 0;

	hasInitialized = false;
	hasStarted = false;

	viewportWidth = 0;
	viewportHeight = 0;

	// canvas
	width = 0;
	height = 0;

	renderer = null;
	scene = null;
	camera = null;
	postprocessing = null;
	resolution = null;
	canvas = null;
	gl = null;
	webglOpts = { antialias: false, alpha: false, xrCompatible: true };
	sharedUniforms = { u_time: { value: 0 }, u_deltaTime: { value: 1 }, u_resolution: { value: null }, u_bgColor: { value: null } };

	initCompileList = [];

	// ###########################################
	// camera handler

	changeCamera = new MinSignal();

	cameraLookX = 0;
	cameraLookY = 0;
	cameraDistance = 5;
	cameraLookStrength = 0.0;
	cameraLookEaseDamp = 0.1;
	cameraShakePositionStrength = 0.5;
	cameraShakePositionSpeed = 0.15;
	cameraShakeRotationStrength = 0.003;
	cameraShakeRotationSpeed = 0.3;
	cameraDollyZoomFovOffset = 0;

	// ###########################################
	// post processing

	smaa = null;
	fxaa = null;
	cameraMotionBlur = null;
	gtao = null;
	bokeh = null;
	bloom = null;
	screenPaintDistortion = null;
	final = null;

	bgColorHex = '#000000';
	bgColor = new THREE.Color();
	opacity = 1;

	bloomAmount = 2.4;
	bloomRadius = 0.25;
	bloomThreshold = 0.2;
	bloomSmoothWidth = 0.75;
	haloWidth = 0.75;
	haloRGBShift = 0.03;
	haloStrength = 0.18;
	haloMaskInner = 0.3;
	haloMaskOuter = 0.5;

	vignetteFrom = 0.6;
	vignetteTo = 1.6;
	vignetteColorHex = '#000000';
	saturation = 1;
	contrast = 0;
	brightness = 1;

	tintColorHex = '#0044ef';
	tintOpacity = 0.08;

	// cameraMotionBlurAmount = 0;

	bokehAmount = 0;
	bokehFNumber = 0.181;
	bokehFocusDistance = 4.5;
	bokehFocalLength = 0.344;
	bokehKFilmHeight = 19.26;

	screenPaintNeedsMouseDown = false;
	screenPaintMinRadius = 0; // in pixel based on the viewport size
	screenPaintMaxRadius = 100; // in pixel based on the viewport size
	screenPaintRadiusDistanceRange = 100; // in pixel
	screenPaintPushStrength = 25;
	screenPaintVelocityDissipation = 0.985;
	screenPaintWeight1Dissipation = 0.985;
	screenPaintWeight2Dissipation = 0.75;

	screenPaintUseNoise = true;
	screenPaintCurlScale = 0.15;
	screenPaintCurlStrength = 2;

	screenPaintDistortionAmount = 20;
	screenPaintDistortionRGBShift = 1;
	screenPaintDistortionMultiplier = 1.25;

	upscalerSharpness = 1;

	// ###########################################

	onFirstClicked = new MinSignal();
	isPreloaderFinished = false;

	// ###########################################

	constructor() {
		// console.log(this);
	}
}

export default new Properties();
