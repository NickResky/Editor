import { join } from "path";
import { readFile } from "fs-extra";
import { transpile } from "typescript";

import { Nullable, IStringDictionary } from "../../../shared/types";

import { LGraph, LiteGraph } from "litegraph.js";

import { Tools } from "../tools/tools";

import { GraphNode, CodeGenerationOutputType, CodeGenerationExecutionType } from "./node";

import { CodeGenerationUtils } from "./generation/utils";
import {
    ICodeGenerationStackFinalOutput, IGlobalCodeGenerationOutput, ICodeGenerationStackOutput,
    ICodeGenerationFunctionProperties, ICodeGenerationStack,
} from "./generation/types";

export class GraphCodeGenerator {
    private static _Initialized: boolean = false;
    private static _Template: string = "";

    /**
     * Initializes the graph code generator.
     */
    public static async Init(): Promise<void> {
        if (this._Initialized) { return; }
        this._Template = await readFile(join(Tools.GetAppPath(), `assets/scripts/graph.ts`), { encoding: "utf-8" });
    }

    /**
     * Converts the given graph into code that games can execute.
     * @param graph defines the reference to the graph that should be converted to code.
     */
    public static GenerateCode(graph: LGraph): Nullable<string> {
        const result = this._GenerateCode(graph);

        if (result.error) { return null; }

        const requires = result.nodeOutputs.filter((o) => o.requires);
        const modules: IStringDictionary<string[]> = { };
        requires.forEach((r) => {
            r.requires!.forEach((r) => {
                if (!modules[r.module]) { modules[r.module] = []; }
                
                r.classes.forEach((c) => {
                    if (modules[r.module].indexOf(c) !== -1) { return; }
                    modules[r.module].push(c);
                });
            });
        });

        const imports = Object.keys(modules).map((m) => `import { ${modules[m].join(", ")} } from "${m}"`);
        const start = result.output.filter((o) => o.type === CodeGenerationExecutionType.Start);
        const update = result.output.filter((o) => o.type === CodeGenerationExecutionType.Update);
        const properties = result.output.filter((o) => o.type === CodeGenerationExecutionType.Properties);

        const finalStr = this._Template.replace("// ${requires}", imports.join("\n"))
                                       .replace("// ${onStart}", start.map((o) => o.code).join("\n"))
                                       .replace("// ${onUpdate}", update.map((o) => o.code).join("\n"))
                                       .replace("// ${properties}", properties.map((o) => o.code).join("\n"));

        const beautify = require("js-beautify");
        const bFinalStr = beautify.js_beautify(finalStr);

        return this._Wrap(bFinalStr);
    }

    /**
     * Converts the given graph into code.
     * @param graph defines the reference to the graph that should be converted to code.
     * @param stack defines the current stack of code generation.
     */
    public static _GenerateCode(graph: LGraph, stack: ICodeGenerationStack = { }): ICodeGenerationStackFinalOutput {
        stack.nodes = stack.nodes ?? graph.computeExecutionOrder(false, true) as GraphNode[];
        stack.visited = stack.visited ?? [];

        const output: ICodeGenerationStackOutput[] = [];

        let previous: IGlobalCodeGenerationOutput;
        let index = -1;

        // Traverse nodes and generate code
        for (const n of stack.nodes) {
            index++;

            // Check if the 
            if (n === stack.node) { continue; }

            // Check if alreay done
            const done = stack.visited!.find((o) => o.id === n.id);
            if (done) { continue; }

            // Get all inputs
            const filteredInputs = n.inputs.filter((i) => i.type !== LiteGraph.EVENT as any);
            const inputs: IGlobalCodeGenerationOutput[] = new Array(filteredInputs.length);

            for (const linkId in graph.links) {
                const link = graph.links[linkId];
                if (link.target_id !== n.id || link.type === LiteGraph.EVENT as any) { continue; }

                const output = stack.visited!.find((o) => o.id === link.origin_id) ?? stack.nodeOutput;
                const inputIndex = filteredInputs.indexOf(filteredInputs.find((fi) => fi.link === link.id)!);
                
                if (!output || inputIndex === -1) { continue; }

                if (output.outputsCode && output.outputsCode[link.origin_slot].code) {
                    inputs[inputIndex] = {
                        ...output,
                        code: output.outputsCode[link.origin_slot].code!,
                    };
                } else {
                    inputs[inputIndex] = output;
                }
            }

            // Generate the code of the current node
            try {
                previous = {
                    id: n.id,
                    ...n.generateCode(...inputs),
                } as IGlobalCodeGenerationOutput;
            } catch (e) {
                return {
                    output,
                    nodeOutputs: stack.visited,
                    error: { node: n, error: e },
                };
            }

            // Register output.
            stack.visited!.push(previous);

            // Get execution type
            const executionType = previous.executionType ?? CodeGenerationExecutionType.Update;

            // According to the node type, build the final code string
            switch (previous.type) {
                // Constant. Nothing to do for constant nodes, just keep the generated code.
                case CodeGenerationOutputType.Constant:
                    break;
                
                // Variable
                case CodeGenerationOutputType.Variable:
                    const count = stack.visited!.filter((o) => o.variable?.name === previous.variable?.name);
                    
                    if (count.length) {
                        previous.code = `this.${previous.variable?.name}_${count.length}`;
                    } else {
                        previous.code = `this.${previous.variable!.name}`;
                    }
                    
                    previous.code = previous.code!.replace(/ \t\n\r/g, "");
                    output.push({
                        code: `public ${previous.code} = ${previous.variable?.value.toString()}`,
                        type: executionType,
                    });
                    break;

                // Just a function call
                case CodeGenerationOutputType.Function:
                    output.push({ code: previous.code, type: executionType });
                    break;

                // Function with callback, means it has a trigger output
                case CodeGenerationOutputType.FunctionCallback:
                    const callbackResult = this._FunctionCallback(graph, { stack, output, previous, executionType, node: n, nodeIndex: index, inputs });
                    if (callbackResult?.error) {
                        return callbackResult;
                    }
                    break;

                // Condition that as an if / else
                case CodeGenerationOutputType.Condition:
                    const conditioNResult = this._Condition(graph, { stack, output, previous, executionType, node: n, nodeIndex: index, inputs });

                    if (conditioNResult?.error) {
                        return conditioNResult;
                    }
                    break;
            }
        };

        return {
            output,
            nodeOutputs: stack.visited,
        };
    }

