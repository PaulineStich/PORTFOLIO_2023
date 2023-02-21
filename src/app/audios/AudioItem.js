import properties from '@core/properties';

import * as THREE from 'three';
import MinSignal from 'min-signal';

export default class AudioItem {
	autoplay = false;
	elem = null;

	id = '';
	url = '';
	fileSize = 100;

	isMutable = false;
	isPositional = false;
	isLoopable = false;
	isPreload = true;

	onInitialized = new MinSignal();
	onEnded = new MinSignal();
	onPlayed = new MinSignal();

	volume = 1;
	audioObject = null;
	hasInitialized = false;
	container = null; // if it is a positional audio, this will be an object3d to contain the audio object
	refDistance = 1;

	_buffer = null;
	_originalOnEnd = null;

	preInit(cfg) {
		Object.assign(this, cfg);
		if (this.isPositional) {
			this.container = new THREE.Object3D();
		}
	}

	init(listener) {
		if (this.hasInitialized === true) return;
		this.hasInitialized = true;

		this.audioObject = this.isPositional ? new THREE.PositionalAudio(listener) : new THREE.Audio(listener);

		if (this.isPositional) {
			this.container.add(this.audioObject);
		}

		this._originalOnEnd = this.audioObject.onEnded.bind(this.audioObject);
		this.audioObject.onEnded = this.onEnd.bind(this);

		if (this.isPositional) {
			this.setRefDistance(this.refDistance);
		}

		if (this.isElem && !this.elem) {
			this.elem = document.createElement('audio');
			this.elem.src = this.url;
		}

		if (!this.elem) {
			this.audioObject.setLoop(this.isLoopable);
			if (this._buffer) {
				this.decodeAudioData();
			}
		} else {
			this.elem.loop = this.isLoopable;
			this.audioObject.setMediaElementSource(this.elem);
			this.elem.addEventListener('ended', this.onEnd.bind(this));
			if (this.autoplay) {
				this.play();
			}
		}

		this.onInitialized.dispatch(this);
	}

	load(callback) {
		if (this.elem) {
			this.elem.src = this.url;
		} else {
			const method = this.isPreload ? 'add' : 'load';
			properties.loader[method](this.url, {
				weight: this.fileSize,
				type: 'xhr',
				responseType: 'arraybuffer',
				hasLoading: true,
				onLoad: (buffer) => {
					this._buffer = buffer;
					if (this.hasInitialized) this.decodeAudioData();
					if (callback) callback();
				},
			});
		}
	}

	setFinalVolume(value) {
		this.audioObject?.setVolume(value * this.volume);
	}

	setPositionObjectParent(parent) {
		if (!this.hasInitialized) {
			this.positionObjectParent = parent;
		} else {
			if (!parent) {
				if (this.audioObject.parent) {
					this.audioObject.parent.remove(this.audioObject);
				}
			} else {
				parent.add(this.audioObject);
			}
		}
	}

	decodeAudioData() {
		const bufferCopy = this._buffer.slice(0);
		const context = THREE.AudioContext.getContext();
		context.decodeAudioData(bufferCopy, (audioBuffer) => {
			this.audioObject.setBuffer(audioBuffer);
			if (this.autoplay) {
				this.play();
			}
		});
	}

	onEnd() {
		if (this._originalOnEnd) {
			this._originalOnEnd();
		}
		this.onEnded.dispatch(this);
	}

	play() {
		this.autoplay = true;
		if (this.audioObject && !this.audioObject.isPlaying) {
			if (!this.elem) {
				this.audioObject.play();
			} else {
				this.elem.play();
				this.elem.currentTime = 0.01;
				this.audioObject.isPlaying = true;
			}
			this.onPlayed.dispatch(this);
		}
	}

	stop() {
		this.autoplay = false;
		if (this.audioObject && this.audioObject.isPlaying) {
			if (!this.elem) {
				this.audioObject.stop();
			} else {
				this.elem.pause();
				this.audioObject.isPlaying = false;
			}
			this.onEnded.dispatch(this);
		}
	}

	setRefDistance(refDistance) {
		this.refDistance = refDistance;
		if (this.isPositional && this.audioObject) {
			this.audioObject.setRefDistance(this.refDistance);
		}
	}
}
