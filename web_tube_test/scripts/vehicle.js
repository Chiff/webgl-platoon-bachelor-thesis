import { CarPathAnim } from './carPathAnim.js';

export class Vehicle {
    constructor(scene) {
        this.scene = scene;
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

    addFollowPath(carPath, cam) {
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

        this.anim = new CarPathAnim(heightPath, this.meshes, 2, this.scene, cam);
    }

    // TODO - 19.4.2019 - camera should follow vehicle rotation
    focusCar(cam, inside) {
        if (!inside) {
            cam.lockedTarget = this.meshes.body;
        } else {
            cam.lockedTarget = this.meshes.cam;
        }
    }

    changeSpeed(speed) {
        this.anim.changeSpeed(speed);
    }
}
