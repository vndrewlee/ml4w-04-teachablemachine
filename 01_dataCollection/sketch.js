// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let sequence = Array(50).fill([0,0]);
let dataReady = false;
const backgroundColor = d3.interpolateTurbo(0);

const modelParams = {
  detectionType: 'single',
  flipHorizontal: true,
};

function setup() {
  createCanvas(480, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  poseNet = ml5.poseNet(video, modelParams, modelReady);
  poseNet.on('pose', results => poses = results);
  video.hide();
  noStroke();
}

function draw() {
    if (dataReady == false) {
      updateSequence();
      let flattenedArray = [].concat(...sequence[0])
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
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let points = pose.keypoints.slice(0, 3).map(keypoint => {
      if (keypoint.score > 0.3) {
        const point = [keypoint.position.x, keypoint.position.y];
        return (point);
      }
    });
    const expiredSet = sequence.shift();
    sequence.push(points);
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  sequence.map((pose, i) => {
    pose.map(keypoint => {
      noStroke();
      let colorFill = d3.interpolateTurbo(i/50);
      fill(colorFill);
      ellipse(keypoint[0], keypoint[1], 10, 10);
    });
  });
}

function modelReady() {
  select('#status').html('looking for a motion...');
}


