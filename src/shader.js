
var shaders = shaders || {
    none: {},
    gouraud: {},
    flat: {},
    phong: {},
};

shaders.none.vertexShader = `
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

shaders.none.fragmentShader = `
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

uniform vec3 uPointLightingLocation[3];

varying vec4 vFragcolor;
varying vec3 vVertexPosition;
varying vec3 vLightDirection[3];

void main(void) {

    vVertexPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    for (int i = 0; i < 3; i++) {
		vLightDirection[i] = normalize(uPointLightingLocation[i] - vVertexPosition);
	}

    vFragcolor = vec4(aFrontColor, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.flat.fragmentShader = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float uMaterialShininess;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;

varying vec4 vFragcolor;
varying vec3 vLightDirection[3];
varying vec3 vVertexPosition;

void main(void) {

	vec3 normal = normalize(cross(dFdx(vVertexPosition), dFdy(vVertexPosition)));

    vec3 lightWeighting = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < 3; i++) {

        vec3 reflectionDirection = reflect(-vLightDirection[i], normal);

        float specularLightWeighting = pow(max(dot(reflectionDirection, normalize(-vVertexPosition.xyz)), 0.0), uMaterialShininess);

        float diffuseLightWeighting = max(dot(normal, vLightDirection[i]), 0.0);

        lightWeighting += uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;
    }

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

uniform float uMaterialShininess;

uniform vec3 uPointLightingLocation[3];

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;

varying vec4 vFragcolor;
varying vec3 vNormalDirection;
varying vec3 vVertexPosition;

void main(void) {

    vNormalDirection = normalize(uNMatrix * aVertexNormal);

    vVertexPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    vec3 lightWeighting = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < 3; i++) {

        vec3 lightDirection = normalize(uPointLightingLocation[i] - vVertexPosition);

        vec3 reflectionDirection = reflect(-lightDirection, vNormalDirection);

        float specularLightWeighting = pow(max(dot(reflectionDirection, normalize(-vVertexPosition.xyz)), 0.0), uMaterialShininess);

        float diffuseLightWeighting = max(dot(lightDirection, vNormalDirection), 0.0);

        lightWeighting += uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;
    }

    vFragcolor = vec4(aFrontColor, 1.0);
    vFragcolor = vec4(vFragcolor.rgb * lightWeighting, vFragcolor.a);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.gouraud.fragmentShader = `
precision mediump float;

varying vec4 vFragcolor;

void main(void) {
	gl_FragColor = vFragcolor;
}
`

shaders.phong.vertexShader = `
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aFrontColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uPointLightingLocation[3];

varying vec3 vLightDirection[3];
varying vec4 vFragcolor;
varying vec3 vNormalDirection;
varying vec3 vVertexPosition;

void main(void) {

    vNormalDirection = normalize(uNMatrix * aVertexNormal);

    vVertexPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    for (int i = 0; i < 3; i++) {
        vLightDirection[i] = normalize(uPointLightingLocation[i] - vVertexPosition);
    }

    vFragcolor = vec4(aFrontColor, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`

shaders.phong.fragmentShader = `
precision mediump float;

uniform float uMaterialShininess;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingSpecularColor;
uniform vec3 uPointLightingDiffuseColor;

varying vec3 vLightDirection[3];
varying vec4 vFragcolor;
varying vec3 vNormalDirection;
varying vec3 vVertexPosition;

void main(void) {

    vec3 lightWeighting = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < 3; i++) {

        vec3 reflectionDirection = reflect(-vLightDirection[i], vNormalDirection);

        float specularLightWeighting = pow(max(dot(reflectionDirection, normalize(-vVertexPosition.xyz)), 0.0), uMaterialShininess);

        float diffuseLightWeighting = max(dot(vLightDirection[i], vNormalDirection), 0.0);

        lightWeighting += uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting;
    }

	gl_FragColor = vec4(vFragcolor.rgb * lightWeighting, vFragcolor.a);
}
`
