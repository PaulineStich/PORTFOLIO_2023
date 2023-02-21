uniform mat4 u_textureMatrix;

varying vec2 v_uv;
varying vec2 v_uv2;
varying vec4 v_reflectionTextureUv;
varying vec3 v_worldPosition;

void main () {

	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;

	vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	v_reflectionTextureUv = u_textureMatrix * vec4( worldPosition, 1.0 );

	v_uv = worldPosition.xz * 0.08;
	v_uv2 = worldPosition.xz * 0.19 + 0.321;
}
