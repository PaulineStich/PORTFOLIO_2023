// https://wickedengine.net/2019/09/22/improved-normal-reconstruction-from-depth/

// by default using the WebGL high res depth texture
uniform sampler2D u_viewPositionDepthTexture;
uniform vec2 u_scaledTextureSize;

varying vec2 v_uv;

float dot2(vec3 v) {
	return dot(v, v);
}

void main () {
	// vec3 viewPosition = texture2D(u_viewPositionDepthTexture, v_uv).xyz;
	// vec3 normal = normalize(cross(dFdx(viewPosition), dFdy(viewPosition)));

	// TODO FIX THIS

	vec3 delta = vec3(1.0 / u_scaledTextureSize, 0.0);
	vec3 c = texture2D(u_viewPositionDepthTexture, v_uv).xyz;
	vec3 l = texture2D(u_viewPositionDepthTexture, v_uv - delta.xz).xyz - c;
	vec3 b = texture2D(u_viewPositionDepthTexture, v_uv - delta.zy).xyz - c;
	vec3 r = texture2D(u_viewPositionDepthTexture, v_uv + delta.xz).xyz - c;
	vec3 t = texture2D(u_viewPositionDepthTexture, v_uv + delta.zy).xyz - c;

	// vec2 dir = vec2(abs(l.z) - abs(r.z), abs(b.z) - abs(t.z));

	// vec3 dx = dir.x > 0.0 ? r : l;
	// vec3 dy = dir.y > 0.0 ? t : b;

	// vec3 normal = normalize(cross(dx, dy));
	// if (normal.z < 0.0) normal *= -1.0;

	vec3 normal = normalize(cross(b, r));
	// vec3 normal = normalize(cross(r, t))
	// + normalize(cross(t, l))
	// + normalize(cross(l, b))
	// + normalize(cross(b, r));

	normal = normalize(normal);
	normal.xy *= -1.0;

	gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);

}
