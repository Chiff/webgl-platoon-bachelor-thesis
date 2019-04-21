import { CarPathAnim } from './carPathAnim.js';
import { variables } from './utils.js';

export class Vehicle {
    constructor(scene) {
        this.scene = scene;
    }

    load(meshID, objFolder, objFile, customizeMesh) {
        this.meshID = meshID;


        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.Append(objFolder, objFile, this.scene, (newScene) => {
                newScene.meshes.map((mesh) => {
                    if (mesh.id.includes(meshID)) {
                        customizeMesh(mesh);
                        this.vehicle = mesh;
                        this.driverCam = this.vehicle.getChildMeshes(true, (node) => node.id.includes('_driver'));
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
        const vehicle = this.vehicle;

        // TODO - 19.4.2019 - access vehicle tires and steer them
        // const kfl = this.scene.getMeshByID('lambo_koleso_fl');
        // const kfr = this.scene.getMeshByID('lambo_koleso_fr');
        // const krl = this.scene.getMeshByID('lambo_koleso_rl');
        // const krr = this.scene.getMeshByID('lambo_koleso_rr');

        vehicle.position.x = carPath[0].x;
        vehicle.position.y = carPath[0].y;
        vehicle.position.z = carPath[0].z;
        window.anim = new CarPathAnim(carPath, vehicle, 2, this.scene, cam);
    }

    // TODO - 19.4.2019 - camera should follow vehicle rotation
    focusCar(cam) {
        variables.skySphere.parent = this.vehicle;
        cam.lockedTarget = this.vehicle;
    }
}
