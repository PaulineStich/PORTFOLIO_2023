import * as THREE from 'three';

/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

class DeviceOrientationControls {
	object = null;
	enabled = true;
	hasValue = false;
	deviceOrientation = {};
	screenOrientation = 0;
	alphaOffset = 0; // radians

	zee = new THREE.Vector3(0, 0, 1);
	euler = new THREE.Euler();
	q0 = new THREE.Quaternion();
	q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

	_onBoundDeviceOrientationChangeEvent;
	_onBoundScreenOrientationChangeEvent;

	constructor(object) {
		this.object = object;
		this.object.rotation.reorder('YXZ');
		this._onBoundDeviceOrientationChangeEvent = this._onDeviceOrientationChangeEvent.bind(this);
		this._onBoundScreenOrientationChangeEvent = this._onScreenOrientationChangeEvent.bind(this);
		this.connect();
	}

	_onDeviceOrientationChangeEvent(event) {
		this.deviceOrientation = event;
	}

	_onScreenOrientationChangeEvent() {
		this.screenOrientation = window.orientation || 0;
	}

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	setObjectQuaternion(quaternion, alpha, beta, gamma, orient) {
		this.euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
		quaternion.setFromEuler(this.euler); // orient the device
		quaternion.multiply(this.q1); // camera looks out the back of the device, not the top
		quaternion.multiply(this.q0.setFromAxisAngle(this.zee, -orient)); // adjust for screen orientation
	}

	connect() {
		this._onBoundScreenOrientationChangeEvent(); // run once on load

		// iOS 13+

		if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
			window.DeviceOrientationEvent.requestPermission()
				.then(function (response) {
					if (response == 'granted') {
						window.addEventListener('orientationchange', this._onBoundScreenOrientationChangeEvent, false);
						window.addEventListener('deviceorientation', this._onBoundDeviceOrientationChangeEvent, false);
					}
				})
				.catch(function (error) {
					// console.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );
				});
		} else {
			window.addEventListener('orientationchange', this._onBoundScreenOrientationChangeEvent, false);
			window.addEventListener('deviceorientation', this._onBoundDeviceOrientationChangeEvent, false);
		}

		this.enabled = true;
	}

	disconnect() {
		window.removeEventListener('orientationchange', this._onBoundScreenOrientationChangeEvent, false);
		window.removeEventListener('deviceorientation', this._onBoundDeviceOrientationChangeEvent, false);

		this.enabled = false;
	}

	update() {
		if (this.enabled === false) return;

		let device = this.deviceOrientation;

		if (device) {
			let alpha = device.alpha ? THREE.Math.degToRad(device.alpha) + this.alphaOffset : 0; // Z

			let beta = device.beta ? THREE.Math.degToRad(device.beta) : 0; // X'

			let gamma = device.gamma ? THREE.Math.degToRad(device.gamma) : 0; // Y''

			let orient = this.screenOrientation ? THREE.Math.degToRad(this.screenOrientation) : 0; // O

			this.setObjectQuaternion(this.object.quaternion, alpha, beta, gamma, orient);

			this.hasValue = device.alpha && device.beta && device.gamma;
		}
	}

	dispose() {
		this.disconnect();
	}
}

export default DeviceOrientationControls;
