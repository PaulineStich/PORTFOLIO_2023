import input from '@input/input';
import math from '@app/utils/math';
import properties from '@core/properties';
import { HOVER_STATE } from '../../constants';

class Cursor {
	constructor() {
		this.cursor = document.querySelector('.cursor');
		this.cursorSphere = document.querySelector('.cursor_sphere');
		this.cursorContent = document.querySelector('.cursor_container');
		this.cursorContentText = document.querySelector('.cursor_container-text');
		this.cursorArrow = document.querySelector('.cursor_container-arrow');

		this.active = false;
		this.allowAnimation = false;

		this.state = {
			position: {
				cursor: {},
			}, // position of dom cursor
			x: { previous: 0, current: 0 }, // position of mouse
			y: { previous: 0, current: 0 }, // position of mouse
			scale: { previous: 1, current: 1 },
			opacityCursor: { previous: 0, current: 0.4 },
			opacityText: { previous: 0, current: 0 },
			angle: { previous: 0, current: 0 },
			squeeze: { previous: 0, current: 0 },
			force: 30,
		};
	}

	preInit() {
		this.getPosition();
		properties.onHover.add((hoverState) => {
			if (hoverState === HOVER_STATE.HI) {
				this.enter(3, 1, 'hi', 5);
			} else if (hoverState === HOVER_STATE.OPEN) {
				this.enter(4, 1, 'open', 5);
			} else if (hoverState === HOVER_STATE.HIDE) {
				this.hide();
			} else if (hoverState === HOVER_STATE.DEFAULT) {
				this.show();
			}
		});
	}

	init() {}

	show() {
		this.cursor.style.display = 'flex';
		this.active = true;
		this.state.scale.current = 1;
		this.state.opacityCursor.current = 0.4;
		this.state.opacityText.current = 0;
		this.state.force = 20;
	}

	hide() {
		this.cursor.style.display = 'none';
		this.active = false;
	}

	enter(scale, opacity, textContent, force) {
		// console.log('mouseenter');
		this.state.scale.current = scale;
		this.state.opacityCursor.current = opacity;
		this.state.opacityText.current = opacity;
		this.cursorContentText.textContent = textContent;
		this.state.force = force;
	}

	getPosition() {
		this.state.position.cursor = this.cursor.getBoundingClientRect();
	}

	getSqueeze(diffX, diffY) {
		const distance = math.distanceTo(diffX, diffY);
		const maxSqueeze = 0.05;
		const accelerator = 1500;
		return Math.min(distance / accelerator, maxSqueeze) * this.state.force;
	}

	resize(width, height) {}

	delete() {}

	update(dt) {
		if (!this.active) return;

		let { width, height } = this.state.position.cursor;
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

		const scale = `scale(${this.state.scale.previous})`;
		const squeeze = `scale(${1 + this.state.squeeze.current}, ${1 - this.state.squeeze.current * 0.25})`;
		const rotate = `rotate(${this.state.angle.current}deg)`;
		const translate = `translateX(${this.state.x.previous}px) translateY(${this.state.y.previous}px) `;

		if (this.allowAnimation) {
			this.cursor.style.transform = translate;
			this.cursor.style.opacity = this.state.opacityCursor.previous;
			this.cursorSphere.style.transform = scale + rotate + squeeze;
			this.cursorContent.style.opacity = this.state.opacityText.previous;
		}
	}
}

export default new Cursor();
