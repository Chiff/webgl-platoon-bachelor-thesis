import { CarPathAnim } from './carPathAnim.js';
import { variables } from './utils.js';

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
                        this.meshes.cam = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_driver'));
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

    // TODO - 19.4.2019
    //  - remove window variables and use BabylonGUI
    //  - https://doc.babylonjs.com/how_to/gui
    addFollowPath(carPath, cam) {
        const vehicle = this.meshes.body;

        this.meshes.kfl = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_fl'));
        this.meshes.kfr = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_fr'));
        this.meshes.krl = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_rl'));
        this.meshes.krr = this.meshes.body.getChildMeshes(true, (node) => node.id.includes('_koleso_rr'));

        vehicle.position.x = carPath[0].x;
        vehicle.position.y = carPath[0].y;
        vehicle.position.z = carPath[0].z;
        window.anim = new CarPathAnim(carPath, this.meshes, 2, this.scene, cam);
    }

    // TODO - 19.4.2019 - camera should follow vehicle rotation
    focusCar(cam) {
        variables.skySphere.parent = this.meshes.body;
        cam.lockedTarget = this.meshes.body;
    }
}
