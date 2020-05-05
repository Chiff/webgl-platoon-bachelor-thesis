import { variables } from './utils.js';

export let SIMULATION_DATA = {
    frames: -1,
    dist: -1,
    points: []
};

// export const MATLAB_FILES = {
//     INIT: {filename: 'Ch5_cfparams2.m', returnValue: 'G,L'},
//     SET_PARAMS: {filename: 'init2.m', returnValue: 'acc'}
// };
//
// export const MATLAB_SCRIPTS = {
//     setDistance: (number) => ({command: `G = ${parseFloat(number)}`, returnValue: 'G'})
// };

export const SIMULINK_FILES = {
    PLATOON: {filename: 'platoon1h', returnValue: 'speeds'},
    BOUNCE: {filename: 'bounce', returnValue: 'Position'}
};

// promise result is ignored
export const loadData = () => new Promise(resolve => {

    if (variables.offlineMode) {
        return $.get(variables.offlineDataPath, function (data) {
            console.log(data);
            parseData(data);
            resolve(data);
        });
    }

    const gap = variables.dist;
    let response = null;

    acquireLock(SIMULINK_FILES.PLATOON).then(() => {
        console.warn('[acquireLock] success');
        return runSimulink(variables.serverInfo.paths.SIMULINK_LIST, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        // console.warn('[SIMULINK_LIST]', data);
        // return Promise.all(parameters.map((e) => mapParams(e, gap)));
        return new Promise(resolve => resolve('TODO - SET DISTANCE PARAMETER!'));
    }).then((data) => {
        console.warn('[parameters]', data);
        return runSimulink(variables.serverInfo.paths.SIMULINK_RUN, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RUN]', data);
        response = data;
        return runSimulink(variables.serverInfo.paths.SIMULINK_RELEASE, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RELEASE]', data);
        resolve(parseData(response.return));
    }).catch((error) => {
        console.error(error);
        alert('Nastala chyba pri ziskavani dat zo servisu - pouzivam offline data set');

        return $.get(variables.offlineDataPath, function (data) {
            resolve(parseData(data));
        });
    });
});

export const getVehicle = (number) => Object.values(SIMULATION_DATA.points).map(e => e[number]);

const parseData = (data) => {
    const parsed = {};

    if (typeof data === 'string')
        data = JSON.parse(data.speeds);

    if (typeof data.speeds === 'string')
        data.speeds = JSON.parse(data.speeds);

    console.log(data);

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

    console.log(SIMULATION_DATA);
    return SIMULATION_DATA;
};

// const runFile = (MATLAB_FILE) => new Promise((resolve, reject) => {
//     $.ajax({
//         url: variables.serverInfo.url + variables.serverInfo.paths.RUN_FILE.api,
//         type: variables.serverInfo.paths.RUN_FILE.type,
//         data: {
//             api_key: variables.serverInfo.api_key,
//             file_name: MATLAB_FILE.filename,
//             ret_vals: MATLAB_FILE.returnValue
//         },
//         success: resolve,
//         error: reject
//     });
// });

// const runScript = (MATLAB_SCRIPT) => new Promise((resolve, reject) => {
//     $.ajax({
//         url: variables.serverInfo.url + variables.serverInfo.paths.RUN_SCRIPT.api,
//         type: variables.serverInfo.paths.RUN_SCRIPT.type,
//         data: {
//             api_key: variables.serverInfo.api_key,
//             script: MATLAB_SCRIPT.command,
//             ret_vals: MATLAB_SCRIPT.returnValue
//         },
//         success: resolve,
//         error: reject
//     });
// });

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

// $.ajax({type:'POST', url: 'https://147.175.121.229/api/simulink/block/set-param', data: {block:'bounce/Memory', param: 'InitialCondition', value: 0, api_key: 'a2efddcf-adfc-484f-a17b-5c3d676cacb6'}})
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
    block: `${SIMULINK_FILES.PLATOON.filename}/v01/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v12/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v23/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v34/GG1`,
    param: 'Value',
    value: `${REPLACE_KEY}`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v01/Integrator1`,
    param: 'InitialCondition',
    value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v12/Integrator1`,
    param: 'InitialCondition',
    value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v23/Integrator1`,
    param: 'InitialCondition',
    value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}, {
    block: `${SIMULINK_FILES.PLATOON.filename}/v34/Integrator1`,
    param: 'InitialCondition',
    value: `strcat("L+3*","${REPLACE_KEY}","*SL")`
}];

const mapParams = (parameter, input) => new Promise((resolve, reject) => {
    setParam(SIMULINK_FILES.PLATOON, parameter.block, parameter.param, parameter.value.replace(REPLACE_KEY, input.toString())).then(data => {
        resolve(data);
    }).catch(error => {
        // TODO - 05/05/2020 - toto je len test ci nahodou API nevratila nespravny error code
        // console.warn(error);
        // resolve(error);
        reject(error);
    });
});

