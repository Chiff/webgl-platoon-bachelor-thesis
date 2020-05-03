import Scene from './scripts/scene.js';
import { availablePaths, getFormData } from './scripts/utils.js';
import { resetCameraPositon } from './scripts/camera.js';
import { loadData } from './scripts/data.js';

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

    loadData(6);
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

window.freeCam = resetCameraPositon;
window.restart = () => location.reload();