    /**
     * Converts the current node as a function callback.
     */
    private static _FunctionCallback(graph: LGraph, properties: ICodeGenerationFunctionProperties): Nullable<ICodeGenerationStackFinalOutput> {
        const callbackNodes = CodeGenerationUtils.GetAncestors(graph, properties.node, properties.stack.nodes!, properties.nodeIndex);
        const callbackResult = this._GenerateCode(graph, {
            nodes: callbackNodes,
            visited: properties.stack.visited,
            node: properties.node,
            nodeOutput: {
                id: properties.node.id,
                ...properties.node.generateCode(...properties.inputs),
            },
        });

        if (callbackResult.error) {
            return { output: properties.output, nodeOutputs: properties.stack.visited!, error: callbackResult.error };
        }

        const output = CodeGenerationUtils.DeconstructOutput(callbackResult.output);

        properties.previous.code = properties.previous.code.replace(
            "{{generated__body}}",
            output.common.map((o) => o.code).join("\n"),
        );

        output.properties.forEach((o) => properties.output.push(o));

        properties.output.push({
            code: properties.previous.code,
            type: properties.executionType,
        });

        return null;
    }

    /**
     * Converts the current node as a condition.
     */
    private static _Condition(graph: LGraph, properties: ICodeGenerationFunctionProperties): Nullable<ICodeGenerationStackFinalOutput> {
        const yesChildren: GraphNode[] = CodeGenerationUtils.GetChildren(graph, properties.node, 0);
        const noChildren: GraphNode[] = CodeGenerationUtils.GetChildren(graph, properties.node, 1);

        const yesNodes: GraphNode[] = CodeGenerationUtils.GetAncestors(graph, properties.node, properties.stack.nodes!, properties.nodeIndex, yesChildren);
        const noNodes: GraphNode[] = CodeGenerationUtils.GetAncestors(graph, properties.node, properties.stack.nodes!, properties.nodeIndex, noChildren);

        const nodeOutput = {
            id: properties.node.id,
            ...properties.node.generateCode(...properties.inputs),
        };

        const yesResult = this._GenerateCode(graph, {
            nodes: yesNodes,
            visited: properties.stack.visited,
            node: properties.node,
            nodeOutput,
        });
        if (yesResult.error) {
            return { output: properties.output, nodeOutputs: properties.stack.visited!, error: yesResult.error };
        }

        const noResult = this._GenerateCode(graph, {
            nodes: noNodes,
            visited: properties.stack.visited,
            node: properties.node,
            nodeOutput,
        });

        if (noResult.error) {
            return { output: properties.output, nodeOutputs: properties.stack.visited!, error: noResult.error };
        }

        if (yesNodes.length || noNodes.length) {
            const output1 = CodeGenerationUtils.DeconstructOutput(yesResult.output);
            const output2 = CodeGenerationUtils.DeconstructOutput(noResult.output);

            properties.previous.code = properties.previous.code.replace("{{generated__equals__body}}", output1.common.map((o) => o.code).join("\n"));
            properties.previous.code = properties.previous.code.replace("{{generated__not__equals__body}}", output2.common.map((o) => o.code).join("\n"));

            properties.output.push({
                code: properties.previous.code,
                type: properties.executionType,
            });

            output1.properties.forEach((o) => properties.output.push(o));
            output2.properties.forEach((o) => properties.output.push(o));
        }

        return null;
    }

    /**
     * Wraps the given output.
     */
    private static _Wrap(result: string): string {
        const wrapped = transpile(result);
        // const wrapped = `
        //     const exports = { };
        //     ${js}

        //     const b = require("@babylonjs/core");
        //     const engine = new b.Engine(document.createElement("canvas"));
        //     const scene = new b.Scene(engine);
        //     const node = new b.Mesh("mesh", scene);

        //     debugger;
        //     var instance = new GraphClass();
        //     instance.onStart(node);
        //     instance.onUpdate(node);
        // `;

        const beautify = require("js-beautify");
        return beautify.js_beautify(wrapped);
    }
}
