uniform float u_lightScatterDivider;
uniform float u_lightScatterPowInv;

float getScatter(vec3 start, vec3 dir, vec3 lightPos, float d) {
  // light to ray origin
  vec3 q = start - lightPos;

  // coefficients
  float b = dot(dir, q);
  float c = dot(q, q);

  // evaluate integral
  // float s = 1.0 / sqrt(c - b*b);
  float t = c - b*b;
  // float s = t <= 0.0 ? 1.0 : 1.0 / sqrt(t);
  float s = 1.0 / sqrt(max(0.0001, t));
  float l = s * (atan( (d + b) * s) - atan( b*s ));

  return pow(abs(l / u_lightScatterDivider), u_lightScatterPowInv);
}


