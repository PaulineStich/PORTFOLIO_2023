vec2 encodeNormal (vec3 n) {
    float p = sqrt(n.z * 8.0 + 8.0);
    return n.xy / p + 0.5;
}
