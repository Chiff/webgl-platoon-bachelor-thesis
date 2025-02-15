import { variables } from './utils.js';
import { getVehicle } from './data.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Curve3, DynamicTexture, Mesh, Path3D, StandardMaterial } from '@babylonjs/core';
import gsap from 'gsap';
import $ from 'jquery';

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
        const roadPath = new Curve3(this.path);
        const roadPathPoints = roadPath.getPoints();
        const path3d = new Path3D(roadPathPoints);

        const tangents = path3d.getTangents();
        const normals = path3d.getNormals();
        const binormals = path3d.getBinormals();


        // speeds
        const mphToMps = (mph) => mph / 2.237;
        const frameCurve = new Curve3(getVehicle(carNumber).map((e, i) => new Vector3(i, mphToMps(e), 0)));
        const framePath = new Path3D(frameCurve.getPoints());


        //animation
        const carTimeline = gsap.timeline();

        carTimeline.repeat(0);
        carTimeline.pause();


        // chart point for each roadPathPoint
        const chartName = variables.chartCars[carNumber].name;
        let prevIndex = 0;

        // speed to path
        const debugInfo = [];
        for (let p = 0; p < roadPathPoints.length; p += variables.skipFrames) {
            const frameInfo = framePath.getPointAt(p / roadPathPoints.length);

            const distance = path3d.getDistanceAt((p + variables.skipFrames) / roadPathPoints.length) - path3d.getDistanceAt(p / roadPathPoints.length);
            const speed = frameInfo.y;
            const duration = this.speedToTime(distance, speed);

            const point = roadPathPoints[p];
            carTimeline.to(this.meshes.body.position, {
                x: point.x,
                y: point.y,
                z: point.z,
                duration
            }, 'point' + p).call(() => {
                const graphIndex = Math.round(frameInfo.x / variables.skipFrames) % variables.chartCars[carNumber].data.length;

                $(`.c3-shapes-${chartName} circle.c3-shape-${prevIndex}`).attr('r', variables.chartCircleSize);
                $(`.c3-shapes-${chartName} circle.c3-shape-${graphIndex}`).attr('r', variables.chartCircleSizeActive);

                prevIndex = graphIndex;
            });

            const rotation = Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p]);
            carTimeline.to(this.meshes.body.rotation, {
                directionalRotation: {
                    x: rotation.x + '_short',
                    y: rotation.y + '_short',
                    z: rotation.z + '_short',
                    useRadians: true
                },
                duration,
            }, 'point' + p);

            if (p === 0) {
                this.meshes.body.rotation = rotation;
                this.meshes.body.position = point;
            }

            const wheelRotation = {x: p, duration};
            carTimeline.to(this.meshes.kfl.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.kfr.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.krl.rotation, wheelRotation, 'point' + p);
            carTimeline.to(this.meshes.krr.rotation, wheelRotation, 'point' + p);

            // presunutie objektu pred zaciatkom animacie na spravne miesto
            if (p === 0) {
                this.meshes.body.rotation = rotation;
                this.meshes.body.position = point;
            }

            // debug info
            if (variables.debug && carNumber === 0) {
                showAxis(3, p, this.scene, point.clone(), rotation.clone());
            }

            debugInfo.push({
                p,
                i: frameInfo.x,
                speed: frameInfo.y,
                duration,
                distance,
                position: {
                    ...point
                },
                rCalc: rotation,
                rotation: {
                    normals: normals[p], binormals: binormals[p], tangents: tangents[p]
                }
            });
        }

        const customTimeScale = parseFloat(variables.simScale);
        const MAGIC_AVG_DURATION = 22; // seconds
        carTimeline.duration(MAGIC_AVG_DURATION * (customTimeScale ? customTimeScale : variables.pathInfo.timeScale));

        this.carTimeline = carTimeline;

        if (variables.debug) {
            Mesh.CreateLines('car-path-' + Date.now(), roadPathPoints, this.scene);
            this.speedLine = Mesh.CreateLines('car-speed-' + Date.now(), frameCurve.getPoints(), this.scene);
            this.speedLine.scaling = new Vector3((variables.mapDimension) / frameCurve.getPoints().length, 1, 1);
            this.speedLine.position.x = variables.mapDimension / 4;
            console.log(carNumber, debugInfo);
        }
    }

    speedToTime(distance, speed) {
        return (distance * variables.distanceMultiplier) / speed;
    }
}

const showAxis = function (size, index, scene, position, rotation) {
    const makeTextPlane = function (text, color, size) {
        const dynamicTexture = new DynamicTexture('DynamicTexture', 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
        const plane = new Mesh.CreatePlane('TextPlane', size, scene, true);
        plane.material = new StandardMaterial('TextPlaneMaterial', scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };

    const axisX = Mesh.CreateLines('axisX', [
        new Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new Color3(1, 0, 0);

    axisX.position.x = position.x;
    axisX.position.y = position.y;
    axisX.position.z = position.z;
    axisX.rotation = rotation;


    const axisY = Mesh.CreateLines('axisY', [
        new Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
    ], scene);
    axisY.color = new Color3(0, 1, 0);

    axisY.position.x = position.x;
    axisY.position.y = position.y;
    axisY.position.z = position.z;
    axisY.rotation = rotation;


    const axisZ = Mesh.CreateLines('axisZ', [
        new Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new Color3(0, 0, 1);

    axisZ.position.x = position.x;
    axisZ.position.y = position.y;
    axisZ.position.z = position.z;
    axisZ.rotation = rotation;

    const zChar = makeTextPlane(index, 'blue', 1);
    zChar.position = position;
    zChar.position.y += 0.5;
    zChar.position.x += 0.5;
};

