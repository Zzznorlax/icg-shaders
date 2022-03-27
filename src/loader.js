


function loadObject(modelPath) {
    var request = new XMLHttpRequest();
    request.open("GET", modelPath);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedObject(JSON.parse(request.responseText));
        }
    }
    request.send();
}


function handleLoadedObject(gl, objectData) {
    var objectVertexPositionBuffer;
    var objectVertexNormalBuffer;
    var objectVertexFrontColorBuffer;

    objectVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, objectVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.vertexPositions), gl.STATIC_DRAW);
    objectVertexPositionBuffer.itemSize = 3;
    objectVertexPositionBuffer.numItems = objectData.vertexPositions.length / 3;

    objectVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, objectVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.vertexNormals), gl.STATIC_DRAW);
    objectVertexNormalBuffer.itemSize = 3;
    objectVertexNormalBuffer.numItems = objectData.vertexNormals.length / 3;

    objectVertexFrontColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, objectVertexFrontColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.vertexFrontcolors), gl.STATIC_DRAW);
    objectVertexFrontColorBuffer.itemSize = 3;
    objectVertexFrontColorBuffer.numItems = objectData.vertexFrontcolors.length / 3;

    function draw(objectAngle) {
        if (objectVertexPositionBuffer == null ||
            objectVertexNormalBuffer == null ||
            objectVertexFrontColorBuffer == null) {

            return;
        }

        // Setup Projection Matrix
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        // Setup Model-View Matrix
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [0, 0, -100]);
        mat4.rotate(mvMatrix, degToRad(objectAngle), [0, 1, 0]);

        setMatrixUniforms();

        // Setup object position data
        gl.bindBuffer(gl.ARRAY_BUFFER, objectVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
            objectVertexPositionBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);

        // Setup object front color data
        gl.bindBuffer(gl.ARRAY_BUFFER, objectVertexFrontColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute,
            objectVertexFrontColorBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);

        gl.drawArrays(gl.TRIANGLES, 0, objectVertexPositionBuffer.numItems);
    }

    return draw
}

// export { loadObject, handleLoadedObject }
