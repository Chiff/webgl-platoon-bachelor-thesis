// TODO - 30/04/2020 - trocha
export const DATA_URL = 'assets/test.json';
export let SIMULATION_DATA = {
    frames: -1,
    dist: -1,
    points: []
};


export const loadData = (gap) => {
    return new Promise(resolve => {
        $.get(DATA_URL, function (data) {
            console.log(data);

            const parsed = {};

            data.speeds.forEach(frame => {
                const frameNumber = frame[0];
                const s1 = frame[2];
                const s2 = frame[3] ;
                const s3 = frame[4] ;
                const s4 = frame[5] ;
                parsed[frameNumber] = [s1, s2, s3, s4];
            });

            SIMULATION_DATA = {
                frames: data.frames,
                dist: data.dist,
                points: parsed
            };

            resolve(data);
        });
    });
};

export const getVehicle = (number) => Object.values(SIMULATION_DATA.points).map(e => e[number]);


