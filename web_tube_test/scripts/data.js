import { variables, vehicleObjects } from './utils.js';
import { carSort } from './vehicle.js';
import $ from 'jquery';
import c3 from 'c3';

export let SIMULATION_DATA = {
    frames: -1,
    dist: -1,
    points: []
};

export const SIMULINK_FILES = {
    PLATOON: {filename: 'platoon1h', returnValue: 'speeds'}
    // BOUNCE: {filename: 'bounce', returnValue: 'Position'}
};

// promise result is ignored rn
export const loadData = () => new Promise(resolve => {
    if (variables.offlineMode) {
        return $.get(variables.offlineDataPath, function (data) {
            const d = parseData(data);
            drawChart(d);
            resolve(d);
        });
    }

    let response = null;
    acquireLock(SIMULINK_FILES.PLATOON).then(() => {
        console.warn('[acquireLock] success');
        // return runSimulink(variables.serverInfo.paths.SIMULINK_LIST, SIMULINK_FILES.PLATOON);
        return new Promise(resolve => resolve('ignored'));
    }).then((data) => {
        console.warn('[SIMULINK_LIST]', data);
        return Promise.all(parameters.map((e) => mapParams(e, variables.dist)));
    }).then((data) => {
        console.warn('[parameters]', data);
        return runSimulink(variables.serverInfo.paths.SIMULINK_RUN, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RUN]', data);
        response = data;
        return runSimulink(variables.serverInfo.paths.SIMULINK_RELEASE, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RELEASE]', data);
        const d = parseData(response.return);
        drawChart(d);
        resolve(d);
    }).catch((error) => {
        console.error(error);
        alert('Nastala chyba pri ziskavani dat zo servisu - pouzivam offline data set');

        return $.get(variables.offlineDataPath, function (data) {
            const d = parseData(data);
            drawChart(d);
            resolve(d);
        });
    });
});

const drawChart = (data) => {
    const points = Object.values(data.points);
    const xp = [];

    variables.chartCars = vehicleObjects.map(e => ({name: e.vehicleID, color: e.chartColor, order: e.order, data: []}));
    variables.chartCars.sort(carSort);


    for (let i = 0; i < points.length; i += variables.skipFrames) {
        xp.push(i.toString());
        variables.chartCars[0].data.push(parseFloat(points[i][0].toFixed(2)));
        variables.chartCars[1].data.push(parseFloat(points[i][1].toFixed(2)));
        variables.chartCars[2].data.push(parseFloat(points[i][2].toFixed(2)));
        variables.chartCars[3].data.push(parseFloat(points[i][3].toFixed(2)));
    }

    const x = ['x', ...xp];
    const car1 = [variables.chartCars[0].name, ...variables.chartCars[0].data];
    const car2 = [variables.chartCars[1].name, ...variables.chartCars[1].data];
    const car3 = [variables.chartCars[2].name, ...variables.chartCars[2].data];
    const car4 = [variables.chartCars[3].name, ...variables.chartCars[3].data];

    variables.chart = c3.generate({
        bindto: variables.chartId,
        size: {
            height: 200
        },
        data: {
            x: 'x',
            columns: [x, car1, car2, car3, car4],
            type: 'spline',
            colors: {
                [variables.chartCars[0].name]: variables.chartCars[0].color,
                [variables.chartCars[1].name]: variables.chartCars[1].color,
                [variables.chartCars[2].name]: variables.chartCars[2].color,
                [variables.chartCars[3].name]: variables.chartCars[3].color
            }
        },
        axis: {
            x: {
                label: 'Time'
            },
            y: {
                label: 'Speed'
            }
        },
        tooltip: {
            format: {
                title: function (d) {
                    return 'Speed at frame #' + d;
                }
            }
        }
    });

    $(`circle.c3-circle`).attr('r', variables.chartCircleSize);
};

export const getVehicle = (number) => Object.values(SIMULATION_DATA.points).map(e => e[number]);

