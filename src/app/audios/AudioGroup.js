export default class AudioGroup {
	id = '';
	children = [];
	volume = 1;

	init(cfg) {
		Object.assign(this, cfg);
	}

	update(volume) {
		volume *= this.volume;
		this.children.forEach((child) => {
			child.setFinalVolume(volume);
		});
	}

	add(object) {
		if (!this.children.includes(object)) {
			this.children.push(object);
		}
	}

	remove(object) {
		if (this.children.includes(object)) {
			this.children.splice(this.children.indexOf(object), 1);
		}
	}

	play() {
		this.children.forEach((children) => children.play());
	}

	stop() {
		this.children.forEach((children) => children.stop());
	}
}
