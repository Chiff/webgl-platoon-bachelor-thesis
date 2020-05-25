import { availablePaths, getFormData, variables } from './scripts/utils.js';
import { resetCameraPositon } from './scripts/camera.js';
import Simulation from './scripts/simulation.js';
import $ from 'jquery';

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

    $('#inputForm').on('submit', function (e) {
        e.preventDefault();

        const $this = $(this);

        $('#container').show();
        $('#loading').show();
        $this.hide();

        const params = getFormData($this);
        $.get(params.url, function (e) {
            params.pathSettings = e;
            window.SCENE = new Simulation(params);
            window.vars = variables;
        });

        return false;
    });

    window.freeCam = resetCameraPositon;
    window.restart = () => location.reload();
    window.defocus = () => variables.chart.focus(variables.chartCars.map(e => e.name));
});
