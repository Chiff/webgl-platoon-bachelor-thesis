import { variables } from './utils.js';

export let SIMULATION_DATA = {
    frames: -1,
    dist: -1,
    points: []
};

export const MATLAB_FILES = {
    INIT: {filename: 'Ch5_cfparams2.m', returnValue: 'G'}
};

export const SIMULINK_FILES = {
    PLATOON: 'platoon'
};

export const MATLAB_SCRIPTS = {
    setDistance: (number) => ({command: `G = ${parseFloat(number)}`, returnValue: 'G'}),
    getData: () => ({
        command: `parsedData = jsonencode(struct('dist', G, 'speeds', t_speeds))`,
        returnValue: 'parsedData'
    })
};

// promise result is ignored
export const loadData = (gap) => new Promise(resolve => {

    if (variables.offlineMode) {
        return $.get(variables.offlineDataPath, function (data) {
            console.log(data);
            parseData(data);
            resolve(data);
        });
    }

    runFile(MATLAB_FILES.INIT).then((data) => {
        console.warn('[runFile]', data);

        return runScript(MATLAB_SCRIPTS.setDistance(gap));
    }).then((data) => {
        console.warn('[runScript - setDistance]', data);

        return acquireLock(SIMULINK_FILES.PLATOON);
    }).then(() => {
        console.warn('[acquireLock] success');

        return runSimulink(variables.serverInfo.paths.SIMULINK_RUN, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RUN]', data);

        return runSimulink(variables.serverInfo.paths.SIMULINK_RELEASE, SIMULINK_FILES.PLATOON);
    }).then((data) => {
        console.warn('[SIMULINK_RELEASE]', data);

        return runScript(MATLAB_SCRIPTS.getData());
    }).then((data) => {
        console.warn('[runScript - getData]', data);
        parseData(data);
        resolve(data);
    }).catch(() => {
        alert('Nastala chyba pri ziskavani dat zo servisu - pouzivam offline data set');

        return $.get(variables.offlineDataPath, function (data) {
            console.log(data);
            parseData(data);
            resolve(data);
        });
    });
});

export const getVehicle = (number) => Object.values(SIMULATION_DATA.points).map(e => e[number]);

const parseData = (data) => {
    console.log(data);

    const parsed = {};

    data.speeds.forEach(frame => {
        const frameNumber = frame[0];
        const s1 = frame[2];
        const s2 = frame[3];
        const s3 = frame[4];
        const s4 = frame[5];
        parsed[frameNumber] = [s1, s2, s3, s4];
    });

    SIMULATION_DATA = {
        frames: data.frames,
        dist: data.dist,
        points: parsed
    };
};


const runFile = (MATLAB_FILE) => new Promise((resolve, reject) => {
    $.ajax({
        url: variables.serverInfo.url + variables.serverInfo.paths.RUN_FILE.api,
        type: variables.serverInfo.paths.RUN_FILE.type,
        data: {
            api_key: variables.serverInfo.api_key,
            file_name: MATLAB_FILE.filename,
            ret_vals: MATLAB_FILE.returnValue
        },
        success: resolve,
        error: reject
    });
});

const runScript = (MATLAB_SCRIPT) => new Promise((resolve, reject) => {
    $.ajax({
        url: variables.serverInfo.url + variables.serverInfo.paths.RUN_SCRIPT.api,
        type: variables.serverInfo.paths.RUN_SCRIPT.type,
        data: {
            api_key: variables.serverInfo.api_key,
            script: MATLAB_SCRIPT.command,
            ret_vals: MATLAB_SCRIPT.returnValue
        },
        success: resolve,
        error: reject
    });
});

const runSimulink = (SIMULINK_OPERATION, SIMULINK_FILE) => new Promise((resolve, reject) => {
    console.warn(SIMULINK_OPERATION, SIMULINK_FILE);
    $.ajax({
        url: variables.serverInfo.url + SIMULINK_OPERATION.api,
        type: SIMULINK_OPERATION.type,
        data: {
            api_key: variables.serverInfo.api_key,
            model_name: SIMULINK_FILE,
            ret_format: 'JSON',
            ret_vals: 't_speeds'
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
