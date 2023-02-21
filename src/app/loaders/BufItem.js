import properties from '@core/properties';
import * as THREE from 'three';

const XHRItem = properties.loader.ITEM_CLASSES.xhr;

export default class BufItem extends XHRItem {
	constructor(url, cfg) {
		super(url, { ...cfg, responseType: 'arraybuffer' });
	}

	retrieve() {
		return false;
	}

	_onLoad() {
		if (!this.content) {
			const buffer = this.xmlhttp.response;
			let schematicJsonSize = new Uint32Array(buffer, 0, 1)[0];
			let schematic = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(buffer, 4, schematicJsonSize)));

			let vertexCount = schematic.vertexCount;
			let indexCount = schematic.indexCount;
			let offset = 4 + schematicJsonSize;

			let geometry = new THREE.BufferGeometry();
			let schematicAttributeList = schematic.attributes;
			let hasNormal = false;
			let offsetMap = {};

			for (let i = 0, len = schematicAttributeList.length; i < len; i++) {
				let schematicAttribute = schematicAttributeList[i];
				let id = schematicAttribute.id;
				let dataLength = id === 'indices' ? indexCount : vertexCount;
				let componentSize = schematicAttribute.componentSize;
				let storageType = window[schematicAttribute.storageType];
				let tmpArr = new storageType(buffer, offset, dataLength * componentSize);
				let byteSize = storageType.BYTES_PER_ELEMENT;
				let outArr;
				if (schematicAttribute.needsPack) {
					let packedComponents = schematicAttribute.packedComponents;
					let packedComponentCount = packedComponents.length;
					let isSign = schematicAttribute.storageType.indexOf('Int') === 0;
					let size = 1 << (byteSize * 8);
					let offset = isSign ? size * 0.5 : 0;
					let divider = 1 / size;
					outArr = new Float32Array(dataLength * componentSize);
					for (let j = 0, jk = 0; j < dataLength; j++) {
						for (let k = 0; k < packedComponentCount; k++) {
							let packedComponent = packedComponents[k];
							outArr[jk] = (tmpArr[jk] + offset) * divider * packedComponent.delta + packedComponent.from;
							jk++;
						}
					}
				} else {
					offsetMap[id] = offset;
					outArr = tmpArr;
				}

				if (id === 'normal') hasNormal = true;

				if (id === 'indices') {
					geometry.setIndex(new THREE.BufferAttribute(outArr, 1));
				} else {
					geometry.setAttribute(id, new THREE.BufferAttribute(outArr, componentSize));
				}

				offset += dataLength * componentSize * byteSize;
			}

			let meshType = schematic.meshType;

			let objectList = [];
			if (schematic.sceneData) {
				let sceneData = schematic.sceneData;

				let sceneObject = new THREE.Object3D();
				let meshList = [];

				let indexVertexCount = meshType === 'Mesh' ? 3 : meshType === 'LineSegments' ? 2 : 1;
				for (let i = 0, il = sceneData.length; i < il; i++) {
					let dataItem = sceneData[i];
					let obj;
					if (dataItem.vertexCount == 0) {
						obj = new THREE.Object3D();
					} else {
						let subGeometry = new THREE.BufferGeometry();
						let attribute = geometry.index;
						let arr = attribute.array;
						let arrType = arr.constructor;
						let byteSize = arrType.BYTES_PER_ELEMENT;
						subGeometry.setIndex(new THREE.BufferAttribute(new arr.constructor(arr.buffer, dataItem.faceIndex * attribute.itemSize * byteSize * indexVertexCount + (offsetMap.indices || 0), dataItem.faceCount * attribute.itemSize * indexVertexCount), attribute.itemSize));
						for (let j = 0, jl = subGeometry.index.array.length; j < jl; j++) {
							subGeometry.index.array[j] -= dataItem.vertexIndex;
						}
						for (let id in geometry.attributes) {
							attribute = geometry.attributes[id];
							arr = attribute.array;
							arrType = arr.constructor;
							byteSize = arrType.BYTES_PER_ELEMENT;
							subGeometry.setAttribute(id, new THREE.BufferAttribute(new arr.constructor(arr.buffer, dataItem.vertexIndex * attribute.itemSize * byteSize + (offsetMap[id] || 0), dataItem.vertexCount * attribute.itemSize), attribute.itemSize));
						}

						if (meshType === 'Mesh') {
							obj = new THREE.Mesh(
								subGeometry,
								new THREE.MeshNormalMaterial({
									flatShading: !hasNormal,
								}),
							);
						} else if (meshType === 'LineSegments') {
							obj = new THREE.LineSegments(subGeometry, new THREE.LineBasicMaterial());
						} else {
							obj = new THREE.Points(
								subGeometry,
								new THREE.PointsMaterial({
									sizeAttenuation: false,
									size: 2,
								}),
							);
						}
						meshList.push(obj);
					}
					if (dataItem.parentIndex > -1) {
						objectList[dataItem.parentIndex].add(obj);
					} else {
						sceneObject.add(obj);
					}
					obj.position.fromArray(dataItem.position);
					obj.quaternion.fromArray(dataItem.quaternion);
					obj.scale.fromArray(dataItem.scale);
					obj.name = dataItem.name;
					obj.userData.material = dataItem.material;

					objectList[i] = obj;
				}
				geometry.userData.meshList = meshList;
				geometry.userData.sceneObject = sceneObject;
			}
			this.content = geometry;
		}

		this.xmlhttp = undefined;
		super._onLoad(this);
	}
}
BufItem.type = 'buf';
BufItem.extensions = ['buf'];
BufItem.responseType = 'arraybuffer';
