import { variables } from './utils.js';

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
