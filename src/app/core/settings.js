import browser from '@core/browser';

class Settings {
	GLOBAL_ID = 'LUSION_APP';
	IS_API_MODE = false;

	MODEL_PATH = 'assets/models/';
	IMAGE_PATH = 'assets/images/';
	TEXTURE_PATH = 'assets/textures/';
	AUDIO_PATH = 'assets/audios/';

	RENDER_TARGET_FLOAT_TYPE = null;
	DATA_FLOAT_TYPE = null;
	USE_FLOAT_PACKING = false;
	USE_WEBGL2 = true;
	DPR = Math.min(1.5, browser.devicePixelRatio) || 1;
	USE_PIXEL_LIMIT = true;
	MAX_PIXEL_COUNT = 2560 * 1440;
	UP_SCALE = 1;

	CROSS_ORIGINS = {
		'https://example.com/': 'anonymous',
	};

	IS_DEV = !Boolean(import.meta.env.PROD);

	// queries
	LOG = false;
	SKIP_ANIMATION = false;
	LOOK_DEV_MODE = false;

	constructor() {
		if (window.URLSearchParams) {
			// override again with url queries
			const fromEntries = (iterable) => {
				return [...iterable].reduce((obj, [key, val]) => {
					obj[key] = val === '' ? true : val;
					return obj;
				}, {});
			};
			const config = fromEntries(new URLSearchParams(window.location.search));
			this.override(config);
		}
	}

	override(config) {
		for (const id in config) {
			if (this[id] !== undefined) {
				const value = config[id].toString();
				if (typeof this[id] === 'boolean') {
					this[id] = !(value === '0' || value === false);
				} else if (typeof this[id] === 'number') {
					this[id] = parseFloat(value);
				} else if (typeof this[id] === 'string') {
					this[id] = value;
				}
			}
		}
	}
}

export default new Settings();
