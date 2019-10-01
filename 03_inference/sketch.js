// defaultCanvas0

const backgroundColor = d3.interpolateTurbo(0);
const myImageModelURL = './image-model/model.json';
const classLabels = ["noise","nodding","shaking","clockwise","counterclockwise"];

let video;
let poseNet;
let currentPoses = [];
let poseHistory = Array(50).fill([0,0]);
let dataReady = false;
let myCanvas;

const modelParams = {
  detectionType: 'single',
  flipHorizontal: true,
};

function setup() {
  
  resultDiv = createElement('h1',  '...');
  myCanvas = createCanvas(480, 480);

  video = createCapture(VIDEO);
  video.size(width, height);
  
  poseNet = ml5.poseNet(video, modelParams, poseReady);
  poseNet.on('pose', results => currentPoses = results);

  myImageModel = ml5.imageClassifier(myImageModelURL, classifierReady);
  myImageModel.classify(myCanvas, gotResults);

  video.hide();
  noStroke();
}

function draw() {
    if (dataReady == false) {
      updateSequence();
      let flattenedArray = [].concat(...poseHistory[0])
      let summed = flattenedArray.reduce((sum, x) => sum + x);
      dataReady = summed > 0;
    } else {
      updateSequence();
      drawBackground();
      drawKeypoints();
    }
}

function drawBackground() {
  fill(backgroundColor);
  rect(0, 0, width, height);
}

function updateSequence() {
  if (currentPoses.length > 0) {
    let pose = currentPoses[0].pose;
    let points = pose.keypoints.slice(0, 3).map(keypoint => {
      if (keypoint.score > 0.3) {
        const point = [keypoint.position.x, keypoint.position.y];
        return (point);
      }
    });
    const expiredSet = poseHistory.shift();
    poseHistory.push(points);
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  poseHistory.map((pose, i) => {
    pose.map(keypoint => {
      noStroke();
      let colorFill = d3.interpolateTurbo(i/50);
      fill(colorFill);
      ellipse(keypoint[0], keypoint[1], 10, 10);
    });
  });
}

function gotResults(err, results) {
  if (err) console.log(err);
  if (results) {
    // console.log(results);
    resultDiv.html('Result is: ' + classLabels[results[0].label]);
    myImageModel.classify(myCanvas, gotResults);
  }
}

function poseReady() {
  select('#poseStatus').html('PoseNet ready');
}

function classifierReady() {
  select('#classifierStatus').html('Image classifier ready');
}


