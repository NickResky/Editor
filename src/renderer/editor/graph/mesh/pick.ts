import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class PickMesh extends GraphNode<{ fastCheck: boolean; checkResult: boolean; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Pick");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("x", "number");
        this.addInput("y", "number");

        this.addProperty("fastCheck", false, "boolean");
        this.addProperty("checkResult", true, "boolean");

        this.addWidget("toggle", "fastCheck", this.properties.fastCheck, (v) => this.properties.fastCheck = v);
        this.addWidget("toggle", "checkResult", this.properties.checkResult, (v) => this.properties.checkResult = v);

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Pick Infos", "PickInfo");
        this.addOutput("mesh", "mesh");
        this.addOutput("point", "vec3");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const scene = this.getScene();
        const pick = scene.pick(this.getInputData(1) ?? scene.pointerX, this.getInputData(2) ?? scene.pointerY, undefined, this.properties.fastCheck);

        this.setOutputData(1, pick ?? null);
        this.setOutputData(2, pick?.pickedMesh ?? null);
        this.setOutputData(3, pick?.pickedPoint ?? null);
        
        if (pick?.hit) {
            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(x?: ICodeGenerationOutput, y?: ICodeGenerationOutput): ICodeGenerationOutput {
        const pick = `const pick = this.getScene().pick(${x?.code ?? "this.getScene().pointerX"}, ${y?.code ?? "this.getScene().pointerY"}, undefined, ${this.properties.fastCheck.toString()});`

        const code = this.properties.checkResult ? `
            ${pick}

            if (pick?.hit) {
                {{generated__body}}
            };
        ` : `
            ${pick}
            {{generated__body}}
        `;

        return {
            type: CodeGenerationOutputType.FunctionCallback,
            code,
            outputsCode: [
                { code: undefined },
                { code: "pick" },
                { code: "pick.pickedMesh" },
                { code: "pick.pickedPoint" },
            ],
        };
    }
}
