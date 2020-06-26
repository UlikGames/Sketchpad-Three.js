// -- Drawing
const colors = [
"#100c08",
"#759BA9",
"#77dd77",
"#ff6961",
"#ffd1dc"];


let currentColorIndex = 0;

let colorButtons = document.querySelectorAll('.colours li'),
colorButtonsL = colorButtons.length;

for (var x = 0; x < colorButtonsL; x++) {
  (x => {
    colorButtons[x].addEventListener('click', () => {
      setActiveColour(x);
    });
  })(x);
}

function setActiveColour(x) {
  currentColorIndex = x;
}

// -- Drawing
const drawingCanvas = document.createElement('canvas');
drawingCanvas.width = window.innerWidth;
drawingCanvas.height = window.innerHeight;

drawingCanvas.style.position = 'fixed';
drawingCanvas.style.left = 0;
drawingCanvas.style.top = 0;
drawingCanvas.style.zIndex = 1;

document.body.appendChild(drawingCanvas);

var drawingCtx = drawingCanvas.getContext('2d');

let isDrawing,
newlyUp = false,
lastPoint;

let pencilPathDefaults = {
  minThickness: .2,
  maxThickness: 2 };


let pencilPathCurrent = {
  thickness: .2 };


let pencilPathTarget = {
  thickness: .2 };


document.addEventListener('touchstart', handleMouseDown);
document.addEventListener('mousedown', handleMouseDown);

function handleMouseDown(e) {
  if (e.target.localName !== 'canvas') return;
  isDrawing = true;
  pencilTargetPos.height = 0;
  pencilTargetPos.heightRotate = .2;

  pencilPathTarget.thickness = pencilPathDefaults.maxThickness;

  let xPos = e.touches ? e.touches[0].clientX : e.clientX,
  yPos = e.touches ? e.touches[0].clientY : e.clientY;

  let currentPoint = { x: xPos, y: yPos };

  drawingCtx.beginPath();
  drawingCtx.fillStyle = colors[currentColorIndex];
  drawingCtx.globalAlpha = .9;
  drawingCtx.arc(
  currentPoint.x + 5, currentPoint.y + 5, pencilPathDefaults.thickness,
  false, Math.PI * 2, false);
  drawingCtx.fill();

  lastPoint = currentPoint;
}

document.addEventListener('touchend', handleMouseUp);
document.addEventListener('mouseup', handleMouseUp);

function handleMouseUp() {
  newlyUp = true;
  isDrawing = false;
  pencilTargetPos.height = pencilDefaultPos.height;
  pencilTargetPos.heightRotate = 0;
  pencilPathTarget.thickness = pencilPathDefaults.minThickness;

  setTimeout(fullyUp, 50);
}

function fullyUp() {
  newlyUp = false;
}

// -- Pencil
// Renderer
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  autoClear: true });


renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.zIndex = 5;
renderer.domElement.style.position = 'relative';
renderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(renderer.domElement);

// Ensure Full Screen on Resize
function fullScreen() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', fullScreen, false);

// Scene
var scene = new THREE.Scene();

// Lighting

let hemiLight,
dirLight;

function createLights() {
  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.2);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 0, 50);
  scene.add(hemiLight);
  hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
  // scene.add( hemiLightHelper )

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.color.setHSL(1, 1, 1);
  directionalLight.position.set(-.5, 1, 10);
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
  // scene.add( directionalLightHelper )

  spotLight = new THREE.SpotLight(0xffffff, 0.4);
  spotLight.color.setHSL(1, 1, 1);
  spotLight.position.set(-7, 1, 2);
  scene.add(spotLight);
  spotLight.castShadow = false;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLightHelper = new THREE.SpotLightHelper(spotLight, 10);
  // scene.add( spotLightHelper )

  topLight = new THREE.SpotLight(0xffffff, 0.1);
  topLight.color.setHSL(1, 1, 1);
  topLight.position.set(1, -7, 2);
  scene.add(topLight);
  topLight.castShadow = false;
  topLight.shadow.mapSize.width = 2048;
  topLight.shadow.mapSize.height = 2048;
  topLightHelper = new THREE.SpotLightHelper(topLight, 10);
  // scene.add( topLightHelper )
}

