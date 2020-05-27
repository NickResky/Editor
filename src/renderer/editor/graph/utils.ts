import { Nullable } from "../../../shared/types";

import { LiteGraph } from "litegraph.js";

import { GraphNode } from "./node";

export class NodeUtils {
    /**
     * Defines the current stack of nodes being called.
     */
    public static CallStack: GraphNode[] = [];
    /**
     * Defines the reference to the node that is being paused.
     */
    public static PausedNode: Nullable<GraphNode> = null;

    /**
     * Clears the current call stack.
     */
    public static ClearCallStack(): void {
        this.CallStack = [];
    }

    /**
     * Sets the node's color according to its mode.
     * @param node defines the node to configure its color according to its current mode.
     * @see .mode
     */
    public static SetColor (node: GraphNode): void {
        switch (node.mode) {
            case LiteGraph.ALWAYS: node.color = undefined!; break;
            case LiteGraph.ON_EVENT: node.color = "#55A"; break;
            case LiteGraph.ON_TRIGGER: node.color = "#151"; break;
            case LiteGraph.NEVER: node.color = "#A55"; break;
            default: break;
        }
    }
}
