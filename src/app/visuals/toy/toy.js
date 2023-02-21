import properties from '@core/properties';
import settings from '@core/settings';

import vert from './toy.vert';
import frag from './toy.frag';

import * as THREE from 'three';
import blueNoise from '@app/effects/blueNoise/blueNoise';

class Toy {
	container = new THREE.Object3D();

	lightSphere = null;
	mesh = null;
	texture = null;

	preInit() {
		properties.loader.add(settings.MODEL_PATH + 'toy.buf', {
			onLoad: (geometry) => this._onModelLoad(geometry),
		});

		this.lightSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff55ff).multiplyScalar(1.5) }));
		this.container.add(this.lightSphere);

		// this.texture = properties.loader.add(settings.TEXTURE_PATH + 'my_texture_here.png', { type: 'texture' }).content;
	}

	init() {
		return;
	}

	_onModelLoad(geometry) {
		// in case you are loading a scene buffer file
		// if (geometry.userData.sceneObject) {
		// 	let meshList = geometry.userData.meshList;
		// 	console.log(meshList[0].userData.material);
		// 	this.container.add(geometry.userData.sceneObject);
		// } else {
		this.mesh = new THREE.Mesh(
			geometry,
			new THREE.ShaderMaterial({
				uniforms: Object.assign(
					{
						u_isReflection: { value: 0 },
						u_lightColor: { value: this.lightSphere.material.color },
						u_lightPosition: { value: new THREE.Vector3(0, 0, 0) },
					},
					blueNoise.sharedUniforms,
				),
				vertexShader: vert,
				fragmentShader: frag,
			}),
		);
		this.container.add(this.mesh);
		// }
	}

	resize(width, height) {
		return;
	}

	update(dt) {
		if (this.mesh) {
			let angle = properties.time;
			this.lightSphere.position.set(Math.cos(angle) * 2.0, 0.75, Math.sin(angle) * 2.0);

			this.mesh.material.uniforms.u_lightPosition.value.copy(this.lightSphere.position);
		}
		return;
	}
}

export default new Toy();
