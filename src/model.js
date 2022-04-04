


function initModel(gl, modelName, initTranslate = [0, 0, 0], initScale = [1, 1, 1], initRotate = [0, 0, 0]) {

    var shaderProgram;

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    var nMatrix = mat3.create();

    var modelVertexPositionBuffer;
    var modelVertexNormalBuffer;
    var modelVertexFrontColorBuffer;

    var modelAngle = 180;
    var lastTime = 0;

    function handleLoadedModel(modelData) {
        modelVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
        modelVertexPositionBuffer.itemSize = 3;
        modelVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;

        modelVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), gl.STATIC_DRAW);
        modelVertexNormalBuffer.itemSize = 3;
        modelVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;

        modelVertexFrontColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexFrontColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexFrontcolors), gl.STATIC_DRAW);
        modelVertexFrontColorBuffer.itemSize = 3;
        modelVertexFrontColorBuffer.numItems = modelData.vertexFrontcolors.length / 3;
    }

    function loadModel(modelName) {
        var request = new XMLHttpRequest();
        request.open("GET", `./model/${modelName}.json`);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                handleLoadedModel(JSON.parse(request.responseText));
            }
        }
        request.send();
    }

    function getShader(gl, shaderScript, shader) {

        if (!shaderScript) {
            return null;
        }

        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initShaders(shaderScripts) {

        var vertexShader = getShader(gl, shaderScripts.vertexShader, gl.createShader(gl.VERTEX_SHADER));
        var fragmentShader = getShader(gl, shaderScripts.fragmentShader, gl.createShader(gl.FRAGMENT_SHADER));

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialize shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexFrontColorAttribute = gl.getAttribLocation(shaderProgram, "aFrontColor");
        gl.enableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");

        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");

        shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
        shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    }

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        mat4.toInverseMat3(mvMatrix, nMatrix);
        mat3.transpose(nMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
    }

    function setShaderAttributes() {

        let lightLocationArray = []
        for (let i = 0; i < 3; i++) {
            lightLocationArray.push(parseFloat(document.getElementById(`pointLightingLocationX${i}`).value));
            lightLocationArray.push(parseFloat(document.getElementById(`pointLightingLocationY${i}`).value));
            lightLocationArray.push(parseFloat(document.getElementById(`pointLightingLocationZ${i}`).value));
        }

        gl.uniform3fv(
            shaderProgram.pointLightingLocationUniform,
            lightLocationArray
        );

        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(document.getElementById("ambientR").value),
            parseFloat(document.getElementById("ambientG").value),
            parseFloat(document.getElementById("ambientB").value)
        );

        gl.uniform3f(
            shaderProgram.pointLightingSpecularColorUniform,
            parseFloat(document.getElementById("specularR").value),
            parseFloat(document.getElementById("specularG").value),
            parseFloat(document.getElementById("specularB").value)
        );

        gl.uniform3f(
            shaderProgram.pointLightingDiffuseColorUniform,
            parseFloat(document.getElementById("diffuseR").value),
            parseFloat(document.getElementById("diffuseG").value),
            parseFloat(document.getElementById("diffuseB").value)
        );

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(document.getElementById("shininess").value));

        // Setup model position data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
            modelVertexPositionBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);

        // Setup model front color data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexFrontColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute,
            modelVertexFrontColorBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);

        // Setup model normal data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
            modelVertexNormalBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function setShears() {
        let shearXY = parseFloat(document.getElementById("shearXY").value)
        let shearXZ = parseFloat(document.getElementById("shearXZ").value)
        let shearYX = parseFloat(document.getElementById("shearYX").value)
        let shearYZ = parseFloat(document.getElementById("shearYZ").value)
        let shearZX = parseFloat(document.getElementById("shearZX").value)
        let shearZY = parseFloat(document.getElementById("shearZY").value)

        let transformMatrix = [
            1, shearXY, shearXZ, 0,
            shearYX, 1, shearYZ, 0,
            shearZX, shearZY, 1, 0,
            0, 0, 0, 1,
        ];

        mvMatrix = mat4.multiply(mvMatrix, mat4.create(transformMatrix))
    }

    function setScales() {
        let scaleX = parseFloat(document.getElementById("scaleX").value)
        let scaleY = parseFloat(document.getElementById("scaleY").value)
        let scaleZ = parseFloat(document.getElementById("scaleZ").value)

        mat4.scale(mvMatrix, [initScale[0] * scaleX, initScale[1] * scaleY, initScale[2] * scaleZ]);
    }

    function setTranslates() {
        let translateX = parseFloat(document.getElementById("translateX").value)
        let translateY = parseFloat(document.getElementById("translateY").value)
        let translateZ = parseFloat(document.getElementById("translateZ").value)

        mat4.translate(mvMatrix, [initTranslate[0] + translateX, initTranslate[1] + translateY, initTranslate[2] + translateZ]);
    }

    function setRotations() {
        let rotationX = parseFloat(document.getElementById("rotationX").value);
        let rotationY = parseFloat(document.getElementById("rotationY").value);
        let rotationZ = parseFloat(document.getElementById("rotationZ").value);

        mat4.rotate(mvMatrix, degToRad(modelAngle), [0, 1, 0]);

        mat4.rotateX(mvMatrix, degToRad(initRotate[0]) + degToRad(rotationX));
        mat4.rotateY(mvMatrix, degToRad(initRotate[1]) + degToRad(rotationY));
        mat4.rotateZ(mvMatrix, degToRad(initRotate[2]) + degToRad(rotationZ));
    }

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
            modelAngle += 0.03 * elapsed;
        }

        lastTime = timeNow;
    }

    function updateShaderType() {

        shaderType = document.getElementById("shaderType").value
        var shaderScripts;

        if (shaderType == "flat") {
            shaderScripts = shaders.flat;
        } else if (shaderType == "gouraud") {
            shaderScripts = shaders.gouraud;
        } else if (shaderType == "phong") {
            shaderScripts = shaders.phong;
        } else {
            shaderScripts = shaders.none;
        }

        initShaders(shaderScripts)
    }

    loadModel(modelName);
    updateShaderType()

    return function () {

        var tmpModelName = document.getElementById("modelSelect").value;
        if (tmpModelName != modelName) {
            modelName = tmpModelName;
            loadModel(modelName)
        }

        animate()

        if (modelVertexPositionBuffer == null ||
            modelVertexNormalBuffer == null ||
            modelVertexFrontColorBuffer == null) {

            return;
        }

        // Setup Projection Matrix
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        // Setup Model-View Matrix
        mat4.identity(mvMatrix);

        updateShaderType();
        setShaderAttributes();

        setTranslates();
        setScales();
        setRotations();
        setShears();

        setMatrixUniforms();

        gl.drawArrays(gl.TRIANGLES, 0, modelVertexPositionBuffer.numItems);
    }
}
