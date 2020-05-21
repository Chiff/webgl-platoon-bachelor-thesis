import { initTerrainDraw } from './height.js';
import { variables } from './utils.js';

export const createGround = (simulation) => {
    initTerrainDraw(simulation.scene, simulation.path);

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', simulation.scene);

    groundMaterial.alpha = 1.0;
    groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    groundMaterial.backFaceCulling = false;
    groundMaterial.specularColor = new BABYLON.Color3(0.035, 0.047, 0.020);

    groundMaterial.ambientTexture = new BABYLON.Texture('assets/grass.png', simulation.scene);
    groundMaterial.ambientTexture.uScale = 50;
    groundMaterial.ambientTexture.vScale = 50;

    if (variables.debug) {
        groundMaterial.wireframe = true;
    }

    let ground = null
    if (!variables.lowPerformance) {
        ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            'ground',
            document.getElementById('imgSave').src,
            variables.mapDimension, variables.mapDimension, 200, 0, 5,
            simulation.scene,
            false
        );
        // myGround.rotation.y +=  Math.PI;
        ground.diffuseColor = BABYLON.Color3.Black();
        ground.material = groundMaterial;
        ground.isPickable = false;
    }

    const backGround = BABYLON.MeshBuilder.CreateGround('backGround', {
        width: variables.mapDimension * 2,
        height: variables.mapDimension * 2,
        subdivisions: 1
    }, simulation.scene);

    const backGroundMaterial = groundMaterial.clone('backGroundMaterial');
    backGroundMaterial.ambientTexture.uScale = 50 * 2;
    backGroundMaterial.ambientTexture.vScale = 50 * 2;

    backGround.material = backGroundMaterial;
    backGround.isPickable = false;
    backGround.position.y = -0.1;

    groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    simulation.ground = ground || backGround;
}


export const createVegetation = (scene) => {
    BABYLON.SceneLoader.Append('assets/foliage/', 'bush.babylon', scene);
    BABYLON.SceneLoader.Append('assets/foliage/', 'grass.babylon', scene);
    BABYLON.SceneLoader.Append('assets/foliage/', 'tree-1.babylon', scene);
    BABYLON.SceneLoader.Append('assets/foliage/', 'tree-2.babylon', scene);

    scene.executeWhenReady(function () {
        const parentSPS = scene.getMeshByName('roadVegetation');
        const positions = parentSPS.createSurfacePoints(0.06);

        const myBuilder = function (particle, i, s, y = 0) {
            if (positions.length < 3) {
                return;
                // throw 'OUT OF INDICES!';
            }

            let randomPosition = Math.round(Math.random() * positions.length) - 1;
            randomPosition -= (randomPosition % 3);

            try {
                particle.position = new BABYLON.Vector3(
                    positions[randomPosition].x,
                    positions[randomPosition].y + y,
                    positions[randomPosition].z
                );
            } catch (e) {
                console.log(positions);
                console.log(positions[randomPosition]);
            }

            const scale = Math.random() + 0.2;
            particle.scaling.x = scale;
            particle.scaling.y = scale;
            particle.scaling.z = scale;

            // positions.splice(randomPosition - 9, 12);

            const position = {...particle.position};
            position.y = -2;
            const direction = new BABYLON.Vector3(0, 1, 0);
            const ray = new BABYLON.Ray(position, direction, 100);

            const hit = scene.pickWithRay(ray);

            if (hit.pickedMesh && hit.pickedMesh.name !== 'roadVegetation') {
                myBuilder(particle, i, s, y);
            }

            particle.position.y = 2;
        };

        const shapeCount = {
            tree1: Math.floor(positions.length * 0.1 * 0.08),
            tree2: Math.floor(positions.length * 0.1 * 0.15),
            grass1: Math.floor(positions.length * 0.1 * 0.42),
            bush1: Math.floor(positions.length * 0.1 * 0.35)
        };

        // tree 1
        let t = scene.getMeshByName('tree-1');

        const SPSTree1 = new BABYLON.SolidParticleSystem('SPSTree1', scene, {updatable: false});
        SPSTree1.addShape(t, shapeCount.tree1, {positionFunction: myBuilder});
        const SPSMeshTree = SPSTree1.buildMesh();
        SPSMeshTree.material = t.material;
        SPSMeshTree.material.specularColor = BABYLON.Color3.Black();
        SPSMeshTree.parent = parentSPS;
        SPSMeshTree.isPickable = false;

        t.dispose();

        // tree 2
        let t2 = scene.getMeshByName('tree-2');

        const SPSTree2 = new BABYLON.SolidParticleSystem('SPSTree2', scene, {updatable: false});
        SPSTree2.addShape(t2, shapeCount.tree2, {positionFunction: myBuilder});
        const SPSMeshTree2 = SPSTree2.buildMesh();
        SPSMeshTree2.material = t2.material;
        SPSMeshTree2.material.specularColor = BABYLON.Color3.Black();
        SPSMeshTree2.parent = parentSPS;
        SPSMeshTree2.isPickable = false;

        t2.dispose();

        // grass 1
        let g = scene.getMeshByName('grass-1');

        const SPSGrass1 = new BABYLON.SolidParticleSystem('SPSGrass1', scene, {updatable: false});
        SPSGrass1.addShape(g, shapeCount.grass1, {positionFunction: myBuilder});
        const SPSMeshGrass = SPSGrass1.buildMesh();
        SPSMeshGrass.material = t.material;
        SPSMeshGrass.material.specularColor = BABYLON.Color3.Black();
        SPSMeshGrass.parent = parentSPS;
        SPSMeshGrass.isPickable = false;

        g.dispose();

        // bush 1
        let b = scene.getMeshByName('bush-1');

        const SPSBush1 = new BABYLON.SolidParticleSystem('SPSBush1', scene, {updatable: false});
        SPSBush1.addShape(b, shapeCount.bush1, {positionFunction: myBuilder});
        const SPSMeshBush = SPSBush1.buildMesh();
        SPSMeshBush.material = b.material;
        SPSMeshBush.material.specularColor = BABYLON.Color3.Black();
        SPSMeshBush.parent = parentSPS;
        SPSMeshBush.isPickable = false;

        b.dispose();
    });
};
