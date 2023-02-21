import properties from '@core/properties';
import settings from '@core/settings';

import input from '@input/input';
import math from '@utils/math';

import * as THREE from 'three';
import MinSignal from 'min-signal';

import AUDIO_DATA from '@audios/AUDIO_DATA';
import AudioGroup from '@app/audios/AudioGroup';
import AudioItem from '@app/audios/AudioItem';

class Audios {
	groups = {};
	items = {};

	isActive = true;
	volume = 0;

	listener = null;
	_boundOnBodyClick = null;
	_onBodyClicked = new MinSignal();

	_onRolloverCount = -1;

	preInit() {
		this._boundOnBodyClick = () => this._onBodyClick();
		input.onDowned.add(this._boundOnBodyClick);

		for (let groupId in AUDIO_DATA) {
			let audioGroup = new AudioGroup();
			let groupItemDataList = AUDIO_DATA[groupId];
			audioGroup.init({ id: groupId });
			this.groups[groupId] = audioGroup;

			groupItemDataList.forEach((audioItemData) => {
				let audioItem = new AudioItem();
				audioItemData.url = settings.AUDIO_PATH + audioItemData.url;
				audioItem.preInit(audioItemData);

				audioItem.load(() => {
					// optional callback on load
					// settings.LOG && console.log('[audios] AudioItem loaded', audioItem);
				});
				this.items[audioItemData.id] = audioItem;
				this.groups[groupId].add(audioItem);
			});
		}
	}

	init() {
		this.getListener((listener) => {
			for (let audioItem in this.items) {
				this.items[audioItem].init(listener);
			}
		});
		this.items['bgm'].play();
	}

	update(dt) {
		if (this.listener) {
			this.volume = math.saturate(this.volume + (this.isActive ? 1 : -1) * dt * 0.5);

			for (let _audioGroup in this.groups) {
				this.groups[_audioGroup].update(this.volume);
			}
		}
	}

	getListener(callback) {
		if (this.listener) {
			callback(this.listener);
		} else {
			this._onBodyClicked.add(callback);
		}
	}

	_onBodyClick() {
		input.onDowned.remove(this._boundOnBodyClick);
		this.listener = new THREE.AudioListener();
		this._onBodyClicked.dispatch(this.listener);

		properties.camera.add(this.listener);
	}

	playRollover() {
		this._onRolloverCount = (this._onRolloverCount + 1) % 2;
		this.items['hover_' + this._onRolloverCount].play();
	}
}

export default new Audios();
