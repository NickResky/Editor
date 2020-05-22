import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType, CodeGenerationExecutionType } from "../node";

export class Mesh extends GraphNode<{ varName: string; name: string; }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Mesh");

        this.addProperty("varName", "aMesh", "string", (v) => this.properties.name = this.title = v);
        this.addProperty("name", "None", "string", (v) => this.properties.name = this.title = v);

        this.addWidget("text", "varName", this.properties.varName, (v) => this.properties.varName = this.title = v);

        this.addOutput("mesh", "mesh");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const mesh = this.getScene().getMeshByName(this.properties.name);
        this.setOutputData(0, mesh);
    }

    /**
     * Draws the foreground of the node.
     */
    public onDrawForeground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
        super.onDrawForeground(canvas, ctx);
        this.title = `${this.properties.name} (Mesh)`;
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
                name: this.properties.name,
                value: `this.getScene().getMeshByName("${this.properties.name}")`,
            },
            outputsCode: [
                { code: `this.${this.properties.name}` },
            ],
        };
    }
}
