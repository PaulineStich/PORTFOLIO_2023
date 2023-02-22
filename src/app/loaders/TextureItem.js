import properties from '@core/properties';
import * as THREE from 'three';

const ImageItem = properties.loader.ITEM_CLASSES.image;

export default class TextureItem extends ImageItem {
	constructor(url, cfg) {
		let texture = cfg.content || new THREE.Texture(new Image());
		cfg.content = texture.image;
		texture.minFilter = cfg.minFilter || THREE.LinearMipMapLinearFilter;
		switch (texture.minFilter) {
			case THREE.NearestMipMapNearestFilter:
			case THREE.NearestMipMapLinearFilter:
			case THREE.LinearMipMapNearestFilter:
			case THREE.LinearMipMapLinearFilter:
				texture.generateMipmaps = true;
				texture.anisotropy = cfg.anisotropy || properties.renderer.capabilities.getMaxAnisotropy();
				break;
			default:
				texture.generateMipmaps = false;
		}
		texture.flipY = cfg.flipY === undefined ? true : cfg.flipY;
		if (cfg.wrap) {
			texture.wrapS = texture.wrapT = cfg.wrap;
		} else {
			if (cfg.wrapS) texture.wrapS = cfg.wrapS;
			if (cfg.wrapT) texture.wrapT = cfg.wrapT;
		}
		super(url, cfg);
		this.content = texture;
	}

	retrieve() {
		return false;
	}

	load() {
		this.isStartLoaded = true;
		let img = this.content.image;
		img.onload = this.boundOnLoad;
		img.src = this.url;
	}

	_onLoad() {
		delete this.content.image.onload;
		this.width = this.content.image.width;
		this.height = this.content.image.height;
		this.content.needsUpdate = true;
		if (this.onPost) {
			this.onPost.call(this, this.content, this.onPostLoadingSignal);
		} else {
			this._onLoadComplete();
		}
	}
}

TextureItem.type = 'texture';
TextureItem.extensions = [];