const parseData = (data) => {
    const parsed = {};

    if (typeof data === 'string')
        data = JSON.parse(data.speeds);

    if (typeof data.speeds === 'string')
        data.speeds = JSON.parse(data.speeds);


    for (let i = 0; i < variables.startFrames; i++) {
        data.speeds.unshift(data.speeds[0]);
    }

    for (let i = 0; i < variables.startFrames; i++) {
        data.speeds.push(data.speeds[0]);
    }

    data.speeds.forEach((frame, i) => {
        const s1 = frame[1];
        const s2 = frame[2];
        const s3 = frame[3];
        const s4 = frame[4];
        parsed[i] = [s1, s2, s3, s4];
    });

    SIMULATION_DATA = {
        frames: data.speeds.length,
        dist: variables.dist,
        points: parsed
    };

    console.warn(SIMULATION_DATA);
    return SIMULATION_DATA;
};

const runSimulink = (SIMULINK_OPERATION, SIMULINK_FILE) => new Promise((resolve, reject) => {
    const data = {
        api_key: variables.serverInfo.api_key,
        model_name: SIMULINK_FILE.filename
    };

    if (SIMULINK_OPERATION.api === variables.serverInfo.paths.SIMULINK_RUN.api) {
        data.ret_vals = SIMULINK_FILE.returnValue;
        data.ret_format = 'JSON';
    }

    $.ajax({
        url: variables.serverInfo.url + SIMULINK_OPERATION.api,
        type: SIMULINK_OPERATION.type,
        data: {
            ...data
        },
        success: resolve,
        error: reject
    });
});

const acquireLock = (SIMULINK_FILE) => new Promise((resolve, reject) => {
    runSimulink(variables.serverInfo.paths.SIMULINK_LOCK, SIMULINK_FILE).then(data => {
        // noinspection EqualityComparisonWithCoercionJS
        if (data == 'true') {
            resolve();
        } else {
            resolve(acquireLock(SIMULINK_FILE));
        }
    }).catch(e => reject(e));
});

const setParam = (SIMULINK_FILE, block, param, value) => new Promise((resolve, reject) => {
    const data = {
        api_key: variables.serverInfo.api_key,
        block: block,
        param: param,
        value: value
    };

    const SIMULINK_OPERATION = variables.serverInfo.paths.SIMULINK_SET_PARAM;
    $.ajax({
        url: variables.serverInfo.url + SIMULINK_OPERATION.api,
        type: SIMULINK_OPERATION.type,
        data: {
            ...data
        },
        success: resolve,
        error: reject
    });
});

const REPLACE_KEY = '_TO_BE_REPLACED_';
const parameters = [{
    block: '28', //`${SIMULINK_FILES.PLATOON.filename}/v01/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: '54', //`${SIMULINK_FILES.PLATOON.filename}/v12/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: '79', //`${SIMULINK_FILES.PLATOON.filename}/v23/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: '104', //`${SIMULINK_FILES.PLATOON.filename}/v34/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: '1', //`${SIMULINK_FILES.PLATOON.filename}/Integrator`,
    param: 'InitialCondition',
    value: `L+4*${REPLACE_KEY}*SL`
    // value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: '30', //`${SIMULINK_FILES.PLATOON.filename}/v01/Integrator1`,
    param: 'InitialCondition',
    value: `L+3*${REPLACE_KEY}*SL`
    // value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: '56', //`${SIMULINK_FILES.PLATOON.filename}/v12/Integrator1`,
    param: 'InitialCondition',
    value: `L+2*${REPLACE_KEY}*SL`
    // value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: '81', //`${SIMULINK_FILES.PLATOON.filename}/v23/Integrator1`,
    param: 'InitialCondition',
    value: `L+1*${REPLACE_KEY}*SL`
    // value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: '106', //`${SIMULINK_FILES.PLATOON.filename}/v34/Integrator1`,
    param: 'InitialCondition',
    value: `L+0*${REPLACE_KEY}*SL`
    // value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}];

const mapParams = (parameter, input) => new Promise((resolve, reject) => {
    setParam(SIMULINK_FILES.PLATOON, parameter.block, parameter.param, parameter.value.replace(REPLACE_KEY, input.toString())).then(data => {
        resolve(data);
    }).catch(error => {
        reject(error);
    });
});

