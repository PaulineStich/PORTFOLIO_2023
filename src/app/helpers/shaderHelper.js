import * as THREE from 'three';

class ShaderHelper {
	glslifyStrip(snippet) {
		return snippet.replace(/#define\sGLSLIFY\s./, '');
	}

	addChunk(key, snippet) {
		THREE.ShaderChunk[key] = this.glslifyStrip(snippet);
	}

	_wrapInclude(str) {
		return '#include <' + str + '>';
	}

	insertBefore(shader, ref, snippet, isInclude) {
		const _ref = isInclude ? this._wrapInclude(ref) : ref;
		return shader.replace(ref, this.glslifyStrip(snippet) + '\n' + _ref);
	}

	insertAfter(shader, ref, snippet, isInclude) {
		const _ref = isInclude ? this._wrapInclude(ref) : ref;
		return shader.replace(_ref, _ref + '\n' + this.glslifyStrip(snippet) + '\n');
	}

	replace(shader, ref, snippet, isInclude) {
		const _ref = isInclude ? this._wrapInclude(ref) : ref;
		return shader.replace(_ref, '\n' + this.glslifyStrip(snippet) + '\n');
	}
}

export default new ShaderHelper();
