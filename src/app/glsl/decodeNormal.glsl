vec3 decodeNormal (vec2 enc) {
  vec2 fenc = enc * 4.0 - 2.0;
  float f = dot(fenc, fenc);
  // if g is zero, it will be an issue
  // float g = max(0.001, sqrt( max(1.0 - f, 0.0) * 0.25));
  // vec3 n;
  // n.xy = fenc*g;
  // n.z = 1.0 - f*0.5;
  // return n;

  // seems to be okay if g is 1.0;
  return vec3(fenc, 1.0 - f * 0.5);
}
