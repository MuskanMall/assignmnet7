  'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // The programs
  let perVertexProgram;
  let perFragmentProgram;
  
  // VAOs for the objects
  var mySpherePerVertex = null;
  var mySpherePerFragment = null;

  // what is currently showing
  let nowShowing = 'Vertex';

  function bindVAO(shape, program) {

    var VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);
  
    var vB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vB);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(shape.points),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(program.any);
    gl.vertexAttribPointer(program.any, 3, gl.FLOAT, true, 0, 0);
  
    var nB = gl.createBuffer();
    gl.bindBuffer(gl.NORMAL_ARRAY_BUFFER, nB);
    gl.bufferData(
      gl.NORMAL_ARRAY_BUFFER,
      new Float32Array(shape.normals),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(program.aNormal)
    gl.vertexAttribPointer(program.aNormal, 3,gl.FLOAT,true,0,0)
  
  
    var iB = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iB);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(shape.indices),gl.STATIC_DRAW);
  
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.NORMAL_ARRAY_BUFFER, null);
  
    return VAO;
  }
  

  function setUpPhong(program) {
    gl.useProgram(program);
    var aL = gl.getUniformLocation(program, 'ambientLight')
    gl.uniform3fv(aL, [0.4, 0.5, 0.2]);
    var lC = gl.getUniformLocation(program, 'lightColor')
    gl.uniform3fv(lC, [1.0, 1.0, 1.0])
    var lP = gl.getUniformLocation(program, 'lightPosition')
    gl.uniform3fv(lP, [10,10,4])
    var bC = gl.getUniformLocation(program, 'baseColor')
    gl.uniform3fv(bC, [0, 9, 1.5])
    var specHighlightColor = gl.getUniformLocation(program, "specHighlightColor");
    gl.uniform3fv(specHighlightColor, [1.5, 1.5, 1.5]);
    var ka = gl.getUniformLocation(program, "ka");
    gl.uniform1f(ka, 1);
    var ks = gl.getUniformLocation(program, "ks");
    gl.uniform1f(ks, 0.1);
    var kd = gl.getUniformLocation(program, "kd");
    gl.uniform1f(kd, 0.5);
    var ke = gl.getUniformLocation(program, "ke");
    gl.uniform1f(ke, 1);
    let modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [3,3, 3]);
    gl.uniformMatrix4fv(program.uModelT, false, modelMatrix);
  }
  


  function setUpCamera(program) {
    gl.useProgram(program);
    var mM = glMatrix.mat4.create();
    glMatrix.mat4.scale (mM, mM, [5, 5, 5]);
    gl.uniformMatrix4fv (program.uModelT, true, mM);

    var vM = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(vM, [2, 3, 5], [0, 1, 1],[2, 4, 6]);
    gl.uniformMatrix4fv (program.uViewT, false, vM);
    
    var pM = glMatrix.mat4.create();
    glMatrix.mat4.ortho(pM, -1, 1, -1, 1, 6.0, 450.0);
    gl.uniformMatrix4fv (program.uProjT, true, pM);
    

  
  }




///////////////////////////////////////////////////////////////////
//
//  No need to edit below this line.
//
////////////////////////////////////////////////////////////////////

// general call to make and bind a new object based on current
// settings..Basically a call to shape specfic calls in cgIshape.js
function createShapes() {
    
    //per vertex
    mySpherePerVertex = new Sphere (20,20);
    mySpherePerVertex.VAO = bindVAO (mySpherePerVertex, perVertexProgram);
    
    // per fragment
    mySpherePerFragment = new Sphere (20,20);
    mySpherePerFragment.VAO = bindVAO (mySpherePerFragment, perFragmentProgram);
}


function drawShapes(object, program) {
    
    // set up your uniform variables for drawing
    gl.useProgram (program);

    //Bind the VAO and draw
    gl.bindVertexArray(object.VAO);
    gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
    
}

  // Given an id, extract the content's of a shader script
  // from the DOM and return the compiled shader
  function getShader(id) {
    const script = document.getElementById(id);
    const shaderString = script.text.trim();

    // Assign shader depending on the type of shader
    let shader;
    if (script.type === 'x-shader/x-vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (script.type === 'x-shader/x-fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else {
      return null;
    }

    // Compile the shader using the supplied shader code
    gl.shaderSource(shader, shaderString);
    gl.compileShader(shader);

    // Ensure the shader is valid
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Compiling shader " + id + " " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  // Create a program with the appropriate vertex and fragment shaders
  function initProgram (vertexid, fragmentid) {
    // set up the per-vertex program
    const vertexShader = getShader(vertexid);
    const fragmentShader = getShader(fragmentid);

    // Create a program
    let program = gl.createProgram();
    
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
    }

    // Use this program instance
    gl.useProgram(program);
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    program.aNormal = gl.getAttribLocation(program, 'aNormal');
      
    // uniforms
    program.uModelT = gl.getUniformLocation (program, 'modelT');
    program.uViewT = gl.getUniformLocation (program, 'viewT');
    program.uProjT = gl.getUniformLocation (program, 'projT');
    program.ambientLight = gl.getUniformLocation (program, 'ambientLight');
    program.lightPosition = gl.getUniformLocation (program, 'lightPosition');
    program.lightColor = gl.getUniformLocation (program, 'lightColor');
    program.baseColor = gl.getUniformLocation (program, 'baseColor');
    program.specHighlightColor = gl.getUniformLocation (program, 'specHighlightColor');
    program.ka = gl.getUniformLocation (program, 'ka');
    program.kd = gl.getUniformLocation (program, 'kd');
    program.ks = gl.getUniformLocation (program, 'ks');
    program.ke = gl.getUniformLocation (program, 'ke');
      
    return program;
  }



  
  // We call draw to render to our canvas
  function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
    // draw your shapes
    if (nowShowing == 'Vertex') {
        drawShapes(mySpherePerVertex, perVertexProgram);
    }
    if (nowShowing == 'Fragment') {
        drawShapes(mySpherePerFragment, perFragmentProgram);
    }

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  // Entry point to our application
  function init() {
      
    // Retrieve the canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error(`There is no WebGL 2.0 context`);
        return null;
      }
      
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    perVertexProgram = initProgram('phong-per-vertex-V', 'phong-per-vertex-F');
    perFragmentProgram = initProgram('phong-per-fragment-V', 'phong-per-fragment-F');
    
    // create and bind your current object
    createShapes();
    
    // set up your camera
    setUpCamera(perVertexProgram);
    setUpCamera(perFragmentProgram);
      
    // set up Phong parameters
    setUpPhong(perVertexProgram);
    setUpPhong(perFragmentProgram);
    
    // do a draw
    draw();
  }
