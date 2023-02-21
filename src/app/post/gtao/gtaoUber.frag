#ifdef RENDER_NORMAL
varying vec3 v_viewNormal;
#else
varying vec3 v_viewPosition;
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/depth.glsl.js
varying vec2 v_highPrecisionZW;
#endif

void main () {
	#ifdef RENDER_NORMAL
	gl_FragColor = vec4(normalize(v_viewNormal) * 0.5 + 0.5, 1.0);
	#else
	float fragCoordZ = 0.5 * v_highPrecisionZW.x / v_highPrecisionZW.y + 0.5;
	vec3 viewPosition = v_viewPosition;
	viewPosition.z *= -1.0;
	gl_FragColor = vec4(viewPosition, fragCoordZ);
	#endif
}
