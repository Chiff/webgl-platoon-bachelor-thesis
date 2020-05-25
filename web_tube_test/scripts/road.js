/**
 * @class Road
 * @param {RoadSettings} settings
 * @param {Material} material
 * @param {Curve3} curve
 * @param {Mesh} mesh
 * @see RoadSettings
 */
import { Color3, Curve3, Material, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3 } from '@babylonjs/core';

export class Road {
    /**
     * @constructor
     * @param {RoadSettings} settings
     */
    constructor(settings) {
        this.settings = settings;
        this.changeSettings(settings);
    }

    /**
     * @public
     * @method changeSettings
     * @param {RoadSettings} settings
     */
    changeSettings(settings) {
        this.mesh = null;
        this.material = this.createMaterial();
        this.curve = this.createCurve();
    }

    /**
     * @private
     * @method createMaterial
     * @return {StandardMaterial} material
     */
    createMaterial() {
        const mat = new StandardMaterial('mat-' + Date.now(), this.settings.scene);

        mat.alpha = 1.0;
        mat.diffuseColor = new Color3(1, 1, 1);
        mat.specularColor = new Color3(0.1, 0.1, 0.1);
        mat.backFaceCulling = false;


        mat.diffuseTexture = new Texture(this.settings.textureUrl, this.settings.scene);

        mat.diffuseTexture.uOffset = this.settings.textureOffset.x;
        mat.diffuseTexture.vOffset = this.settings.textureOffset.y;
        mat.diffuseTexture.uScale = this.settings.textureScale.x;
        mat.diffuseTexture.vScale = this.settings.textureScale.y;

        return mat;
    }

    createCurve() {
        const curve = new Curve3(this.settings.path);
        const invisibleMaterial = new Material('invisibleMaterial', this.settings.scene);
        invisibleMaterial.alpha = 0;

        if (this.settings.showCurve)
            Mesh.CreateLines('line-' + Date.now(), curve.getPoints(), this.settings.scene);

        const roadShape = [
            new Vector3(-10, 0.05, 0),
            new Vector3(5, 0.05, 0)
        ];
        const shieldShape = [
            new Vector3(-17, 0, 0),
            new Vector3(12, 0, 0)
        ];
        const vegetationShape = [
            new Vector3(-60, 0, 0),
            new Vector3(55, 0, 0)
        ];

        this.mesh = MeshBuilder.ExtrudeShape('road', {
            shape: roadShape,
            path: curve.getPoints(),
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        }, this.settings.scene);
        this.mesh.material = this.material;

        const roadShield = MeshBuilder.ExtrudeShape('roadShield', {
            shape: shieldShape,
            path: curve.getPoints(),
            sideOrientation: Mesh.BACKSIDE,
            updatable: true
        }, this.settings.scene);
        roadShield.material = invisibleMaterial;
        roadShield.position.y = -2;

        const roadVegetation = MeshBuilder.ExtrudeShape('roadVegetation', {
            shape: vegetationShape,
            path: curve.getPoints(),
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        }, this.settings.scene);
        roadVegetation.material = invisibleMaterial;
        roadVegetation.position.y = -1;

        return curve;
    }
}

/**
 * @typedef {Object} Point2D
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @typedef {Object} Point3D
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */

/**
 * @typedef {Object} RoadSettings
 * @property {Vector3[]} path
 * @property {Scene} scene
 * @property {URL} textureUrl
 * @property {Point2D} textureOffset
 * @property {Point2D} textureScale
 * @property {boolean} showCurve - optional
 */
