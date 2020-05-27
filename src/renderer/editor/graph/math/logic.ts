import { LiteGraph } from "litegraph.js";

import { GraphNode, ICodeGenerationOutput, CodeGenerationOutputType } from "../node";

export class Equals extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Equals");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("a *", "");
        this.addInput("b *", "");

        this.addOutput("Is Equal", LiteGraph.EVENT as any);
        this.addOutput("Not Equal", LiteGraph.EVENT as any);
        this.addOutput("Bool", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const equals = this.getInputData(1) === this.getInputData(2);
        
        this.setOutputData(2, equals);
        if (equals) {
            this.triggerSlot(0, null);
        } else {
            this.triggerSlot(1, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput, b: ICodeGenerationOutput): ICodeGenerationOutput {
        let code = `
            if (${a.code} === ${b.code}) {
                {{generated__equals__body}}
            }
        `;

        if (this.isOutputConnected(1)) {
            code += `
                 else {
                    {{generated__not__equals__body}}
                }
            `;
        }
        
        return {
            type: CodeGenerationOutputType.Condition,
            code,
            outputsCode: [
                { code: undefined },
                { code: undefined },
                { code: `(${a.code} === ${b.code})` },
            ],
        };
    }
}

export class NotNull extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Not Null");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("object *", "");

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Bool", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const equals = this.getInputData(1) !== null;
        
        this.setOutputData(1, equals);
        if (equals) {
            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `
            if (${a.code} !== null) {
                {{generated__equals__body}}
            }
        `;
        
        return {
            type: CodeGenerationOutputType.Condition,
            code,
            outputsCode: [
                { code: undefined },
                { code: `(${a.code} !== null)` },
            ],
        };
    }
}

export class NotUndefined extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Not Undefined");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("object *", "");

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Bool", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const equals = this.getInputData(1) !== undefined;
        
        this.setOutputData(1, equals);
        if (equals) {
            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `
            if (${a.code} !== undefined) {
                {{generated__equals__body}}
            }
        `;
        
        return {
            type: CodeGenerationOutputType.Condition,
            code,
            outputsCode: [
                { code: undefined },
                { code: `(${a.code} !== undefined)` },
            ],
        };
    }
}

export class NotNullOrUndefined extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Not Null Or Undefined");

        this.addInput("", LiteGraph.EVENT as any);
        this.addInput("object *", "");

        this.addOutput("", LiteGraph.EVENT as any);
        this.addOutput("Bool", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        const equals = this.getInputData(1) !== undefined;
        
        this.setOutputData(1, equals);
        if (equals) {
            this.triggerSlot(0, null);
        }
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `
            if (${a.code} !== null && ${a.code} !== undefined) {
                {{generated__equals__body}}
            }
        `;
        
        return {
            type: CodeGenerationOutputType.Condition,
            code,
            outputsCode: [
                { code: undefined },
                { code: `(${a.code} !== null && ${a.code} !== undefined)` },
            ],
        };
    }
}

export class And extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("And");

        this.addInput("a *", "");
        this.addInput("b *", "");

        this.addOutput("", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.getInputData(0) && this.getInputData(1));
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput, b: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `(${a.code} && ${b.code})`;
        
        return {
            type: CodeGenerationOutputType.Constant,
            code,
        };
    }
}

export class Or extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Or");

        this.addInput("a *", "");
        this.addInput("b *", "");

        this.addOutput("", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, this.getInputData(0) || this.getInputData(1));
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput, b: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `(${a.code} || ${b.code})`;
        
        return {
            type: CodeGenerationOutputType.Constant,
            code,
        };
    }
}

export class Not extends GraphNode {
    /**
     * Constructor.
     */
    public constructor() {
        super("Not");

        this.addInput("a", "");
        this.addOutput("", "boolean");
    }

    /**
     * Called on the node is being executed.
     */
    public execute(): void {
        this.setOutputData(0, !this.getInputData(0));
    }

    /**
     * Generates the code of the graph.
     */
    public generateCode(a: ICodeGenerationOutput): ICodeGenerationOutput {
        const code = `!(${a.code})`;
        
        return {
            type: CodeGenerationOutputType.Constant,
            code,
        };
    }
}
