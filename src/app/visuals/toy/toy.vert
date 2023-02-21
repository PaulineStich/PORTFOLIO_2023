
attribute float ao;
attribute float thickness;

varying vec3 v_viewPosition;
varying vec3 v_worldPosition;
varying vec3 v_viewNormal;
varying float v_ao;
varying float v_thickness;

void main () {

	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;

	v_viewPosition = mvPosition.xyz;
	v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	v_viewNormal = normalMatrix * normal;
	v_ao = ao;
	v_thickness = thickness;
}
