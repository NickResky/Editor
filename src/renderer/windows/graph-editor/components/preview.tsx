import * as React from "react";

import { Engine, Scene, Mesh, FreeCamera, Vector3, PointLight, Light } from "babylonjs";

import GraphEditorWindow from "../index";

export interface IPreviewProps {
    /**
     * Defines the reference to the editor's window main class.
     */
    editor: GraphEditorWindow;
}

export class Preview extends React.Component<IPreviewProps> {
    /**
     * Defines the reference to the canvas used to draw the graph.
     */
    public canvas: HTMLCanvasElement;

    private _refHandler = {
        getCanvas: (ref: HTMLCanvasElement) => this.canvas = ref,
    };

    private _engine: Engine;
    private _scene: Scene;
    private _camera: FreeCamera;
    private _mesh: Mesh;
    private _light: PointLight;

    /**
     * Constructor.
     * @param props defines the component's props.
     */
    public constructor(props: IPreviewProps) {
        super(props);

        props.editor.preview = this;
    }

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return <canvas ref={this._refHandler.getCanvas} style={{ width: "100%", height: "100%", position: "absolute", top: "0" }}></canvas>;
    }

    /**
     * Called on the component did mount.
     */
    public componentDidMount(): void {
        this.reset();
    }

    /**
     * Called on the window or layout is resized.
     */
    public resize(): void {
        this._engine.resize();
    }

    /**
     * Gets the current mesh of the scene.
     */
    public getMesh(): Mesh {
        return this._mesh;
    }

    /**
     * Gets the current light of the scene.
     */
    public getLight(): Light {
        return this._light;
    }

    /**
     * Gets the current scene.
     */
    public getScene(): Scene {
        return this._scene;
    }

    /**
     * Resets the preview.
     */
    public reset(): void {
        if (!this.canvas) { return; }

        if (this._scene) { this._scene.dispose(); }
        if (this._engine) { this._engine.dispose(); }

        this._engine = new Engine(this.canvas, true, {
            audioEngine: true,
        });
        this._scene = new Scene(this._engine);

        this._camera = new FreeCamera("camera", new Vector3(3, 3, 3), this._scene);
        this._camera.setTarget(Vector3.Zero());
        this._camera.attachControl(this.canvas, true);
        this._camera.speed = 0.5;
        this._mesh = Mesh.CreateBox("box", 1, this._scene);

        this._light = new PointLight("light", new Vector3(3, 3, 3), this._scene);

        this._engine.runRenderLoop(() => this._scene.render());
    }
}
