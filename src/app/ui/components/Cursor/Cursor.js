import input from '@input/input';
import math from '@app/utils/math';

class Cursor {
	constructor() {
		this.cursor = document.querySelector('.cursor');

		this.active = false;
		this.allowAnimation = false;

		this.state = {
			position: {}, // position of dom cursor
			x: { previous: 0, current: 0 }, // position of mouse
			y: { previous: 0, current: 0 }, // position of mouse
			scale: { previous: 1, current: 1 },
			opacity: { previous: 1, current: 0.4 },
			angle: { previous: 0, current: 0 },
			squeeze: { previous: 0, current: 0 },
		};
	}

	preInit() {
		this.getPosition();
	}

	init() {}

	show() {
		this.cursor.style.opacity = 1;
		this.active = true;
	}

	hide() {
		this.cursor.style.opacity = 0;
		this.active = false;
	}

	enter() {
		this.state.scale.current = 4;
		this.state.opacity.current = 0.8;
	}

	leave() {
		this.state.scale.current = 1;
		this.state.opacity.current = 0.4;
	}

	getPosition() {
		this.state.position = this.cursor.getBoundingClientRect();
	}

	getSqueeze(diffX, diffY) {
		const distance = math.distanceTo(diffX, diffY);
		const maxSqueeze = 0.1;
		const accelerator = 1500;
		const force = 30;
		return Math.min(distance / accelerator, maxSqueeze) * force;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		if (!this.active) return;

		console.log('wow');

		let { width, height } = this.state.position;
		this.state.x.current = input.mousePixelXY.x - width / 2;
		this.state.y.current = input.mousePixelXY.y - height / 2;

		// lerp old and current values
		for (const el in this.state) {
			if (Math.abs(this.state[el].previous - this.state[el].current) > 0.001) {
				this.allowAnimation = true;
				this.state[el].previous = math.lerp(this.state[el].previous, this.state[el].current, 0.25);
			}
		}

		// calculate difference in lerped values
		const diffX = Math.round(this.state.x.current - this.state.x.previous);
		const diffY = Math.round(this.state.y.current - this.state.y.previous);

		this.state.squeeze.current = this.getSqueeze(diffX, diffY);
		this.state.angle.current = math.getAngle(diffX, diffY);

		const scale = `scale(${1 + this.state.squeeze.current}, ${1 - this.state.squeeze.current * 0.25})`;
		const rotate = `rotate(${this.state.angle.current}deg)`;
		const translate = `translateX(${this.state.x.previous}px) translateY(${this.state.y.previous}px) scale(${this.state.scale.previous})`;

		if (this.allowAnimation) {
			this.cursor.style.transform = translate + rotate + scale;
			this.cursor.style.opacity = this.state.opacity.previous;
		}
	}
}

export default new Cursor();
