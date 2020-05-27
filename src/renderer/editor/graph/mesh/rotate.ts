import { AbstractMesh, Space } from "babylonjs";
import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class RotateMesh extends GraphNode<{ amount: number; space: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Rotate");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("Axis *", "vec3");
        this.addInput("Amount", "number");
        this.addInput("Mesh", "mesh");

        this.addProperty("space", "LOCAL", "string");
        this.addProperty("amount", 0, "number");

        this.addWidget("combo", "space", this.properties.space, (v) => this.properties.space = v, {
            values: ["LOCAL", "WORLD", "BONE"],
        });
        this.addWidget("number", "amount", this.properties.amount, (v) => this.properties.amount = v);

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("mesh", "mesh");
        this.addOutput("rotation", "vec3");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const mesh = this.getNode<AbstractMesh>() ?? this.getInputData(3) as AbstractMesh;
        mesh.rotate(
            this.getInputData(1),
            this.getInputData(2) ?? this.properties.amount,
            Space[this.properties.space],
        );

        this.setOutputData(1, mesh);
        this.setOutputData(2, mesh.rotation);

        this.triggerSlot(0, null);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(axis: ICodeGenerationOutput, amount?: ICodeGenerationOutput, mesh?: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Function,
            code: `${mesh?.code ?? "this"}.rotate(${axis.code}, ${amount?.code ?? this.properties.amount.toString()}, Space.${this.properties.space})`,
            outputsCode: [
                { code: undefined },
                { code: mesh?.code ?? "this" },
                { code: `${mesh?.code ?? "this"}.rotation` },
            ],
            requires: [
                { module: "@babylonjs/core", classes: ["Space"] },
            ],
        };
    }
}
