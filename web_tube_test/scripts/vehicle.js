import { CarPathAnim } from './carPathAnim.js';
import { vehicleObjects } from './utils.js';

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
        this.anim.carTimeline.eventCallback('onStart', () => {
            this.show();

            if (carNumber === 0) {
                $(document).trigger('animationStart', this);
            }
        });
        this.anim.carTimeline.eventCallback('onComplete', () => {
            this.hide();

            if (carNumber + 1 === vehicleObjects.length) {
                $(document).trigger('animationEnd', this);
            }
        });


        this.hide();
    }

    start(otherCars) {
        this.otherCars = otherCars;
        this.anim.startAnimation();
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

    // TODO - 30/04/2020 - implement
    // setColor() {
    //     this.meshes.body.diffuseColor = new BABYLON.Color3(255, 0, 0);
    // }


    // TODO - 19.4.2019 - camera should follow vehicle rotation
    focusCar() {
        this.camera.lockedTarget = this.meshes.body;
        if (this.anim.speedLine) {
            this.otherCars.forEach(car => {
                car.anim.speedLine.color = new BABYLON.Color3(1, 1, 1);
            });
            this.anim.speedLine.color = new BABYLON.Color3(255, 0, 0);
        }
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
