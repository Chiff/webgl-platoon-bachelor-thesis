import { variables } from './utils.js';

// Think of this camera as one orbiting its target position, or more imaginatively as a spy satellite orbiting the earth.
// Its position relative to the target (earth) can be set by three parameters, alpha (radians) the longitudinal rotation,
// beta (radians) the latitudinal rotation and radius the distance from the target position

// https://d33wubrfki0l68.cloudfront.net/17c747459f49f7cdb9986e2feba5aac9b5a75a11/432f0/img/how_to/camalphabeta.jpg
// starting camera rotation
const CAMERA_ALPHA = 6.49;
const CAMERA_BETA = 1.28;
const CAMERA_RADIUS = 60;

export const createCamera = (myScene) => {
    const camera = new BABYLON.ArcRotateCamera('Camera', CAMERA_ALPHA, CAMERA_BETA, CAMERA_RADIUS, new BABYLON.Vector3(2, 1, -12), myScene.scene);
    camera.attachControl(myScene.canvas, true);

    if (!variables.debug) {
        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;
    }

    camera.allowUpsideDown = false;

    myScene.camera = camera;
};

export const resetCameraPositon = () => {
    const cam = window.SCENE.camera;

    cam.setPosition(new BABYLON.Vector3(15, 10, 0));
    cam.setTarget(window.SCENE.ground);
    cam.alpha = CAMERA_ALPHA;
    cam.beta = CAMERA_BETA;
};
