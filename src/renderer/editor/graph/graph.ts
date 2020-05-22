import { LiteGraph } from "litegraph.js";

import { Number, String, Boolean } from "./basic/types";
import { Log } from "./basic/log";
import { Variable, GetVariable, UpdateVariable } from "./basic/variable";
import { Debugger } from "./basic/debugger";

import { Add, Subtract, Multiply, Divide } from "./math/operation";
import { Sinus, Cosinus, Tangent } from "./math/trigonometry";
import { Equals, And, Or, NotNull, NotUndefined, NotNullOrUndefined, Not } from "./math/logic";

import { Vec2, Vec3, VectorLength } from "./math/vector";
import { AddVectors } from "./math/vector-operation";

import { Sound } from "./sound/sound";
import { PlaySound } from "./sound/play";
import { StopSound } from "./sound/stop";

import { PointerEvent } from "./events/pointer-event";
import { KeyboardEvent } from "./events/keyboard-event";

import { PickInfos } from "./data/pick-info";

import { GetProperty } from "./property/get-property";
import { SetProperty } from "./property/set-property";

import { Mesh } from "./mesh/mesh";
import { RotateMesh } from "./mesh/rotate";
import { Translate } from "./mesh/translate";
import { PickMesh } from "./mesh/pick";
import { TransformMesh } from "./mesh/transform";
import { GetMesh } from "./mesh/get-mesh";

export class GraphCode {
    private static _Initialized: boolean = false;
    
    /**
     * Initializes the graph system.
     */
    public static Init(): void {
        if (this._Initialized) { return; }

        // Remove all existing nodes
        LiteGraph.registered_node_types = { };

        // Create basic nodes
        LiteGraph.registerNodeType("basics/number", Number);
        LiteGraph.registerNodeType("basics/string", String);
        LiteGraph.registerNodeType("basics/boolean", Boolean);
        LiteGraph.registerNodeType("basics/debugger", Debugger);

        LiteGraph.registerNodeType("basics/log", Log);

        LiteGraph.registerNodeType("basics/variable", Variable);
        LiteGraph.registerNodeType("basics/get_variable", GetVariable);
        LiteGraph.registerNodeType("basics/update_variable", UpdateVariable);

        // Create math nodes
        LiteGraph.registerNodeType("math/add", Add);
        LiteGraph.registerNodeType("math/subtract", Subtract);
        LiteGraph.registerNodeType("math/multiply", Multiply);
        LiteGraph.registerNodeType("math/divide", Divide);

        LiteGraph.registerNodeType("logic/equals", Equals);
        LiteGraph.registerNodeType("logic/and", And);
        LiteGraph.registerNodeType("logic/or", Or);
        LiteGraph.registerNodeType("logic/not", Not);
        LiteGraph.registerNodeType("logic/not_null", NotNull);
        LiteGraph.registerNodeType("logic/not_undefined", NotUndefined);
        LiteGraph.registerNodeType("logic/not_null_or_undefined", NotNullOrUndefined);

        LiteGraph.registerNodeType("trigonometry/sinus", Sinus);
        LiteGraph.registerNodeType("trigonometry/cosinus", Cosinus);
        LiteGraph.registerNodeType("trigonometry/tangent", Tangent);

        LiteGraph.registerNodeType("vector/vector_2d", Vec2);
        LiteGraph.registerNodeType("vector/vector_3d", Vec3);
        LiteGraph.registerNodeType("vector/vector_length", VectorLength);

        LiteGraph.registerNodeType("math/add_vectors", AddVectors);

        // Sound
        LiteGraph.registerNodeType("sound/sound", Sound);
        LiteGraph.registerNodeType("sound/play_sound", PlaySound);
        LiteGraph.registerNodeType("sound/stop_sound", StopSound);

        // Events
        LiteGraph.registerNodeType("events/pointer", PointerEvent);
        LiteGraph.registerNodeType("events/keyboard", KeyboardEvent);

        // Data
        LiteGraph.registerNodeType("data/pick_infos", PickInfos);

        // Utils
        LiteGraph.registerNodeType("utils/get_property", GetProperty);
        LiteGraph.registerNodeType("utils/set_property", SetProperty);

        // Mesh
        LiteGraph.registerNodeType("mesh/mesh", Mesh);
        LiteGraph.registerNodeType("mesh/rotate_mesh", RotateMesh);
        LiteGraph.registerNodeType("mesh/translate_mesh", Translate);
        LiteGraph.registerNodeType("mesh/pick_mesh", PickMesh);
        LiteGraph.registerNodeType("mesh/transform_mesh", TransformMesh);
        LiteGraph.registerNodeType("mesh/get_mesh", GetMesh);
    }
}
