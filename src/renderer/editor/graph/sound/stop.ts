import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class StopSound extends GraphNode<{ soundName: string }> {
    /**
     * Constructor.
     */
    public constructor() {
        super("Stop Sound");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("sound *", "sound");

        this.addOutput("", LiteGraph.EVENT as any);
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const sound = this.getScene().getSoundByName(this.getInputData(0));
        if (sound) {
            sound.stop();
            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(value: ICodeGenerationOutput): ICodeGenerationOutput {
        return {
            type: CodeGenerationOutputType.Function,
            code: `${value.code}.stop()`,
        };
    }
}