createLights();

function createGround() {
  let groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
  let groundMat = new THREE.ShadowMaterial();
  groundMat.opacity = 0.1;

  this.ground = new THREE.Mesh(groundGeo, groundMat);
  this.ground.position.z = 0;
  this.ground.position.y = 0;
  this.ground.receiveShadow = true;

  this.scene.add(this.ground);
}

createGround();

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Camera and position
var camera = new THREE.PerspectiveCamera(8, window.innerWidth / window.innerHeight, 1, 10000);

camera.position.y = 0;
camera.position.z = 12;

// Custom (OGJ) Objects
const codepenAssetUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/';

let onProgress = function (xhr) {
  if (xhr.lengthComputable) {
    let percentComplete = xhr.loaded / xhr.total * 100;
    // console.log( Math.round(percentComplete, 2) + '% downloaded' )
  }
};

let onError = function (xhr) {
  console.log('ERROR');
};

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath(codepenAssetUrl);

let pencil,
pencilDefaultPos = {
  height: .04,
  xRotate: 0,
  yRotate: 0,
  zRotate: 0 },

pencilPos = {
  height: pencilDefaultPos.height,
  xRotate: 0,
  yRotate: 0,
  zRotate: 0 },

pencilTargetPos = {
  height: pencilDefaultPos.height,
  xRotate: 0,
  yRotate: 0,
  zRotate: 0,
  heightRotate: 0 };


mtlLoader.load('pencil-multi.mtl', function (materials) {
  materials.preload();

  var objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath(codepenAssetUrl);
  objLoader.load('pencil-multi.obj', function (obj) {

    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;

        let area = new THREE.Box3();
        area.setFromObject(child);

        let yOffset = area.min.y;
        obj.position.y = 0;
      }
    });

    obj.castShadow = true;

    pencil = obj;

    rotateAroundWorldAxis(pencil, new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(90));
    rotateAroundWorldAxis(pencil, new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-10));
    rotateAroundWorldAxis(pencil, new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(20));

    pencilDefaultPos.xRotate = pencil.rotation.x;
    pencilDefaultPos.yRotate = pencil.rotation.y;
    pencilDefaultPos.zRotate = pencil.rotation.z;

    scene.add(pencil);

    animate();
    document.addEventListener('touchmove', stopScroll);
    document.addEventListener('touchmove', mouseMove);
    document.addEventListener('mousemove', mouseMove);

  }, onProgress, onError, null, false);
}, onProgress, onError, null, false);

