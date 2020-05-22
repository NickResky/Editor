import { Scene, Node } from "babylonjs";

export interface INodeResult {
    /**
     * Defines the name of the node.
     */
    name: string;
    /**
     * Defines the Id of the node.
     */
    id: string;
}

export class SceneUtils {
    /**
     * Constructor.
     * @param scene defines the scene reference.
     */
    public constructor(public scene: Scene) { }

    /**
     * Returns the list of all available nodes in the scene.
     */
    public getAllNodes(): INodeResult[] {
        return this.getAllMeshes()
                    .concat(this.getAllLights())
                    .concat(this.getAllCameras());
    }

    /**
     * Returns the list of all meshes.
     */
    public getAllMeshes(): INodeResult[] {
        return this._getAsNodeResult(this.scene.meshes);
    }

    /**
     * Returns the list of all lights.
     */
    public getAllLights(): INodeResult[] {
        return this._getAsNodeResult(this.scene.lights);
    }

    /**
     * Returns the list of all cameras.
     */
    public getAllCameras(): INodeResult[] {
        return this._getAsNodeResult(this.scene.cameras);
    }

    /**
     * Returns the given nodes as INodeResult.
     */
    private _getAsNodeResult(nodes: Node[]): INodeResult[] {
        return nodes.map((n) => ({ name: n.name, id: n.id }));
    }
}
