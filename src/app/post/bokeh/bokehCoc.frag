uniform sampler2D u_texture;
uniform sampler2D u_depthTexture;
uniform vec2 u_texelSize;
uniform float u_focusDistance;
uniform float u_lensCoeff;
uniform float u_maxCoC;
uniform float u_rcpMaxCoC;
uniform float u_cameraNear;
uniform float u_cameraFar;

varying vec2 v_uv;

// Max between three components
float max3(vec3 xyz) { return max(xyz.x, max(xyz.y, xyz.z)); }

#ifndef USE_FLOAT
uniform float u_hashNoise;
float hash13(vec3 p3) {
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
#endif

// Fragment shader: Downsampling, prefiltering and CoC calculation
float getViewZ (vec2 uv) {
	float depth = texture2D(u_depthTexture, uv).r * 2.0 - 1.0;
	return 2.0 * u_cameraNear * u_cameraFar / (u_cameraFar + u_cameraNear - depth * (u_cameraFar - u_cameraNear));
}

void main () {
    // Sample source colors.
    vec3 duv = u_texelSize.xyx * vec3(0.5, 0.5, -0.5);
    vec3 c0 = texture2D(u_texture, v_uv - duv.xy).rgb;
    vec3 c1 = texture2D(u_texture, v_uv - duv.zy).rgb;
    vec3 c2 = texture2D(u_texture, v_uv + duv.zy).rgb;
    vec3 c3 = texture2D(u_texture, v_uv + duv.xy).rgb;

    // Sample linear depths.
	vec2 uvAlt = v_uv; // yFlippedUV? https://github.com/keijiro/KinoBokeh/blob/master/Assets/Kino/Bokeh/Shader/Common.cginc
    float d0 = getViewZ(uvAlt - duv.xy);
    float d1 = getViewZ(uvAlt - duv.zy);
    float d2 = getViewZ(uvAlt + duv.zy);
    float d3 = getViewZ(uvAlt + duv.xy);
    vec4 depths = vec4(d0, d1, d2, d3);

    // Calculate the radiuses of CoCs at these sample points.
    float focusDistance = u_focusDistance;
    // focusDistance = getViewZ(vec2(0.5));
    

    vec4 cocs = (depths - focusDistance) * u_lensCoeff / depths;
    cocs = clamp(cocs, -u_maxCoC, u_maxCoC);

    // Premultiply CoC to reduce background bleeding.
    vec4 weights = clamp(abs(cocs) * u_rcpMaxCoC, vec4(0.0), vec4(1.0));

// #if defined(PREFILTER_LUMA_WEIGHT)
    // Apply luma weights to reduce flickering.
    // Inspired by goo.gl/j1fhLe goo.gl/mfuZ4h
    weights.x *= 1.0 / (max3(c0) + 1.0);
    weights.y *= 1.0 / (max3(c1) + 1.0);
    weights.z *= 1.0 / (max3(c2) + 1.0);
    weights.w *= 1.0 / (max3(c3) + 1.0);
// #endif

    // Weighted average of the color samples
    vec3 avg = c0 * weights.x + c1 * weights.y + c2 * weights.z + c3 * weights.w;
    avg /= dot(weights, vec4(1.0));

    // Output CoC = average of CoCs
    float coc = dot(cocs, vec4(0.25));

    // Premultiply CoC again.
    avg *= smoothstep(0.0, u_texelSize.y * 2.0, abs(coc));

    gl_FragColor = vec4(avg, coc);
    #ifndef USE_FLOAT
    gl_FragColor = sign(gl_FragColor) * sqrt(abs(gl_FragColor));
    gl_FragColor = gl_FragColor * 0.5 + 0.5 + hash13(vec3(gl_FragCoord.xy, u_hashNoise)) / 255.0;
    #endif
}