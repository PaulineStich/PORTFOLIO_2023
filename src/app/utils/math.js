class MathUtils {
	PI = Math.PI;
	PI2 = this.PI * 2;
	HALF_PI = this.PI * 0.5;
	DEG2RAD = this.PI / 180.0;
	RAD2DEG = 180.0 / this.PI;

	map(x, a, b, c, d) {
		return ((x - a) * (d - c)) / (b - a) + c;
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}

	step(edge, val) {
		return val < edge ? 0 : 1;
	}

	clamp(val, min, max) {
		return val < min ? min : val > max ? max : val;
	}

	mix(min, max, ratio) {
		return min + (max - min) * ratio;
	}

	cMix(min, max, ratio) {
		return min + (max - min) * this.clamp(ratio, 0, 1);
	}

	unMix(min, max, val) {
		return (val - min) / (max - min);
	}

	cUnMix(min, max, val) {
		return this.clamp((val - min) / (max - min), 0, 1);
	}

	saturate(val) {
		return this.clamp(val, 0, 1);
	}

	fit(val, min, max, toMin, toMax, ease) {
		val = this.cUnMix(min, max, val);
		if (ease) val = ease(val);
		return toMin + val * (toMax - toMin);
	}

	loop(v, min, max) {
		v -= min;
		max -= min;
		return (v < 0 ? (max - (Math.abs(v) % max)) % max : v % max) + min;
	}

	normalize(val, min, max) {
		return Math.max(0, Math.min(1, val - min / max - min));
	}

	smoothstep(edge0, edge1, val) {
		val = this.cUnMix(edge0, edge1, val);
		return val * val * (3 - val * 2);
	}

	fract(val) {
		return val - Math.floor(val);
	}

	hash(val) {
		return this.fract(Math.sin(val) * 43758.5453123);
	}

	hash2(val1, val2) {
		return this.fract(Math.sin(val1 * 12.9898 + val2 * 4.1414) * 43758.5453);
	}

	sign(val) {
		return val ? (val < 0 ? -1 : 1) : 0;
	}

	isPowerOfTwo(val) {
		return (val & -val) === val;
	}

	powerTwoCeilingBase(val) {
		return Math.ceil(Math.log(val) / Math.log(2));
	}

	powerTwoCeiling(val) {
		if (this.isPowerOfTwo(val)) return val;
		return 1 << this.powerTwoCeilingBase(val);
	}

	powerTwoFloorBase(val) {
		return Math.floor(Math.log(val) / Math.log(2));
	}

	powerTwoFloor(val) {
		if (this.isPowerOfTwo(val)) return val;
		return 1 << this.powerTwoFloorBase(val);
	}

	latLngBearing(lat1, lng1, lat2, lng2) {
		let y = Math.sin(lng2 - lng1) * Math.cos(lat2);
		let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
		return Math.atan2(y, x);
	}

	distance(x1, y1, x2, y2) {
		let dX = x1 - x2;
		let dY = y1 - y2;

		return Math.hypot(dX, dY);
	}

	distanceTo(dX, dY) {
		return Math.sqrt(dX * dX + dY * dY);
	}

	distanceSqrTo(dX, dY) {
		return dX * dX + dY * dY;
	}

	distanceTo3(dX, dY, dZ) {
		return Math.sqrt(dX * dX + dY * dY + dZ * dZ);
	}

	distanceSqrTo3(dX, dY, dZ) {
		return dX * dX + dY * dY + dZ * dZ;
	}

	latLngDistance(lat1, lng1, lat2, lng2) {
		let tLat = Math.sin((lat2 - lat1) / 2);
		let tLng = Math.sin((lng2 - lng1) / 2);
		let a = tLat * tLat + Math.cos(lat1) * Math.cos(lat2) * tLng * tLng;
		return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	getAngle = (x, y) => {
		return (Math.atan2(y, x) * 180) / Math.PI;
	};

	cubicBezier(p0, p1, p2, p3, t) {
		let c = (p1 - p0) * 3;
		let b = (p2 - p1) * 3 - c;
		let a = p3 - p0 - c - b;
		let t2 = t * t;
		let t3 = t2 * t;
		return a * t3 + b * t2 + c * t + p0;
	}

	cubicBezierFn(p0, p1, p2, p3) {
		let c = (p1 - p0) * 3;
		let b = (p2 - p1) * 3 - c;
		let a = p3 - p0 - c - b;
		return (t) => {
			let t2 = t * t;
			let t3 = t2 * t;
			return a * t3 + b * t2 + c * t + p0;
		};
	}

	normalizeAngle(angle) {
		angle += this.PI;
		angle = angle < 0 ? this.PI2 - Math.abs(angle % PI2) : angle % this.PI2;
		angle -= this.PI;
		return angle;
	}

	closestAngleTo(from, to) {
		return from + this.normalizeAngle(to - from);
	}

	randomRange(min, max) {
		return min + Math.random() * (max - min);
	}

	randomRangeInt(min, max) {
		return Math.floor(this.randomRange(min, max + 1));
	}

	padZero(num, size) {
		if (num.toString().length >= size) {
			return num;
		} else {
			return (Math.pow(10, size) + Math.floor(num)).toString().substring(1);
		}
	}

	getSeedRandomFn(str) {
		let h1 = 1779033703,
			h2 = 3144134277,
			h3 = 1013904242,
			h4 = 2773480762;
		for (let i = 0, k; i < str.length; i++) {
			k = str.charCodeAt(i);
			h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
			h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
			h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
			h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
		}
		return _sfc32(Math.imul(h3 ^ (h1 >>> 18), 597399067), Math.imul(h4 ^ (h2 >>> 22), 2869860233), Math.imul(h1 ^ (h3 >>> 17), 951274213), Math.imul(h2 ^ (h4 >>> 19), 2716044179));
	}
}

function _sfc32(a, b, c, d) {
	return function () {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		var t = (((a + b) | 0) + d) | 0;
		d = (d + 1) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}

export default new MathUtils();
