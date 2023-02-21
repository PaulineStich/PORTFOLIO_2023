float samplePackedR (sampler2D tex0, vec2 uv, float divider) {
    vec4 c0 = texture2D(tex0, uv);
    return unpackHalfFloat(c0.xy, divider);
}

float samplePackedUnsignedR (sampler2D tex0, vec2 uv, float divider) {
    vec4 c0 = texture2D(tex0, uv);
    return unpackUnsignedHalfFloat(c0.xy, divider);
}

vec2 samplePackedRG (sampler2D tex0, vec2 uv, vec2 divider) {
    vec4 c0 = texture2D(tex0, uv);
    return vec2(
        unpackHalfFloat(c0.xy, divider.x),
        unpackHalfFloat(c0.zw, divider.y)
    );
}

vec2 samplePackedUnsignedRG (sampler2D tex0, vec2 uv, vec2 divider) {
    vec4 c0 = texture2D(tex0, uv);
    return vec2(
        unpackUnsignedHalfFloat(c0.xy, divider.x),
        unpackUnsignedHalfFloat(c0.zw, divider.y)
    );
}

vec3 samplePackedRGB (sampler2D tex0, sampler2D tex1, vec2 uv, vec3 divider) {
    vec4 c0 = texture2D(tex0, uv);
    vec4 c1 = texture2D(tex1, uv);
    return vec3(
        unpackHalfFloat(c0.xy, divider.x),
        unpackHalfFloat(c0.zw, divider.y),
        unpackHalfFloat(c1.xy, divider.z)
    );
}

vec3 samplePackedUnsignedRGB (sampler2D tex0, sampler2D tex1, vec2 uv, vec3 divider) {
    vec4 c0 = texture2D(tex0, uv);
    vec4 c1 = texture2D(tex1, uv);
    return vec3(
        unpackUnsignedHalfFloat(c0.xy, divider.x),
        unpackUnsignedHalfFloat(c0.zw, divider.y),
        unpackUnsignedHalfFloat(c1.xy, divider.z)
    );
}

vec4 samplePackedRGBA (sampler2D tex0, sampler2D tex1, vec2 uv, vec4 divider) {
    vec4 c0 = texture2D(tex0, uv);
    vec4 c1 = texture2D(tex1, uv);
    return vec4(
        unpackHalfFloat(c0.xy, divider.x),
        unpackHalfFloat(c0.zw, divider.y),
        unpackHalfFloat(c1.xy, divider.z),
        unpackHalfFloat(c1.zw, divider.w)
    );
}

vec4 samplePackedUnsignedRGBA (sampler2D tex0, sampler2D tex1, vec2 uv, vec4 divider) {
    vec4 c0 = texture2D(tex0, uv);
    vec4 c1 = texture2D(tex1, uv);
    return vec4(
        unpackUnsignedHalfFloat(c0.xy, divider.x),
        unpackUnsignedHalfFloat(c0.zw, divider.y),
        unpackUnsignedHalfFloat(c1.xy, divider.z),
        unpackUnsignedHalfFloat(c1.zw, divider.w)
    );
}
