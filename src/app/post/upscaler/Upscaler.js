import PostEffect from '@post/PostEffect';
import FSR from '@effects/fsr/FSR';

// import easuFrag from './fsrEASU.frag';
// import frag from './fsr.frag';

export default class Fsr extends PostEffect {
	sharpness = 1;
	fsr;
	renderOrder = 100;

	init(cfg) {
		Object.assign(this, cfg);
		super.init();
		this.fsr = new FSR();
	}

	render(postprocessing, toScreen = false) {
		this.fsr.sharpness = this.sharpness;
		this.fsr.render(postprocessing.fromTexture, toScreen ? null : postprocessing.toRenderTarget);
		postprocessing.swap();
	}
}
