import { CarPathAnim } from './carPathAnim.js';
import { variables } from './utils.js';

export class Vehicle {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.otherCars = null;
        this.meshes = {
            body: null,
            kfl: null,
            kfr: null,
            krl: null,
            krr: null,
            cam: null
        };
    }

    load(meshID, objFolder, objFile, customizeMesh) {
        this.meshID = meshID;

        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.Append(objFolder, objFile, this.scene, (newScene) => {
                newScene.meshes.map((mesh) => {
                    if (mesh.id.includes(meshID + '_telo')) {
                        customizeMesh(mesh);
                        this.meshes.body = mesh;
                        this.meshes.cam = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_driver'))[0];
                    }

                    return mesh;
                });

                resolve(this);
            }, (progress) => {
            }, (error) => {
                reject(error);
            });
        });
    }

    addFollowPath(carPath, carNumber) {
        const vehicle = this.meshes.body;

        this.meshes.kfl = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_fl'))[0];
        this.meshes.kfr = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_fr'))[0];
        this.meshes.krl = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_rl'))[0];
        this.meshes.krr = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_rr'))[0];

        const wheelSize = this.meshes.kfl.getBoundingInfo().boundingBox.extendSize.y * this.meshes.body.scaling.y * this.meshes.kfl.scaling.y;

        vehicle.position.x = carPath[0].x;
        vehicle.position.y = carPath[0].y;
        vehicle.position.z = carPath[0].z;

        const heightPath = [];
        for (let i = 0; i < carPath.length; i++) {
            heightPath.push(new BABYLON.Vector3(carPath[i].x, (carPath[i].y + wheelSize), carPath[i].z));
        }

        this.anim = new CarPathAnim(heightPath, this.meshes, 2, this.scene, carNumber);

        // manual restart is required because GSAP infinite repeat overrides its totalDuration
        this.anim.carTimeline.eventCallback('onComplete', () => {
            this.start(null, carNumber);
        });
    }

    start(otherCars, i) {
        this.anim.startAnimation();

        // otherCars is used only first time
        if (otherCars) {
            this.otherCars = otherCars;

            const MAGIC_MULTIPLIER = 7.5
            const goal = (otherCars.length - i - 1) * variables.dist * MAGIC_MULTIPLIER;
            const possibleStartingPoints = [];
            for (let i = 0; i < variables.totalPathPoints; i += variables.skipFrames) {
                possibleStartingPoints.push(i);
            }

            const closest = possibleStartingPoints.reduce(function(prev, curr) {
                return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
            });

            console.warn(closest, goal, variables.skipFrames);
            this.anim.carTimeline.seek('point' + closest);
        }
    }

    setOpacity(number) {
        this.meshes.body.visibility = number;
        this.meshes.kfl.visibility = number;
        this.meshes.kfr.visibility = number;
        this.meshes.krl.visibility = number;
        this.meshes.krr.visibility = number;
    }

    hide() {
        this.setOpacity(0);
    }

    show() {
        this.setOpacity(1);
    }

    focusCar() {
        this.camera.lockedTarget = this.meshes.body;
        if (this.anim.speedLine) {
            this.otherCars.forEach(car => {
                car.anim.speedLine.color = new BABYLON.Color3(1, 1, 1);
            });
            this.anim.speedLine.color = new BABYLON.Color3(255, 0, 0);
        }

        this.otherCars.forEach((car, i) => {
            const $car = $(`${variables.chartId} .c3-line-car${i + 1}`);

            $car.css('stroke-width', this.meshID === car.meshID ? '5px' : '1px');
            $car.css('z-index', this.meshID === car.meshID ? '9999' : '1');
        });
    }
}

export const onVehicleLoad = (vehicle, obj, i, carPathAnim, isDebug) => {
    vehicle.addFollowPath(carPathAnim, i);
    const $controls = $('.controls');

    $controls.append('<button id="' + obj.meshID + '">' + obj.meshID + '</button>');
    $('#' + obj.meshID).click(() => {
        vehicle.focusCar();
    });
};
