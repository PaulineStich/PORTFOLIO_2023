// from https://github.com/kaelzhang/easing-functions/

class Ease {
	quadIn(e) {
		return e * e;
	}
	quadOut(e) {
		return e * (2 - e);
	}
	quadInOut(e) {
		if ((e *= 2) < 1) return 0.5 * e * e;
		return -0.5 * (--e * (e - 2) - 1);
	}

	cubicIn(e) {
		return e * e * e;
	}
	cubicOut(e) {
		return --e * e * e + 1;
	}
	cubicInOut(e) {
		if ((e *= 2) < 1) return 0.5 * e * e * e;
		return 0.5 * ((e -= 2) * e * e + 2);
	}

	quartIn(e) {
		return e * e * e * e;
	}
	quartOut(e) {
		return 1 - --e * e * e * e;
	}
	quartInOut(e) {
		if ((e *= 2) < 1) return 0.5 * e * e * e * e;
		return -0.5 * ((e -= 2) * e * e * e - 2);
	}

	quintIn(e) {
		return e * e * e * e * e;
	}
	quintOut(e) {
		return --e * e * e * e * e + 1;
	}
	quintInOut(e) {
		if ((e *= 2) < 1) return 0.5 * e * e * e * e * e;
		return 0.5 * ((e -= 2) * e * e * e * e + 2);
	}

	sineIn(e) {
		return 1 - Math.cos((e * Math.PI) / 2);
	}
	sineOut(e) {
		return Math.sin((e * Math.PI) / 2);
	}
	sineInOut(e) {
		return 0.5 * (1 - Math.cos(Math.PI * e));
	}

	expoIn(e) {
		return e === 0 ? 0 : Math.pow(1024, e - 1);
	}
	expoOut(e) {
		return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
	}
	expoInOut(e) {
		if (e === 0) return 0;
		if (e === 1) return 1;
		if ((e *= 2) < 1) return 0.5 * Math.pow(1024, e - 1);
		return 0.5 * (-Math.pow(2, -10 * (e - 1)) + 2);
	}

	circIn(e) {
		return 1 - Math.sqrt(1 - e * e);
	}
	circOut(e) {
		return Math.sqrt(1 - --e * e);
	}
	circInOut(e) {
		if ((e *= 2) < 1) return -0.5 * (Math.sqrt(1 - e * e) - 1);
		return 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
	}

	elasticIn(e) {
		let t,
			n = 0.1,
			r = 0.4;
		if (e === 0) return 0;
		if (e === 1) return 1;
		if (!n || n < 1) {
			n = 1;
			t = r / 4;
		} else t = (r * Math.asin(1 / n)) / (2 * Math.PI);
		return -(n * Math.pow(2, 10 * (e -= 1)) * Math.sin(((e - t) * 2 * Math.PI) / r));
	}
	elasticOut(e) {
		let t,
			n = 0.1,
			r = 0.4;
		if (e === 0) return 0;
		if (e === 1) return 1;
		if (!n || n < 1) {
			n = 1;
			t = r / 4;
		} else t = (r * Math.asin(1 / n)) / (2 * Math.PI);
		return n * Math.pow(2, -10 * e) * Math.sin(((e - t) * 2 * Math.PI) / r) + 1;
	}
	elasticInOut(e) {
		let t,
			n = 0.1,
			r = 0.4;
		if (e === 0) return 0;
		if (e === 1) return 1;
		if (!n || n < 1) {
			n = 1;
			t = r / 4;
		} else {
			t = (r * Math.asin(1 / n)) / (2 * Math.PI);
		}
		if ((e *= 2) < 1) return -0.5 * n * Math.pow(2, 10 * (e -= 1)) * Math.sin(((e - t) * 2 * Math.PI) / r);
		return n * Math.pow(2, -10 * (e -= 1)) * Math.sin(((e - t) * 2 * Math.PI) / r) * 0.5 + 1;
	}

	backIn(e) {
		let t = 1.70158;
		return e * e * ((t + 1) * e - t);
	}
	backOut(e) {
		let t = 1.70158;
		return --e * e * ((t + 1) * e + t) + 1;
	}
	backInOut(e) {
		let t = 1.70158 * 1.525;
		if ((e *= 2) < 1) return 0.5 * e * e * ((t + 1) * e - t);
		return 0.5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
	}

	bounceIn(e) {
		return 1 - this.bounceOut(1 - e);
	}
	bounceOut(e) {
		if (e < 1 / 2.75) {
			return 7.5625 * e * e;
		} else if (e < 2 / 2.75) {
			return 7.5625 * (e -= 1.5 / 2.75) * e + 0.75;
		} else if (e < 2.5 / 2.75) {
			return 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375;
		} else {
			return 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
		}
	}
	bounceInOut(e) {
		if (e < 0.5) return this.bounceIn(e * 2) * 0.5;
		return this.bounceOut(e * 2 - 1) * 0.5 + 0.5;
	}

	cubicBezier(ratio, x0, y0, x1, y1) {
		// https://cubic-bezier.com/

		if (ratio <= 0) return 0;
		if (ratio >= 1) return 1;
		if (x0 === y0 && x1 === y1) return ratio; // linear

		const slopeFromT = (t, A, B, C) => {
			return 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
		};

		const xFromT = (t, A, B, C, D) => {
			return A * (t * t * t) + B * (t * t) + C * t + D;
		};

		const yFromT = (t, E, F, G, H) => {
			let tt = t * t;
			return E * (tt * t) + F * tt + G * t + H;
		};

		let x0a = 0; // initial x
		let y0a = 0; // initial y
		let x1a = x0; // 1st influence x
		let y1a = y0; // 1st influence y
		let x2a = x1; // 2nd influence x
		let y2a = y1; // 2nd influence y
		let x3a = 1; // final x
		let y3a = 1; // final y

		let A = x3a - 3.0 * x2a + 3.0 * x1a - x0a;
		let B = 3.0 * x2a - 6.0 * x1a + 3.0 * x0a;
		let C = 3.0 * x1a - 3.0 * x0a;
		let D = x0a;

		let E = y3a - 3.0 * y2a + 3.0 * y1a - y0a;
		let F = 3.0 * y2a - 6.0 * y1a + 3.0 * y0a;
		let G = 3.0 * y1a - 3.0 * y0a;
		let H = y0a;

		let current = ratio;
		let i, currentx, currentslope;
		for (i = 0; i < 100; i++) {
			currentx = xFromT(current, A, B, C, D);
			currentslope = slopeFromT(current, A, B, C);
			if (currentslope === Infinity) currentslope = ratio;
			current -= (currentx - ratio) * currentslope;
			current = Math.min(Math.max(current, 0.0), 1.0);
		}

		return yFromT(current, E, F, G, H);
	}
}

export default new Ease();
