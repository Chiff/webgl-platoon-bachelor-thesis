export class CarPathAnim {
    constructor(path, mesh, speed, scene) {
        this.path = path;
        this.mesh = mesh;
        this.scene = scene;

        // TODO - implement
        this.speed = speed;

        window.speed = this.speed;

        this.createAnimation();
        this.startAnimation();
    }

    createAnimation() {
        const curve = new BABYLON.Curve3(this.path);
        const curvePoints = curve.getPoints();
        const line = BABYLON.Mesh.CreateLines("car-path-" + Date.now(), curvePoints, this.scene);
        const path3d = new BABYLON.Path3D(curvePoints);
        const tangents = path3d.getTangents();  //array of tangents to the curve
        const normals = path3d.getNormals(); //array of normals to the curve
        const binormals = path3d.getBinormals();


        const animationPosition = new BABYLON.Animation("animPos", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const animationRotation = new BABYLON.Animation("animRot", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const keysPosition = [];
        let keysRotation = [];

        for (let p = 0; p < curvePoints.length; p++) {
            keysPosition.push({
                frame: p,
                value: curvePoints[p]
            });

            keysRotation.push({
                frame: p,
                value: BABYLON.Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p])
            })


        }
        console.log(keysRotation);
        keysRotation = keysRotation.map(key => {
            key.value = {
                x: (-Math.PI / 2) - key.value.x,
                y: Math.PI + key.value.y,
                z: (-Math.PI / 2) - key.value.z,
            };
            return key;
        });
        console.log(this.mesh.rotation);
        console.log(animationRotation);
        console.log(keysRotation);


        animationPosition.setKeys(keysPosition);
        animationRotation.setKeys(keysRotation);


        const animationGroup = new BABYLON.AnimationGroup("CarAnim-" + Date.now());
        animationGroup.addTargetedAnimation(animationPosition, this.mesh);
        animationGroup.addTargetedAnimation(animationRotation, this.mesh);

        animationGroup.speedRatio = this.speed;
        this.animationGroup = animationGroup;
    }


    startAnimation() {
        this.animationGroup.play(true);
    }

    // TODO - fixme
    stopAnimation() {
        this.animationGroup.play(false);
    }
}
