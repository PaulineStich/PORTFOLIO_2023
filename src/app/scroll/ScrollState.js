export default class ScrollState {
	constructor(scrollRangeIdList) {
		this.scrollRangeIdList = scrollRangeIdList; // for example: ['home', 'home||footer']
		this.scrollYRangeList = []; // will be generated. for example: [[0, 1], [3, 4]]
		this.visibleHeightList = [];

		this.wasActive = false;
		this.isActive = false;

		this.needsShow = false; // wasActive = false, isActive = true
		this.needsHide = false; // wasActive = true, isActive = false

		this.rangeId = ''; // for example: 'intro-problem||intro-quote'
		this.rangeHeight = 0; // end scrollY - start scrollY
		this.ratio = 0; // unclamped
		this.endRatio = 0; // unclamped
		this.showRatio = 0; // clamped
		this.hideRatio = 0; // clamped

		this.frameIdx = -1;
	}

	update(isActive) {
		this.wasActive = this.isActive;
		this.isActive = isActive;
		this.needsShow = false;
		this.needsHide = false;
		if (this.wasActive !== this.isActive) {
			if (this.isActive) {
				this.needsShow = true;
			} else {
				this.needsHide = true;
			}
		}
	}
}
