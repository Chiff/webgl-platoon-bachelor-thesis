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
 * @property {BABYLON.Vector3[]} path
 * @property {BABYLON.Scene} scene
 * @property {URL} textureUrl
 * @property {Point2D} textureOffset
 * @property {Point2D} textureScale
 * @property {boolean} showCurve - optional
 */

/**
 * @class Road
 * @param {RoadSettings} settings
 * @param {BABYLON.Material} material
 * @param {BABYLON.Curve3} curve
 * @param {BABYLON.Mesh} mesh
 * @see RoadSettings
 */
export class Road {

    /**
     * @constructor
     * @param {RoadSettings} settings
     */
    constructor(settings) {
        this.changeSettings(settings);
    }

    /**
     * @public
     * @method changeSettings
     * @param {RoadSettings} settings
     */
    changeSettings(settings) {
        this.settings = settings;
        this.material = this.createMaterial();
        this.curve = this.createCurve();
    }

    /**
     * @private
     * @method createMaterial
     * @return {BABYLON.StandardMaterial} material
     */
    createMaterial() {
        const mat = new BABYLON.StandardMaterial("mat-" + Date.now(), this.settings.scene);

        mat.alpha = 1.0;
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
        mat.backFaceCulling = false;
        mat.diffuseTexture = new BABYLON.Texture(this.settings.textureUrl, this.settings.scene);
        mat.diffuseTexture.uOffset = this.settings.textureOffset.x;
        mat.diffuseTexture.vOffset = this.settings.textureOffset.y;

        mat.diffuseTexture.uScale = this.settings.textureScale.x;
        mat.diffuseTexture.vScale = this.settings.textureScale.y;

        return mat;
    }

    createCurve() {
        const curve = new BABYLON.Curve3(this.settings.path);

        if (this.settings.showCurve)
            BABYLON.Mesh.CreateLines("line-" + Date.now(), curve.getPoints(), this.scene);

        const myShape = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(40, 0, 0),
        ];

        this.mesh = BABYLON.MeshBuilder.ExtrudeShape("star",
            {
                shape: myShape,
                path: curve.getPoints(),
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                updatable: true
            }, this.scene);

        this.mesh.material = this.material;

        return curve;
    }
}