function animate() {
  // Pencil position from paper
  pencilPos.height += (pencilTargetPos.height - pencilPos.height) * .2;

  // Move pencil point position if required
  pencil.position.copy(mousePos);
  pencil.position.x += pencilPos.height;
  pencil.position.y += pencilPos.height;
  pencil.position.z += pencilPos.height;

  // Pencil thickness
  pencilPathCurrent.thickness += (pencilPathTarget.thickness - pencilPathCurrent.thickness) * .2;

  // Tilt pencil
  // x
  if (isNotClose(pencilPos.xRotate, pencilTargetPos.xRotate)) {
    let newRotate = (pencilTargetPos.xRotate - pencilPos.xRotate) * .2;
    pencilPos.xRotate += Math.round(newRotate * 1000) / 1000;
    pencil.rotation.x = pencilPos.xRotate + pencilDefaultPos.xRotate;
  }

  // y
  if (isNotClose(pencilPos.yRotate, pencilTargetPos.yRotate)) {
    let newRotate = (pencilTargetPos.yRotate - pencilPos.yRotate) * .2;
    pencilPos.yRotate += Math.round(newRotate * 1000) / 1000;
    pencil.rotation.y = pencilPos.yRotate + pencilDefaultPos.yRotate;
  }

  // z
  let targetZAngle = pencilTargetPos.zRotate + pencilTargetPos.heightRotate;

  if (isNotClose(pencilPos.zRotate, targetZAngle)) {
    let newRotate = (targetZAngle - pencilPos.zRotate) * .2;
    pencilPos.zRotate += Math.round(newRotate * 1000) / 1000;
    pencil.rotation.z = pencilPos.zRotate + pencilDefaultPos.zRotate;
  }

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function clearCanvas() {
  drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
}

let mouse = {
  x: 0,
  y: 0 },

mousePos = new THREE.Vector3(0, 0, 0),
mouseDirection = {
  x: 1,
  y: 1 };


function stopScroll(e) {
  e.preventDefault();
}

function mouseMove(e) {
  let xPos = e.touches ? e.touches[0].clientX : e.clientX,
  yPos = e.touches ? e.touches[0].clientY : e.clientY;

  // Update the mouse variable
  e.preventDefault();
  mouse.x = xPos / window.innerWidth * 2 - 1;
  mouse.y = -(yPos / window.innerHeight) * 2 + 1;

  if (!lastPoint) {
    lastPoint = { x: xPos, y: yPos };
  }

  // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x + .01, mouse.y - .01, 0.5);
  vector.unproject(camera);

  var dir = vector.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  mousePos = camera.position.clone().add(dir.multiplyScalar(distance));

  // Mouse Tracking
  var currentPoint = { x: xPos, y: yPos };

  var angle = angleBetween(lastPoint, currentPoint);
  let xDist = distanceBetweenSingle(lastPoint.x, currentPoint.x);
  let yDist = distanceBetweenSingle(lastPoint.y, currentPoint.y);

  mouseDirection.x = currentPoint.x > lastPoint.x ? 1 : -1;
  mouseDirection.y = currentPoint.y > lastPoint.y ? -1 : 1;

  let newXAngle = yDist / 100;
  let newZAngle = xDist / 100 * -1;

  let maxAngle = .25;

  pencilTargetPos.xRotate = newXAngle > -maxAngle && newXAngle < maxAngle ? newXAngle : newXAngle < -maxAngle ? -maxAngle : maxAngle;
  pencilTargetPos.zRotate = newZAngle > -maxAngle && newZAngle < maxAngle ? newZAngle : newZAngle < -maxAngle ? -maxAngle : maxAngle;

  if (isDrawing || newlyUp) {
    let dist = distanceBetween(lastPoint, currentPoint);

    for (var i = 0; i < dist; i += .3) {
      x = lastPoint.x + Math.sin(angle) * i;
      y = lastPoint.y + Math.cos(angle) * i;

      drawingCtx.beginPath();
      drawingCtx.strokeStyle = 'blue';
      drawingCtx.globalAlpha = getRandomInt(.15, .25);
      drawingCtx.arc(
      x + 5, y + 5, pencilPathCurrent.thickness,
      false, Math.PI * 2, false);
      drawingCtx.fill();
    }
  }

  lastPoint = currentPoint;
}

// Refresh
let refreshBtn = document.querySelector('.pencil__refresh');
refreshBtn.addEventListener('click', handleRefresh);

function handleRefresh(e) {
  e.preventDefault();

  clearCanvas();
}

// Save
let submitBtn = document.querySelector('.pencil__submit');
submitBtn.addEventListener('click', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  savePNG();
}

function savePNG() {
  const freshCanvas = document.createElement('canvas');
  freshCanvas.width = drawingCanvas.width;
  freshCanvas.height = drawingCanvas.height;

  let freshCtx = freshCanvas.getContext('2d');

  freshCtx.fillStyle = "#f7f4f0";
  freshCtx.fillRect(0, 0, freshCanvas.width, freshCanvas.height);
  freshCtx.drawImage(drawingCanvas, 0, 0);

  let imageDataURL = freshCanvas.toDataURL();
  let image = new Image();

  image.src = imageDataURL;

  var w = window.open("");
  w.document.write(image.outerHTML);
}

// Utilities
function rotateAroundWorldAxis(obj, axis, radians) {
  let rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  rotWorldMatrix.multiply(obj.matrix);
  obj.matrix = rotWorldMatrix;
  obj.setRotationFromMatrix(obj.matrix);
}

function isNotClose(current, target) {
  return current < target - .004 || current > target + .004;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function distanceBetweenSingle(point1, point2) {
  return point1 - point2;
}

function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

function direction(point1, point2) {
  return Math.atan2(point1, point2);
}