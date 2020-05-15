export const variables = {
    mapDimension: 512,

    dist: null,
    simScale: null,

    totalPathPoints: 200,
    startFrames: 50,
    skipFrames: 2,
    distByFrame: 10,

    debug: false,
    cameraSettings: {
        upperLimit: 1200,
        lowerLimit: 0
    },

    offlineMode: true,
    offlineDataPath: 'assets/test.json',

    serverInfo: {
        url: 'https://147.175.121.229/',
        api_key: 'bc3d8dc1-e6f6-4ad6-bc31-85c25b814fcb',
        paths: {
            RUN_FILE: {api: 'api/matlab/run/existing', type: 'POST'},
            RUN_SCRIPT: {api: 'api/matlab/run/upload-script', type: 'POST'},
            SIMULINK_LOCK: {api: 'api/simulink/lock', type: 'POST'},
            SIMULINK_LIST: {api: 'api/simulink/block/list', type: 'POST'},
            SIMULINK_SET_PARAM: {api: 'api/simulink/block/set-param', type: 'POST'},
            SIMULINK_RUN: {api: 'api/simulink/simple-simulation', type: 'POST'},
            SIMULINK_RELEASE: {api: 'api/simulink/release', type: 'POST'}
        }
    },

    pathInfo: {
        url: null,
        name: null,
        points: null,
        timeScale: null,
        scale: {
            x: null,
            y: null
        }
    },

    chartId: '#chart',
    chart: null,
    chartCars: null
};

export const availablePaths = [{
    name: 'Had',
    url: 'assets/had.json'
}, {
    name: 'Rovinka',
    url: 'assets/rovinka.json'
}, {
    name: 'Okruh',
    url: 'assets/okruh.json'
}];

export const vehicleObjects = [{
    meshID: 'lambo',
    vehicleID: 'lambo',
    folder: 'assets/lambo/',
    file: 'lambo.babylon',
    chartColor: '#ff0000',
    order: 4,
    editMesh: (mesh) => {
        mesh.position.y -= 20;
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
    }
}, {
    meshID: 'transporter',
    vehicleID: 'transporter',
    folder: 'assets/transporter/',
    file: 'transporter.babylon',
    chartColor: '#00ff00',
    order: 3,
    editMesh: (mesh) => {
        mesh.position.y -= 20;
        mesh.scaling = new BABYLON.Vector3(0.92, 0.92, 0.92);
    }
}, {
    meshID: 'bus',
    vehicleID: 'bus',
    folder: 'assets/bus/',
    file: 'bus.babylon',
    chartColor: '#0000ff',
    order: 1,
    editMesh: (mesh) => {
        mesh.position.y -= 20;
        mesh.scaling = new BABYLON.Vector3(1.05, 1.05, 1.05);
    }
}, {
    meshID: 'truck',
    vehicleID: 'truck',
    folder: 'assets/truck/',
    file: 'truck2.babylon',
    chartColor: '#ffa500',
    order: 2,
    editMesh: (mesh) => {
        mesh.position.y -= 20;
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
    }
}];

BABYLON.Mesh.prototype.createSurfacePoints = function (pointDensity) {
    const positions = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const indices = this.getIndices();

    const point = BABYLON.Vector3.Zero();
    const points = [];

    const randX = 0;
    const randY = 0;
    const randZ = 0;

    let id0 = 0;
    let id1 = 0;
    let id2 = 0;
    let v0X = 0;
    let v0Y = 0;
    let v0Z = 0;
    let v1X = 0;
    let v1Y = 0;
    let v1Z = 0;
    let v2X = 0;
    let v2Y = 0;
    let v2Z = 0;
    const vertex0 = BABYLON.Vector3.Zero();
    const vertex1 = BABYLON.Vector3.Zero();
    const vertex2 = BABYLON.Vector3.Zero();
    const vec0 = BABYLON.Vector3.Zero();
    const vec1 = BABYLON.Vector3.Zero();
    const vec2 = BABYLON.Vector3.Zero();

    let a = 0; //length of side of triangle
    let b = 0; //length of side of triangle
    let c = 0; //length of side of triangle
    let p = 0; //perimeter of triangle
    let area = 0;
    let nbPoints = 0; //nbPoints per triangle

    let lamda = 0;
    let mu = 0;

    for (let index = 0; index < indices.length / 3; index++) {
        id0 = indices[3 * index];
        id1 = indices[3 * index + 1];
        id2 = indices[3 * index + 2];
        v0X = positions[3 * id0];
        v0Y = positions[3 * id0 + 1];
        v0Z = positions[3 * id0 + 2];
        v1X = positions[3 * id1];
        v1Y = positions[3 * id1 + 1];
        v1Z = positions[3 * id1 + 2];
        v2X = positions[3 * id2];
        v2Y = positions[3 * id2 + 1];
        v2Z = positions[3 * id2 + 2];
        vertex0.set(v0X, v0Y, v0Z);
        vertex1.set(v1X, v1Y, v1Z);
        vertex2.set(v2X, v2Y, v2Z);
        vertex1.subtractToRef(vertex0, vec0);
        vertex2.subtractToRef(vertex1, vec1);
        vertex2.subtractToRef(vertex0, vec2);
        a = vec0.length();
        b = vec1.length();
        c = vec2.length();
        p = (a + b + c) / 2;
        area = Math.sqrt(p * (p - a) * (p - b) * (p - c));
        nbPoints = Math.round(pointDensity * area);
        for (let i = 0; i < nbPoints; i++) {
            //form a point inside the facet v0, v1, v2;
            lamda = BABYLON.Scalar.RandomRange(0, 1);
            mu = BABYLON.Scalar.RandomRange(0, 1);

            const facetPoint = vertex0.add(vec0.scale(lamda)).add(vec1.scale(lamda * mu));
            points.push(facetPoint);
        }
    }
    return points;
};

export const getFormData = ($form) => {
    const unindexed_array = $form.serializeArray();
    const indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
};
