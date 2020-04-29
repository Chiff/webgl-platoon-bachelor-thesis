import { variables } from './utils.js';

export class CarPathAnim {
    constructor(path, mesh, speed, scene) {
        this.path = path;
        this.meshes = mesh;
        this.scene = scene;

        // TODO - implement
        this.speed = speed;

        window.speed = this.speed;

        this.createAnimation();
        this.startAnimation();
    }

    createAnimation(showLine) {
        const curve = new BABYLON.Curve3(this.path);
        const curvePoints = curve.getPoints();

        if(variables.debug){
            BABYLON.Mesh.CreateLines('car-path-' + Date.now(), curvePoints, this.scene);
        }

        const path3d = new BABYLON.Path3D(curvePoints);
        const tangents = path3d.getTangents();  //array of tangents to the curve
        const normals = path3d.getNormals(); //array of normals to the curve
        const binormals = path3d.getBinormals();

        const animationPosition = new BABYLON.Animation('animPos', 'position', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const animationRotation = new BABYLON.Animation('animRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const animationWheelRotation = new BABYLON.Animation('animWheelRot', 'rotation', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const keysPosition = [];
        const keysRotation = [];
        const wheelRotation = [];

        for (let p = 0; p < curvePoints.length; p++) {
            keysPosition.push({
                frame: p,
                value: curvePoints[p]
            });

            keysRotation.push({
                frame: p,
                value: BABYLON.Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p])
            });

            wheelRotation.push({
                frame: p,
                value: new BABYLON.Vector3(p * 0.5, 0, 0)
            });
        }

        animationPosition.setKeys(keysPosition);
        animationRotation.setKeys(keysRotation);
        animationWheelRotation.setKeys(wheelRotation);

        const animationGroup = new BABYLON.AnimationGroup('CarAnim-' + Date.now());
        animationGroup.addTargetedAnimation(animationPosition, this.meshes.body);
        animationGroup.addTargetedAnimation(animationRotation, this.meshes.body);
        animationGroup.addTargetedAnimation(animationWheelRotation, this.meshes.kfl);
        animationGroup.addTargetedAnimation(animationWheelRotation, this.meshes.krl);
        animationGroup.addTargetedAnimation(animationWheelRotation, this.meshes.kfr);
        animationGroup.addTargetedAnimation(animationWheelRotation, this.meshes.krr);

        animationGroup.speedRatio = 0.5;
        this.animationGroup = animationGroup;
    }


    startAnimation() {
        this.animationGroup.play(true);
    }

    // TODO - fixme
    stopAnimation() {
        this.animationGroup.play(false);
    }

    changeSpeed(speed) {
        this.animationGroup.speedRatio *= speed;
    }
}
