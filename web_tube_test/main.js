import Scene from './scripts/scene.js';

(() => {
    window.SCENE = new Scene();
})();

window.followDriver = () => {
    window.sceneCamera.lockedTarget = window.sceneDriver;

    window.sceneCamera.upperRadiusLimit = 0.1;
    window.sceneCamera.lowerRadiusLimit = 0.1;
    window.sceneCamera.direction = window.sceneDriver.rotation;
};

window.followCar = () => {
    window.sceneCamera.lockedTarget = window.sceneCar;

    window.sceneCamera.upperRadiusLimit = 1000;
    window.sceneCamera.lowerRadiusLimit = 15;
};
