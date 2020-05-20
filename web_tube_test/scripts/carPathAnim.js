import { variables } from './utils.js';
import { getVehicle } from './data.js';

export class CarPathAnim {
    constructor(path, mesh, speed, scene, carNumber) {
        this.path = path;
        this.meshes = mesh;
        this.scene = scene;
        this.carTimeline = null;

        this.turboAnimation(carNumber);
    }

    startAnimation() {
        this.carTimeline.restart(true);
    }

    turboAnimation(carNumber) {
        // path
        const roadPath = new BABYLON.Curve3(this.path);
        const roadPathPoints = roadPath.getPoints();
        const path3d = new BABYLON.Path3D(roadPathPoints);

        const tangents = path3d.getTangents();
        const normals = path3d.getNormals();
        const binormals = path3d.getBinormals();


        // speeds
        const frameCurve = new BABYLON.Curve3(getVehicle(carNumber).map((e, i) => new BABYLON.Vector3(i - variables.mapDimension / 2, e, 0)));
        const framePath = new BABYLON.Path3D(frameCurve.getPoints());


        //animation
        const carTimeline = gsap.timeline();

        carTimeline.repeat(0);
        carTimeline.pause();

        // chart point for each roadPathPoint
        const chartName = variables.chartCars[carNumber].name;
        const chartIndexes = [];
        const allChartPoints = variables.chartCars[carNumber].data;
        const step = (allChartPoints.length - 1) / (variables.totalPathPoints);

        for (let i = 0; i < variables.totalPathPoints; i++) {
            const index = Math.round(step * i);
            chartIndexes.push(index);
        }

        chartIndexes.push(allChartPoints.length - 1);

        // speed to path
        for (let p = 0; p < roadPathPoints.length; p += variables.skipFrames) {
            const speedAtTime = framePath.getPointAt(p / roadPathPoints.length).y;
            const duration = this.speedToTime(speedAtTime);

            const point = roadPathPoints[p];
            carTimeline.to(this.meshes.body.position, {
                x: point.x,
                y: point.y,
                z: point.z,
                duration
            }, 'point' + p).call(() => {
                $(`.c3-shapes-${chartName} circle.c3-shape-${chartIndexes[p]}`).attr('r', variables.chartCircleSize);
                $(`.c3-shapes-${chartName} circle.c3-shape-${chartIndexes[(p + variables.skipFrames) % variables.totalPathPoints]}`).attr('r', variables.chartCircleSizeActive);
            });


            const rotation = BABYLON.Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p]);
            carTimeline.to(this.meshes.body.rotation, {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
                duration
            }, 'point' + p);


            const wheelRotation = {x: p * 0.5, duration};
            carTimeline.to(this.meshes.kfl.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.kfr.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.krl.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.krr.rotation, wheelRotation, 'point' + p);
        }

        const customTimeScale = parseFloat(variables.simScale);
        const MAGIC_AVG_DURATION = 19;
        carTimeline.duration(MAGIC_AVG_DURATION * (customTimeScale ? customTimeScale : variables.pathInfo.timeScale));

        this.carTimeline = carTimeline;

        if (variables.debug) {
            BABYLON.Mesh.CreateLines('car-path-' + Date.now(), roadPathPoints, this.scene);
            this.speedLine = BABYLON.Mesh.CreateLines('car-speed-' + Date.now(), frameCurve.getPoints(), this.scene);
            this.speedLine.scaling = new BABYLON.Vector3((variables.mapDimension) / frameCurve.getPoints().length, 1, 1);
            this.speedLine.position.x = variables.mapDimension / 4;
        }
    }

    speedToTime(speed) {
        return variables.distByFrame / speed;
    }
}
