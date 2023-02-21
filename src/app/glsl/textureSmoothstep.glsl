
// http://www.iquilezles.org/www/articles/texture/texture.htm
vec4 textureSmoothstep(sampler2D t, vec2 texCoords, vec2 textureSize) {
    texCoords = texCoords * textureSize + 0.5;
    vec2 iTexCoords = floor( texCoords );
    vec2 fTexCoords = fract( texCoords );
    texCoords = iTexCoords + fTexCoords*fTexCoords*(3.0-2.0*fTexCoords);
    texCoords = (texCoords - 0.5)/textureSize;
    return texture2D( t, texCoords );
}
