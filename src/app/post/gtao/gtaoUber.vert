#ifdef RENDER_NORMAL
varying vec3 v_viewNormal;
#else
varying vec3 v_viewPosition;
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/depth.glsl.js
varying vec2 v_highPrecisionZW;
#endif

void main () {
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;

	#ifdef RENDER_NORMAL
	v_viewNormal = normalMatrix * normal;
	#else
	v_viewPosition = mvPosition.xyz;
	v_highPrecisionZW = gl_Position.zw;
	#endif
}
