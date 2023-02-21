import settings from '@app/core/settings';
import browser from '@app/core/browser';
import math from '@utils/math';
import scrollDataList from './scrollDataList';
import ScrollState from './ScrollState';

import ease from '@app/utils/ease';
import input from '@app/input/input';

class ScrollManager {
	scrollDataMap = {};

	scrollPixelY = 0;
	targetScrollPixelY = 0;

	totalScrollHeight = 0;
	scrollY = 0;
	scrollIndex = 0;

	scrollYEaseLamda = browser.isMobile ? 15 : 15; // https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/

	states = {};

	isActive = false;

	// the delta scroll update value can only be as low as this value to avoid the scroll value never reaching the target scroll value
	minScrollPixelY = 0.1;
	viewportHeight = 1;

	frameIdx = -1;
	mobileScrollMultiplier = 2;

	constructor() {
		this._resetData();
	}

	init(cfg) {
		if (settings.JUMP_SECTION !== '') {
			this.scrollTo(settings.JUMP_SECTION, 0, true);
		}
	}

	_resetData() {
		let scrollY = 0;
		for (let i = 0; i < scrollDataList.length; i++) {
			let scrollData = scrollDataList[i];
			this.scrollDataMap[scrollData.id] = scrollData;
			scrollData.scrollYStart = scrollY;
			scrollY += typeof scrollData.scrollHeight === 'function' ? scrollData.scrollHeight() : scrollData.scrollHeight;
			scrollData.scrollYEnd = scrollY;
		}
		this.totalScrollHeight = Math.max(0, scrollY - 1);
	}

	_resetScrollState(scrollState) {
		scrollState.frameIdx = null;
		scrollState.scrollYRangeList.length = 0;
		scrollState.visibleHeightList.length = 0;
		for (let i = 0; i < scrollState.scrollRangeIdList.length; i++) {
			let scrollRangeId = scrollState.scrollRangeIdList[i];
			let startId, endId;
			if (scrollRangeId.indexOf('||') === -1) {
				startId = endId = scrollRangeId;
			} else {
				[startId, endId] = scrollRangeId.split('||');
			}
			scrollState.scrollYRangeList.push([this.scrollDataMap[startId].scrollYStart, this.scrollDataMap[endId].scrollYEnd]);
			scrollState.visibleHeightList.push(Math.min(1, this.scrollDataMap[endId].scrollYEnd - this.scrollDataMap[startId].scrollYStart));
		}
	}

	createScrollState(scrollRangeIdList) {
		scrollRangeIdList = typeof scrollRangeIdList == 'string' ? [scrollRangeIdList] : scrollRangeIdList;
		let hashId = scrollRangeIdList.join('##');
		let scrollState = this.states[hashId];
		if (!scrollState) {
			scrollState = this.states[hashId] = new ScrollState(scrollRangeIdList);
			this._resetScrollState(scrollState);
		}
		return scrollState;
	}

	updateScrollState(scrollState) {
		if (scrollState.frameIdx !== this.frameIdx) {
			scrollState.frameIdx !== this.frameIdx;
			let isActive = false;
			let scrollRangeId;
			let scrollYRange;
			let visibleHeight;
			let scrollYRatio = this.scrollPixelY / this.viewportHeight;
			for (let i = 0; i < scrollState.scrollYRangeList.length; i++) {
				scrollRangeId = scrollState.scrollRangeIdList[i];
				scrollYRange = scrollState.scrollYRangeList[i];
				visibleHeight = scrollState.visibleHeightList[i];
				isActive = scrollYRatio > scrollYRange[0] - 1 && scrollYRatio < scrollYRange[1];
				if (isActive) break;
			}
			if (isActive) {
				scrollState.rangeId = scrollRangeId;
				scrollState.rangeHeight = scrollYRange[1] - scrollYRange[0];
				scrollState.ratio = scrollYRatio - scrollYRange[0];
				scrollState.endRatio = scrollYRatio - scrollYRange[1];

				scrollState.showRatio = math.fit(scrollState.ratio, -1, -1 + visibleHeight, 0, 1);
				scrollState.hideRatio = math.fit(scrollState.ratio - scrollState.rangeHeight + visibleHeight, 0, visibleHeight, 0, 1);
			} else {
				scrollState.rangeId = '';
			}
			scrollState.update(isActive);
		}
	}

	getCurrentScrollState(scrollRangeIdList) {
		let scrollState = this.createScrollState(scrollRangeIdList);
		this.updateScrollState(scrollState);
		return scrollState;
	}

	scrollTo(id, scrollYOffset = 0, immediate = false) {
		this.targetScrollPixelY = (this.scrollDataMap[id].scrollYStart + scrollYOffset) * this.viewportHeight;
		if (immediate) {
			this.scrollPixelY = this.targetScrollPixelY;
		}
	}

	resize(width, height) {
		let isDynamic = false;
		for (let id in this.scrollDataMap) {
			if (typeof this.scrollDataMap[id].scrollHeight === 'function') {
				isDynamic = true;
				break;
			}
		}

		if (isDynamic) {
			this._resetData();

			for (let id in this.states) {
				this._resetScrollState(this.states[id]);
			}
		}

		this.targetScrollPixelY = (this.targetScrollPixelY / this.viewportHeight) * height;
		this.scrollPixelY = (this.scrollPixelY / this.viewportHeight) * height;

		this.viewportHeight = height;
	}

	update(dt) {
		if (this._isMoveable()) {
			let deltaSrollY = input.deltaScroll * (browser.isMobile ? this.mobileScrollMultiplier : 1);

			this.targetScrollPixelY = this.targetScrollPixelY + deltaSrollY;
			this.targetScrollPixelY = math.clamp(this.targetScrollPixelY, 0, this.totalScrollHeight * this.viewportHeight);
		}

		if (this.targetScrollPixelY !== this.scrollPixelY) {
			let deltaScrollPixelY = (this.targetScrollPixelY - this.scrollPixelY) * (1 - Math.exp(-this.scrollYEaseLamda * dt));
			let deltaSign = Math.sign(deltaScrollPixelY);
			deltaScrollPixelY = deltaSign * Math.max(Math.abs(deltaScrollPixelY), this.minScrollPixelY);

			// make sure the pixel snapping is correct
			if (this.scrollPixelY < this.targetScrollPixelY && deltaSign > 0 && this.scrollPixelY + deltaScrollPixelY > this.targetScrollPixelY) {
				this.scrollPixelY = this.targetScrollPixelY;
			} else if (this.scrollPixelY > this.targetScrollPixelY && deltaSign < 0 && this.scrollPixelY + deltaScrollPixelY < this.targetScrollPixelY) {
				this.scrollPixelY = this.targetScrollPixelY;
			} else {
				let absDeltaScrollY = Math.abs(deltaScrollPixelY);
				deltaScrollPixelY = Math.sign(deltaScrollPixelY) * Math.min(absDeltaScrollY, math.fit(absDeltaScrollY, 30, 300, 30, 300, ease.cubicIn));
				this.scrollPixelY += deltaScrollPixelY;
			}
		}

		this.scrollY = this.scrollPixelY / this.viewportHeight;

		this.frameIdx++;
	}

	_isMoveable() {
		return this.isActive;
	}
}

export default new ScrollManager();
