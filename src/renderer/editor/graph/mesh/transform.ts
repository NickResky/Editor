import { AbstractMesh } from "babylonjs";
import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class TransformMesh extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Transform");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("Mesh", "mesh");
        this.addInput("Position", "vec3");
        this.addInput("Rotation", "vec3");
        this.addInput("Scaling", "vec3");
        
        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Mesh", "mesh");
        this.addOutput("Position", "vec3");
        this.addOutput("Rotation", "vec3");
        this.addOutput("Scaling", "vec3");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const mesh = this.getNode<AbstractMesh>() ?? this.getInputData(3) as AbstractMesh;
        mesh.position = this.getInputData(2) ?? mesh.position;
        mesh.rotation = this.getInputData(3) ?? mesh.rotation;
        mesh.scaling = this.getInputData(4) ?? mesh.scaling;

        this.setOutputData(1, mesh);
        this.setOutputData(2, mesh.position);
        this.setOutputData(3, mesh.rotation);
        this.setOutputData(4, mesh.scaling);

        this.triggerSlot(0, null);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(mesh?: ICodeGenerationOutput, position?: ICodeGenerationOutput, rotation?: ICodeGenerationOutput, scaling?: ICodeGenerationOutput): ICodeGenerationOutput {
        const m = mesh?.code ?? "this";
        const code = `
            ${position ? `${m}.position = ${position.code}` : ""}
            ${rotation ? `${m}.rotation = ${rotation.code}` : ""}
            ${scaling ? `${m}.scaling = ${scaling.code}` : ""}
        `;

        return {
            type: CodeGenerationOutputType.Function,
            code,
            outputsCode: [
                { code: undefined },
                { code: m },
                { code: `${m}.position` },
                { code: `${m}.rotation` },
                { code: `${m}.scaling` },
            ],
        };
    }
}
