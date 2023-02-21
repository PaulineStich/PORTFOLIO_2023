import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';

import * as THREE from 'three';

class Support {
	isSupported() {
		properties._isSupportedDevice = true;
		properties._isSupportedBrowser = (browser.isChrome || browser.isSafari || browser.isEdge || browser.isFirefox || browser.isOpera) && !browser.isIE;
		properties._isSupportedWebGL = this.checkSupportWebGL();

		browser.isMobile && this.checkSupportMobileOrientation();

		let isSupported = properties._isSupportedDevice && properties._isSupportedBrowser && properties._isSupportedWebGL;

		if (isSupported === false) {
			this.notSupported();
		}

		return isSupported;
	}

	notSupported() {
		if (!properties._isSupportedDevice) {
			this._addNotSupported('device');
			return;
		}
		if (!properties._isSupportedBrowser) {
			this._addNotSupported('browser');
			return;
		}
		if (!properties._isSupportedWebGL) {
			this._addNotSupported('webgl');
			return;
		}
	}

	// ###########################################

	checkSupportWebGL() {
		if (!(properties.canvas instanceof HTMLCanvasElement)) {
			return false;
		}

		if (settings.USE_WEBGL2 && window.WebGL2RenderingContext) {
			try {
				properties.gl = properties.canvas.getContext('webgl2', properties.webglOpts);
				settings.RENDER_TARGET_FLOAT_TYPE = THREE.FloatType;
				settings.DATA_FLOAT_TYPE = THREE.FloatType;
				return true;
			} catch (error) {
				console.error(error);
				return false;
			}
		}
		settings.USE_WEBGL2 = false;
		if (window.WebGLRenderingContext) {
			try {
				let gl = (properties.gl = properties.canvas.getContext('webgl', properties.webglOpts) || properties.canvas.getContext('experimental-webgl', properties.webglOpts));
				if ((gl.getExtension('OES_texture_float') || gl.getExtension('OES_texture_half_float')) && gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) {
					settings.RENDER_TARGET_FLOAT_TYPE = browser.isIOS || !gl.getExtension('OES_texture_float') ? THREE.HalfFloatType : THREE.FloatType;
					settings.DATA_FLOAT_TYPE = THREE.FloatType;
				} else {
					settings.USE_FLOAT_PACKING = true;
					settings.RENDER_TARGET_FLOAT_TYPE = settings.DATA_FLOAT_TYPE = THREE.UnsignedByteType;
					return false;
				}
				return true;
			} catch (error) {
				console.error(error);
				return false;
			}
		}
		return false;
	}

	checkSupportMobileOrientation() {
		const orientationMedia = window.matchMedia('(orientation: portrait)');

		const checkOrientation = (m) => {
			const _orientation = m.matches ? 'portrait' : 'landscape';
			'portrait' === _orientation ? (properties._isSupportedMobileOrientation = !0) : 'landscape' === _orientation && (properties._isSupportedMobileOrientation = !1);
			if (properties._isSupported && !properties._isSupportedMobileOrientation) {
				this._addNotSupported('orientation');
			} else {
				this._removeNotSupported('orientation');
			}
		};

		window.addEventListener('load', () => {
			checkOrientation(orientationMedia);
		});

		orientationMedia.addEventListener('change', (newOrientationMedia) => {
			checkOrientation(newOrientationMedia);
		});
	}

	// ###########################################

	_removeNotSupported(_type) {
		properties._isSupported && document.documentElement.classList.remove(`not-supported`);
		_type && document.documentElement.classList.remove(`not-supported--${_type}`);
		return;
	}

	_addNotSupported(_type) {
		// also add html classes to deal with ui overlay
		document.documentElement.classList.add(`not-supported`);
		_type && document.documentElement.classList.add(`not-supported--${_type}`);
		return;
	}
}

export default new Support();
