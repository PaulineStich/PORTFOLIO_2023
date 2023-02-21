uniform sampler2D u_depthTexture;

uniform vec4 u_projInfo;
uniform vec2 u_clipInfo;
uniform vec2 u_scaledTextureSize;

uniform mat4 u_projectionMatrix;
uniform mat4 u_projectionMatrixInverse;

varying vec2 v_uv;

// http://www.geeks3d.com/20091216/geexlab-how-to-visualize-the-depth-buffer-in-glsl/
float getLinearDepth( in float fragCoordZ ) {
	float near = u_clipInfo.x;
	float far = u_clipInfo.y;
	return (2.0 * near) / (far + near - fragCoordZ * (far - near));
}



float perspectiveDepthToViewZ( const in float invClipZ) {
	float near = u_clipInfo.x;
	float far = u_clipInfo.y;
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
	float clipW = u_projectionMatrix[2][3] * viewZ + u_projectionMatrix[3][3];
	vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
	clipPosition *= clipW; // unprojection.
	return ( u_projectionMatrixInverse * clipPosition ).xyz;
}

vec3 getViewPosition( in vec2 uv, in float d ) {
	float near = u_clipInfo.x;
	float far = u_clipInfo.y;
	vec3 pos = vec3(near + d * ( far - near ));
	pos.xy = ( uv * u_projInfo.xy + u_projInfo.zw ) * pos.z;
	return pos;
}

void main () {
	float depth = texture2D(u_depthTexture, v_uv).r;
	float linearDepth = getLinearDepth(depth);
	gl_FragColor = vec4(getViewPosition(v_uv, linearDepth), depth);

	// float depth = texture2D(u_depthTexture, v_uv).r;
	// float viewZ = 1.0 - perspectiveDepthToViewZ( depth );
	// gl_FragColor = vec4(getViewPosition(v_uv, depth, viewZ), 1.0);
}
