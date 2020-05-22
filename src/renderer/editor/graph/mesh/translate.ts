import { AbstractMesh, Space } from "babylonjs";
import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class Translate extends GraphNode<{ distance: number; space: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Translate");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("Axis *", "vec3");
        this.addInput("Amount", "number");
        this.addInput("Mesh", "mesh");

        this.addProperty("space", "LOCAL", "string");
        this.addProperty("distance", 0, "number");

        this.addWidget("combo", "space", this.properties.space, (v) => this.properties.space = v, {
            values: ["LOCAL", "WORLD", "BONE"],
        });
        this.addWidget("number", "distance", this.properties.distance, (v) => this.properties.distance = v);

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("mesh", "mesh");
        this.addOutput("position", "vec3");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const mesh = this.getNode<AbstractMesh>() ?? this.getInputData(3) as AbstractMesh;
        mesh.translate(
            this.getInputData(1),
            this.getInputData(2) ?? this.properties.distance,
            Space[this.properties.space],
        );

        this.setOutputData(1, mesh);
        this.setOutputData(2, mesh.position);

        this.triggerSlot(0, null);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(axis: ICodeGenerationOutput, amount?: ICodeGenerationOutput, mesh?: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Function,
            code: `${mesh?.code ?? "this"}.translate(${axis.code}, ${amount?.code ?? this.properties.distance.toString()}, Space.${this.properties.space})`,
            outputsCode: [
                { code: undefined },
                { code: mesh?.code ?? "this" },
                { code: `${mesh?.code ?? "this"}.position` },
            ],
            requires: [
                { module: "@babylonjs/core", classes: ["Space"] },
            ],
        };
    }
}
