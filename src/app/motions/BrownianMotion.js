import * as THREE from 'three';
import math from '@utils/math';

// ported from https://github.com/keijiro/Klak/blob/master/Assets/Klak/Motion/Runtime/BrownianMotion.cs
class Simple1DNoise {
	static MAX_VERTICES = 256;
	static MAX_VERTICES_MASK = Simple1DNoise.MAX_VERTICES - 1;
	_scale = 1;
	_amplitude = 1;
	_r = [];

	constructor() {
		for (let i = 0; i < Simple1DNoise.MAX_VERTICES; ++i) {
			this._r.push(Math.random() - 0.5);
		}
	}

	getVal(x) {
		const scaledX = x * this._scale;
		const xFloor = Math.floor(scaledX);
		const t = scaledX - xFloor;
		const tRemapSmoothstep = t * t * (3 - 2 * t);

		const xMin = xFloor & Simple1DNoise.MAX_VERTICES_MASK;
		const xMax = (xMin + 1) & Simple1DNoise.MAX_VERTICES_MASK;

		const y = math.mix(this._r[xMin], this._r[xMax], tRemapSmoothstep);
		return y * this._amplitude;
	}

	get amplitude() {
		return this._amplitude;
	}
	set amplitude(v) {
		this._amplitude = v;
	}
	get scale() {
		return this._scale;
	}
	set scale(v) {
		this._scale = v;
	}
}

const _e = new THREE.Euler();
const _v = new THREE.Vector3();

export class BrownianMotion {
	_position = new THREE.Vector3();
	_rotation = new THREE.Quaternion();
	_scale = new THREE.Vector3(1, 1, 1);
	_matrix = new THREE.Matrix4();

	_enablePositionNoise = true;
	_enableRotationNoise = true;

	_positionFrequency = 0.25;
	_rotationFrequency = 0.25;

	_positionAmplitude = 0.3;
	_rotationAmplitude = 0.003;

	_positionScale = new THREE.Vector3(1, 1, 1);
	_rotationScale = new THREE.Vector3(1, 1, 0);

	_positionFractalLevel = 3;
	_rotationFractalLevel = 3;

	_times = new Float32Array(6);

	_noise = new Simple1DNoise();
	static FBM_NORM = 1 / 0.75;

	constructor() {
		this.rehash();
	}

	rehash() {
		for (let i = 0; i < 6; i++) {
			this._times[i] = Math.random() * -10000;
		}
	}

	_fbm(x, octave) {
		let f = 0.0;
		let w = 0.5;
		for (let i = 0; i < octave; i++) {
			f += w * this._noise.getVal(x);
			x *= 2.0;
			w *= 0.5;
		}
		return f;
	}

	update(_dt) {
		const dt = _dt === undefined ? 1000 / 60 : _dt;
		if (this._enablePositionNoise) {
			for (let i = 0; i < 3; i++) {
				this._times[i] += this._positionFrequency * dt;
			}

			_v.set(this._fbm(this._times[0], this._positionFractalLevel), this._fbm(this._times[1], this._positionFractalLevel), this._fbm(this._times[2], this._positionFractalLevel));

			_v.multiply(this._positionScale);
			_v.multiplyScalar(this._positionAmplitude * BrownianMotion.FBM_NORM);

			this._position.copy(_v);
		}

		if (this._enableRotationNoise) {
			for (let i = 0; i < 3; i++) {
				this._times[i + 3] += this._rotationFrequency * dt;
			}

			_v.set(this._fbm(this._times[3], this._rotationFractalLevel), this._fbm(this._times[4], this._rotationFractalLevel), this._fbm(this._times[5], this._rotationFractalLevel));

			_v.multiply(this._rotationScale);
			_v.multiplyScalar(this._rotationAmplitude * BrownianMotion.FBM_NORM);
			_e.set(_v.x, _v.y, _v.z);
			this._rotation.setFromEuler(_e);
		}
		this._matrix.compose(this._position, this._rotation, this._scale);
	}

	get positionAmplitude() {
		return this._positionAmplitude;
	}
	set positionAmplitude(v) {
		this._positionAmplitude = v;
	}
	get positionFrequency() {
		return this._positionFrequency;
	}
	set positionFrequency(v) {
		this._positionFrequency = v;
	}
	get rotationAmplitude() {
		return this._rotationAmplitude;
	}
	set rotationAmplitude(v) {
		this._rotationAmplitude = v;
	}
	get rotationFrequency() {
		return this._rotationFrequency;
	}
	set rotationFrequency(v) {
		this._rotationFrequency = v;
	}
	get matrix() {
		return this._matrix;
	}
	set matrix(v) {
		this._matrix = v;
	}
}
