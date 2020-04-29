import Scene from './scripts/scene.js';
import { availablePaths } from './scripts/path.js';
import { getFormData } from './scripts/utils.js';

const loadPaths = () => {
    availablePaths.forEach(json => {
        const url = json.url;
        const name = json.name;
        $('#selectPath').append(`<option value="${url}">${name}</option>`);
    });
};

$(document).ready(function () {
    loadPaths();

    $('#container').hide();
    $('#loading').hide();
    $('#fpsLabel').hide();
});

$('#inputForm').submit(function (e) {
    e.preventDefault();
    const $this = $(this);

    $('#container').show();
    $('#loading').show();
    $this.hide();

    const params = getFormData($this);
    $.get(params.url, function (e) {
        params.pathSettings = e;
        window.SCENE = new Scene(params);
    });

    return false;
});

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
