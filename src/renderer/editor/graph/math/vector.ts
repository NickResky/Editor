import { Vector2, Vector3 } from "babylonjs";
import { SerializedLGraphNode } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class Vec2 extends GraphNode<{ value: Vector2; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Vector 2D");

        this.addProperty("value", new Vector2(0, 1), "vec2");

        this.addWidget("number", "x", this.properties.value.x, (v) => this.properties.value.x = v);
        this.addWidget("number", "y", this.properties.value.y, (v) => this.properties.value.y = v);

        this.addOutput("", "vec2");
    }

    /**
     * configure a node from an object containing the serialized info
     */
    public configure(info: SerializedLGraphNode): void {
        super.configure(info);

        this.properties.value = new Vector2(info.properties.value.x, info.properties.value.y);
        if (this.widgets) {
            this.widgets[0].value = this.properties.value.x;
            this.widgets[1].value = this.properties.value.y;
        }
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.properties.value);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Constant,
            code: `new Vector2(${this.properties.value.x}, ${this.properties.value.y})`,
            requires: [
                { module: "@babylonjs/core", classes: ["Vector2"] },
            ],
        };
    }
}

export class Vec3 extends GraphNode<{ value: Vector3; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Vector 3D");

        this.addProperty("value", new Vector3(0, 1, 2), "vec3");

        this.addWidget("number", "x", this.properties.value.x, (v) => this.properties.value.x = v);
        this.addWidget("number", "y", this.properties.value.y, (v) => this.properties.value.y = v);
        this.addWidget("number", "z", this.properties.value.z, (v) => this.properties.value.z = v);

        this.addOutput("", "vec3");
    }

    /**
     * configure a node from an object containing the serialized info
     */
    public configure(info: SerializedLGraphNode): void {
        super.configure(info);

        this.properties.value = new Vector3(info.properties.value.x, info.properties.value.y, info.properties.value.z);
        if (this.widgets) {
            this.widgets[0].value = this.properties.value.x;
            this.widgets[1].value = this.properties.value.y;
            this.widgets[2].value = this.properties.value.z;
        }
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.properties.value);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Constant,
            code: `new Vector3(${this.properties.value.x}, ${this.properties.value.y}, ${this.properties.value.z})`,
            requires: [
                { module: "@babylonjs/core", classes: ["Vector3"] },
            ],
        };
    }
}

export class VectorLength extends GraphNode<{ name: string; value: Vector3; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Vector Length");

        this.addInput("", "vec2,vec3");
        this.addOutput("", "number");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.getInputData<Vector2 | Vector3>(0).length());
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(v: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Constant,
            code: `${v}.length()`,
        };
    }
}
