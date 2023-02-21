import properties from '@app/core/properties';
import * as Leap from 'leapjs';
import MinSignal from 'min-signal';

import * as THREE from 'three';

class LeapControls {
	isActive = false;
	hasTracked = false;
	hadTracked = false;
	controller;
	currentFrame;

	position = new THREE.Vector3();
	quaternion = new THREE.Quaternion();

	pitch = 0;
	yaw = 0;
	roll = 0;

	isGrabbing = false;
	wasGrabbing = false;
	onGrabbed = new MinSignal();
	onGrabbReleased = new MinSignal();
	onActivated = new MinSignal();
	onTracked = new MinSignal();
	onLost = new MinSignal();
	onTrackUpdated = new MinSignal();

	grabThreshold = 0.8;

	init() {
		// let xMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 0.1, 0.1).translate(0.5, 0, 0), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
		// let yMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 1, 0.1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
		// let zMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 0.1, 1).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
		// let test = new THREE.Object3D();
		// let container = new THREE.Object3D();
		// test.add(xMesh);
		// test.add(yMesh);
		// test.add(zMesh);
		// container.add(test);
		// container.position.set(0, 0, 0);
		// properties.scene.add(container);

		let v = new THREE.Vector3();
		let q = new THREE.Quaternion();
		let e = new THREE.Euler();

		this.controller = new Leap.Controller({ enableGestures: true });
		this.controller.loop((frame) => {
			this.currentFrame = frame;
			let hasHand = !!frame.hands.length;

			this.hadTracked = this.hasTracked;
			this.hasTracked = hasHand;
			let hand;

			if (hasHand) {
				this.isActive = true;
				hand = frame.hands[0];

				this.wasGrabbing = this.isGrabbing;
				this.isGrabbing = hand.grabStrength > this.grabThreshold;

				this.pitch = hand.pitch();
				this.yaw = hand.yaw();
				this.roll = hand.roll();

				e.set(this.pitch, this.yaw, this.roll);
				q.setFromEuler(e);
				v.fromArray(hand.palmPosition).multiplyScalar(1 / 100);

				this.quaternion.copy(q);

				// test.position.copy(v);
				// test.quaternion.copy(q);
			}

			if (this.hasTracked && !this.hadTracked) {
				this.onTracked.dispatch(hand);
			} else if (!this.hasTracked && this.hadTracked) {
				this.onLost.dispatch();
			}

			if (hasHand) {
				this.onTrackUpdated.dispatch();
				if (this.isGrabbing && !this.wasGrabbing) {
					this.onGrabbed.dispatch(hand);
				} else if (!this.isGrabbing && this.wasGrabbing) {
					this.onGrabbReleased.dispatch(hand);
				}
			}
		});
	}
}

export default new LeapControls();
