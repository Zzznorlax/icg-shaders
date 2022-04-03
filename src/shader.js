
var shaders = shaders || {
    other: {},
    gouraud: {},
    flat: {},
    phong: {},
};

shaders.other.vertexShader = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aFrontColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 fragcolor;

void main(void) {
    fragcolor = vec4(aFrontColor.rgb, 1.0);
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.other.fragmentShader = `
precision mediump float;

varying vec4 fragcolor;

void main(void) {
    gl_FragColor = fragcolor;
}
`

shaders.flat.vertexShader = `
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aFrontColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
// uniform mat3 uNMatrix;

varying vec4 vFragcolor;
varying vec3 vVertexPosition;
varying vec3 vLightDirection;

uniform vec3 uPointLightingLocation;

void main(void) {

    vVertexPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    vLightDirection = normalize(uPointLightingLocation - vVertexPosition);

    vFragcolor = vec4(aFrontColor, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.flat.fragmentShader = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec4 vFragcolor;
varying vec3 vLightDirection;
varying vec3 vVertexPosition;

uniform float uMaterialShininess;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;

void main(void) {

	vec3 normal = normalize(cross(dFdx(vVertexPosition), dFdy(vVertexPosition)));

    vec3 reflectionDirection = reflect(-vLightDirection, normal);

    float specularLightWeighting = pow(max(dot(reflectionDirection, normalize(-vVertexPosition.xyz)), 0.0), uMaterialShininess);

    float diffuseLightWeighting = max(dot(normal, vLightDirection), 0.0);

    vec3 lightWeighting = uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;

	gl_FragColor = vec4(vFragcolor.rgb * lightWeighting, vFragcolor.a);
}
`


shaders.gouraud.vertexShader = `
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aFrontColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

varying vec4 vFragcolor;
varying vec3 vNormalDirection;
varying vec3 vVertexPosition;
varying vec3 vLightDirection;

uniform vec3 uPointLightingLocation;

void main(void) {

    vNormalDirection = normalize(uNMatrix * aVertexNormal);

    vVertexPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    vLightDirection = normalize(uPointLightingLocation - vVertexPosition);

    vFragcolor = vec4(aFrontColor, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.gouraud.fragmentShader = `
precision mediump float;

varying vec4 vFragcolor;
varying vec3 vLightDirection;
varying vec3 vNormalDirection;
varying vec3 vVertexPosition;

uniform float uMaterialShininess;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;

void main(void) {

    vec3 reflectionDirection = reflect(-vLightDirection, vNormalDirection);

    float specularLightWeighting = pow(max(dot(reflectionDirection, normalize(-vVertexPosition.xyz)), 0.0), uMaterialShininess);

    float diffuseLightWeighting = max(dot(vNormalDirection, vLightDirection), 0.0);

    vec3 lightWeighting = uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;

	gl_FragColor = vec4(vFragcolor.rgb * lightWeighting, vFragcolor.a);
}
`
