import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType, CodeGenerationExecutionType } from "../node";

export class Sound extends GraphNode<{ name: string; varName: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Sound");

        this.addProperty("soundName", "None", "string");
        this.addProperty("varName", "mySound", "string");

        this.addWidget("text", "name", this.properties.name, (v) => this.properties.name = v);
        this.addWidget("text", "varName", this.properties.varName, (v) => this.properties.varName = v);

        this.addOutput("sound", "sound");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const sound = this.getScene().getSoundByName(this.properties.name);
        this.setOutputData(0, sound ?? null);
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Variable,
            code: this.properties.varName,
            executionType: CodeGenerationExecutionType.Properties,
            variable: {
                name: this.properties.varName,
                value: `this.getScene().getSoundByName("${this.properties.name}")`,
            },
            outputsCode: [
                { code: `this.${this.properties.varName}` },
            ],
        };
    }
}
