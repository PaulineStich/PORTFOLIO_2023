import properties from '@core/properties';

const AnyItem = properties.loader.ITEM_CLASSES.any;

export default class ThreeLoaderItem extends AnyItem {
	constructor(url, cfg) {
		cfg.loadFunc = () => {};
		cfg.hasLoading = cfg.hasLoading === undefined ? true : cfg.hasLoading;
		super(url, cfg);
		if (!cfg.loader && console) {
			(console.error || console.log)('loader is required.');
		}
		this.loadFunc = this._loadFunc.bind(this);
	}

	_loadFunc(url, cb, loadingSignal) {
		this.loader.load(url, this._onLoaderLoad.bind(this, cb), this._onLoaderLoading.bind(this, loadingSignal));
	}

	_onLoaderLoad(cb, content) {
		this.content = content;
		cb(content);
	}

	_onLoaderLoading(loadingSignal, evt) {
		loadingSignal.dispatch(evt.loaded / evt.total);
	}
}

ThreeLoaderItem.type = 'three-loader';
ThreeLoaderItem.extensions = [];
