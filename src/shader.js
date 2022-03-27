
var shaders = shaders || {
    other: {},
    gouraud: {},
    flat: {},
    phong: {},
};

shaders.other.vertexShader = `
attribute vec3 aVertexPosition;
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
