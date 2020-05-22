import { Nullable } from "../../../../shared/types";

import * as React from "react";
import { GUI, GUIParams } from "dat.gui";

import { LGraphGroup } from "litegraph.js";

import "../../../editor/gui/augmentations/index";

import { GraphNode } from "../../../editor/graph/node";
import { GetMesh } from "../../../editor/graph/mesh/get-mesh";
import { Mesh } from "../../../editor/graph/mesh/mesh";

import { Tools } from "../../../editor/tools/tools";
import { IPCTools } from "../../../editor/tools/ipc";

import { INodeResult } from "../../../editor/scene/utils";

import GraphEditorWindow from "../index";

export interface IInspectorProps {
    /**
     * Defines the reference to the editor's window main class.
     */
    editor: GraphEditorWindow;
}

export class Inspector extends React.Component<IInspectorProps> {
    private _toolDiv: HTMLDivElement;
    private _refHandler = {
        getToolDiv: (ref: HTMLDivElement) => this._toolDiv = ref,
    };

    public tool: Nullable<GUI>;

    /**
     * Constructor.
     * @param props defines the component's props.
     */
    public constructor(props: IInspectorProps) {
        super(props);

        props.editor.inspector = this;
    }

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return <div ref={this._refHandler.getToolDiv} style={{ width: "100%", height: "100%" }}></div>;
    }

    /**
     * Called on the component did moubnt.
     */
    public componentDidMount(): void {
        this.tool = new GUI({ autoPlace: false, scrollable: true } as GUIParams);
        this._toolDiv.appendChild(this.tool.domElement);
    }

    /**
     * Called on the window or layout is resized.
     */
    public resize(): void {
        this.tool!.width = this.props.editor.getPanelSize("inspector").width;
    }

    /**
     * Sets the node to edit.
     * @param node defines the reference to the node to edit.
     */
    public async setNode(node: GraphNode): Promise<void> {
        this.resize();
        this._clear();

        // Common
        const common = this.tool!.addFolder("Common");
        common.open();
        common.add(node, "title");
        common.addButton("Focus").onClick(() => node.focusOn());

        // Properties
        const properties = this.tool!.addFolder("Properties");
        properties.open();

        if (node instanceof GetMesh || node instanceof Mesh) {
            const result = await IPCTools.ExecuteEditorFunction<INodeResult[]>("sceneUtils.getAllMeshes");
            const meshesList = result.data.map((d) => d.name);
            
            properties.addSuggest(node.properties, "name", ["None"].concat(meshesList));
            return;
        }

        // Add properties only
        for (const p in node.properties) {
            const value = node.properties[p];
            const ctor = Tools.GetConstructorName(value).toLowerCase();

            switch (ctor) {
                case "number":
                case "string":
                case "boolean":
                    properties.add(node.properties, p).onChange(() => this.props.editor.graph.graphCanvas?.setDirty(true, true));
                    break;
                case "vector2":
                case "vector3":
                    properties.addVector(p, value);
                    break;
            }
        }
    }

    /**
     * Sets the group to edit.
     * @param group defines the reference to the group.
     */
    public setGroup(group: LGraphGroup): void {
        this.resize();
        this._clear();

        const folder = this.tool!.addFolder("Group");
        folder.open();

        folder.add(group, "title").onChange(() => this.props.editor.graph.graphCanvas?.setDirty(true, true));
    }

    /**
     * Clears the tool.
     */
    private _clear(): void {
        if (!this.tool) { return; }

        while (this.tool.__controllers.length) {
            this.tool.remove(this.tool.__controllers[0]);
        }

        for (const key in this.tool.__folders) {
            this.tool.removeFolder(this.tool.__folders[key]);
        }
    }
}
