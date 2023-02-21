
vec2 packFloatRG(float v) {
    vec2 enc = vec2(1.0, 255.0) * v;
    enc = fract (enc);
    enc.x -= enc.y / 255.0;
    return enc;
}

vec2 packHalfFloat (float v, float divider) {
    return packFloatRG(v / divider + 0.5);
}

vec2 packUnsignedHalfFloat (float v, float divider) {
    return packFloatRG(v / divider);
}

float unpackRGFloat(vec2 enc) {
    return dot( enc, vec2(1.0, 1.0/255.0) );
}

float unpackHalfFloat (vec2 enc, float divider) {
    return (unpackRGFloat(enc) - 0.5) * divider;
}

float unpackUnsignedHalfFloat (vec2 enc, float divider) {
    return unpackRGFloat(enc) * divider;
}

