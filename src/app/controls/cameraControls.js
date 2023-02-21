import browser from '@core/browser';
import properties from '@core/properties';
import settings from '@core/settings';
import input from '@input/input';

import * as THREE from 'three';

import { BrownianMotion } from '@motions/BrownianMotion';

import { OrbitControls } from '@controls/OrbitControls';
import DeviceOrientationControls from '@controls/DeviceOrientationControls';
import math from '@app/utils/math';

class CameraControls {
	useOrbitControls = true;

	preInit(cfg) {
		this.DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0.5, 5);
		this.DEFAULT_LOOKAT_POSITION = new THREE.Vector3(0, 0.5, 0);

		this._brownianMotion = null;
		this._orbitControls = null;
		this._orbitCamera = null;
		this._camera = null;

		this._deviceOrientationControls = null;
		this._baseDeviceControlQuaternion = null;
		this._targetDeviceControlQuaternion = null;
		this._deviceOrientationCamera = null;
		this._hasDeviceOrientationControlValues = false;

		this._q = new THREE.Quaternion();
		this._e = new THREE.Euler();
		this._v1 = new THREE.Vector3();
		this._v2 = new THREE.Vector3();

		this._camera = properties.camera;

		this._camera.position.copy(this.DEFAULT_CAMERA_POSITION);
		this._brownianMotion = new BrownianMotion();

		if (this.useOrbitControls === true) {
			this._orbitCamera = this._camera.clone();
			this._orbitControls = new OrbitControls(this._orbitCamera, properties.canvas);
			this._orbitControls.enableDamping = true;
			this._orbitControls.target0.copy(this.DEFAULT_LOOKAT_POSITION);
			this._orbitControls.reset();
		}

		if (browser.isMobile) {
			this._deviceOrientationCamera = new THREE.Camera();
			this._baseDeviceControlQuaternion = new THREE.Quaternion();
			this._targetDeviceControlQuaternion = new THREE.Quaternion();
			this._deviceOrientationControls = new DeviceOrientationControls(this._deviceOrientationCamera);
			properties.onFirstClicked.addOnce(() => {
				this._deviceOrientationControls.connect();
			});
		} else {
			// leapControls.init();
		}
	}

	init() {
		return;
	}

	resize(width, height) {
		return;
	}

	update(dt) {
		let camera = this._camera;
		// reset
		camera.matrix.identity();
		camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
		camera.position.copy(this.DEFAULT_CAMERA_POSITION);
		camera.lookAt(this.DEFAULT_LOOKAT_POSITION);

		if (browser.isMobile) {
			this._deviceOrientationControls.update();
		}

		if (this.useOrbitControls === true) {
			// orbitControls
			this._orbitControls.update();
			this._orbitCamera.updateMatrix();
			this._orbitCamera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
		}

		this._v1.set(0, 0, -1).applyQuaternion(camera.quaternion);
		if (this.useOrbitControls === true) {
			this.cameraDistance = this._v2.copy(this._orbitControls.target).sub(camera.position).dot(this._v1);
		} else {
			this.cameraDistance = this._v2.copy(this.DEFAULT_LOOKAT_POSITION).sub(camera.position).dot(this._v1);
		}

		// Dolly Zoom
		let fov = camera.fov;
		camera.fov = math.fit(this.cameraDistance, 2, 8, 75, 20);
		let d = this.cameraDistance;
		d = (d * Math.tan(((fov / 360) * Math.PI) / 2)) / Math.tan(((camera.fov / 360) * Math.PI) / 2) - d;
		camera.translateZ(d);
		camera.updateProjectionMatrix();
		camera.fov = fov;
		this.cameraDistance += d;

		if (browser.isMobile) {
			this._deviceOrientationControls.update();
			if (this._deviceOrientationControls.hasValue) {
				if (!this._hasDeviceOrientationControlValues) {
					this._targetDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion);
					this._baseDeviceControlQuaternion.copy(this._deviceOrientationCamera.quaternion);
				}
				this._targetDeviceControlQuaternion.slerp(this._deviceOrientationCamera.quaternion, 0.08);
				this._baseDeviceControlQuaternion.slerp(this._targetDeviceControlQuaternion, 0.08);

				this._q.copy(this._baseDeviceControlQuaternion).invert().multiply(this._targetDeviceControlQuaternion);
				this._hasDeviceOrientationControlValues = true;
				camera.quaternion.multiply(this._q);
			}
		} else {
			// mouse move camera
			camera.translateZ(this.cameraDistance * -1);

			let targetCameraLookAtX = math.clamp(input.mouseXY.y, -1, 1) * properties.cameraLookStrength;
			let targetCameraLookAtY = math.clamp(-input.mouseXY.x, -1, 1) * properties.cameraLookStrength;
			properties.cameraLookX += (targetCameraLookAtX - properties.cameraLookX) * properties.cameraLookEaseDamp;
			properties.cameraLookY += (targetCameraLookAtY - properties.cameraLookY) * properties.cameraLookEaseDamp;

			this._e.set(properties.cameraLookX, properties.cameraLookY, 0.0);
			this._q.setFromEuler(this._e);
			camera.quaternion.multiply(this._q);
			camera.translateZ(this.cameraDistance);
		}

		camera.matrix.compose(camera.position, camera.quaternion, camera.scale);

		// camera shake
		this._brownianMotion.positionAmplitude = properties.cameraShakePositionStrength;
		this._brownianMotion.positionFrequency = properties.cameraShakePositionSpeed;
		this._brownianMotion.rotationAmplitude = properties.cameraShakeRotationStrength;
		this._brownianMotion.rotationFrequency = properties.cameraShakeRotationSpeed;

		this._brownianMotion.update(dt);
		camera.matrix.multiply(this._brownianMotion.matrix);
		camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);

		// update camera distance
		this._v1.set(0, 0, -1).applyQuaternion(camera.quaternion);
		if (this.useOrbitControls === true) {
			properties.cameraDistance = this._v2.copy(this._orbitControls.target).sub(camera.position).dot(this._v1);
		}
	}
}

export default new CameraControls();
