import properties from '@core/properties';

const AnyItem = properties.loader.ITEM_CLASSES.any;

// loader.add('Roboto:400,Roboto:400:italic', {type: 'font', onLoad => {}});

export default class FontItem extends AnyItem {
	constructor(url, cfg) {
		if (!FontItem.canvas) {
			FontItem.initCanvas();
		}
		cfg.loadFunc = () => {};
		cfg.hasLoading = cfg.hasLoading === undefined ? true : cfg.hasLoading;
		cfg.refText = 'refing something...';
		cfg.refFontSize = cfg.refFontSize || 120;
		cfg.refFont = cfg.refFont || 'monospace:400:italic';
		cfg.interval = cfg.interval || 20;
		cfg.refTextWidth = 0;
		super(url, cfg);
		this.loadFunc = this._loadFunc.bind(this);
	}

	static canvas;
	static ctx;
	static initCanvas() {
		let canvas = document.createElement('canvas');
		canvas.width = canvas.height = 1;
		FontItem.canvas = canvas;
		FontItem.ctx = canvas.getContext('2d');
	}

	_loadFunc(url, cb, loadingSignal) {
		let chunk = url.split(',');
		let fontList = [];
		for (let i = 0; i < chunk.length; i++) {
			fontList.push(chunk[i].trim());
		}

		chunk = this.refFont.split(':');
		let fontFamily = chunk[0];
		let fontWeight = chunk[1] || 'normal';
		let fontStyle = chunk[2] || 'normal';
		let fallbackFontFamily = fontFamily;
		this.refTextWidth = this._getTextWidth(fontFamily, fontWeight, fontStyle);
		let interval;
		let loadCount = fontList.length;

		interval = setInterval(() => {
			chunk = fontList[0].split(':');
			fontFamily = chunk[0];
			fontWeight = chunk[1] || 'normal';
			fontStyle = chunk[2] || 'normal';
			let width = this._getTextWidth(fontFamily, fontWeight, fontStyle, fallbackFontFamily);
			if (width !== this.refTextWidth) {
				fontList.shift();
				loadingSignal.dispatch((loadCount - fontList.length) / loadCount);
				if (fontList.length === 0) {
					clearInterval(interval);
					cb();
				}
			}
		}, this.refInterval);
	}

	_getTextWidth = (fontFamily, fontWeight, fontStyle, fallbackFontFamily) => {
		let ctx = FontItem.ctx;
		ctx.font = fontStyle + ' ' + fontWeight + ' ' + this.refFontSize + 'px ' + fontFamily + (fallbackFontFamily ? ', ' + fallbackFontFamily : '');

		return ctx.measureText(this.refText).width;
	};

	_onLoaderLoad(cb, content) {
		this.content = content;
		cb(content);
	}

	_onLoaderLoading(loadingSignal, evt) {
		loadingSignal.dispatch(evt.loaded / evt.total);
	}
}

FontItem.type = 'font';
FontItem.extensions = [];
