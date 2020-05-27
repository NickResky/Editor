import { Vector2, Vector3 } from "babylonjs";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType, CodeGenerationExecutionType } from "../node";
import { LiteGraph } from "litegraph.js";

type VariableType = "number" | "string" | "boolean" |
                    "vec2" | "vec3" |
                    "mesh";

export class Variable extends GraphNode<
    { value: any; name: string, type: VariableType }
> {
    /**
     * Defines the list of all available variables in the code.
     */
    public static Variables: Variable[] = [];

    /**
     * Constructor.
     */
    public constructor() {
        super("Variable");

        this.addProperty("type", "number", "string");
        this.addProperty("name", "myVariable", "string");

        this.addWidget("text", "name", this.properties.name, (v) => this.properties.name = v);
        this.addWidget("combo", "type", this.properties.type, (v) => {
            this.properties.type = v;
            this._reset();
        }, {
            values: [
                "number", "string", "boolean",
                "vec2", "vec3",
                "mesh",
            ],
        });

        this._reset();

        Variable.Variables.push(this);
    }

    /**
     * Called on the graph is being started.
     */
    public onStart(): void {
        this.properties.value = this.getInputData(0, true);
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.properties.value);
    }

    /**
     * when removed from graph
     * Called by `LGraph.remove` `LGraph.clear`
     */
    public onRemoved(): void {
        const index = Variable.Variables.indexOf(this);
        if (index !== -1) {
            Variable.Variables.splice(index, 1);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(input?: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Variable,
            code: this.properties.name,
            executionType: CodeGenerationExecutionType.Properties,
            variable: {
                name: this.properties.name,
                value: input?.code ?? this._getOutput(),
            },
            outputsCode: [
                { code: `this.${this.properties.name}` }
            ],
            requires: [
                { module: "@babylonjs/core", classes: ["Vector2", "Vector3", "Mesh"] },
            ],
        };
    }

    /**
     * Returns the output of the variable.
     */
    private _getOutput(): string {
        switch (this.properties.type) {
            case "number": return "0";
            case "boolean": return "true";
            case "string": return "Value";

            case "vec2": return "new Vector2(0, 0)";
            case "vec3": return "new Vector3(0, 0, 0)";

            case "mesh": return "null";
        }
    }

    /**
     * Resets the node inputs/outputs.
     */
    private _reset(): void {
        this.removeInput(0);
        this.removeOutput(0);
        this.properties = {
            name: this.properties.name,
            type: this.properties.type,
            value: undefined,
        };

        this.addInput(`Default Value (${this.properties.type})`, this.properties.type);
        this.addOutput("Value", this.properties.type);

        switch (this.properties.type) {
            case "number": this.properties.value = 0; break;
            case "boolean": this.properties.value = true; break;
            case "string": this.properties.value = "Value"; break;

            case "vec2": this.properties.value = new Vector2(0, 0); break;
            case "vec3": this.properties.value = new Vector3(0, 0, 0); break;

            case "mesh": this.properties.value = null; break;
        }
    }
}

export class GetVariable extends GraphNode<{ name: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Get Variable");

        this.addProperty("name", Variable.Variables[0]?.properties.name ?? "None", "string");
        this.addWidget("combo", "name", this.properties.name, (v) => {
            this.properties.name = v;
        }, {
            values: () => Variable.Variables.map((v) => v.properties.name),
        });

        this.addOutput("value", "");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const variable = Variable.Variables.find((v) => v.properties.name === this.properties.name);

        if (variable) {
            this.setOutputData(0, variable.properties.value);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Constant,
            code: `this.${this.properties.name}`,
        };
    }
}

export class UpdateVariable extends GraphNode<{ name: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Update Variable");

        this.addProperty("name", Variable.Variables[0]?.properties.name ?? "None", "string");
        this.addWidget("combo", "name", this.properties.name, (v) => {
            this.properties.name = v;
        }, {
            values: () => Variable.Variables.map((v) => v.properties.name),
        });

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("Value", "");

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Value", "");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const value = this.getInputData(1, true);
        const variable = Variable.Variables.find((v) => v.properties.name === this.properties.name);

        if (variable) {
            variable.properties.value = value;
            this.setOutputData(1, value);

            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(input: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Function,
            code: `this.${this.properties.name} = ${input.code}`,
            outputsCode: [
                { code: undefined },
                { code: `this.${this.properties.name}` },
            ],
        };
    }
}
