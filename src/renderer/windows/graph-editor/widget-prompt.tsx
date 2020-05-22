import * as React from "react";

import { EditableText } from "../../editor/gui/editable-text";
import { Classes } from "@blueprintjs/core";
import { Tools } from "../../editor/tools/tools";

export class WidgetPrompsProps {
    /**
     * Defines the positon on the X axis.
     */
    x: number;
    /**
     * Defines the position on the Y axis.
     */
    y: number;
    /**
     * Defines the value to edit.
     */
    value: number | string;
    /**
     * Called on the value changed.
     */
    onChange: Function;
}

export class WidgetPromps extends React.Component<WidgetPrompsProps> {
    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return (
            <div style={{ background: "rgb(35, 35, 35)", borderRadius: "20px", width: "200px", height: "20px", transform: `translate(${this.props.x}px, ${this.props.y}px)` }}>
                <EditableText
                    value={this.props.value.toString()}
                    multiline={false}
                    confirmOnEnterKey={true}
                    alwaysRenderInput={true}
                    selectAllOnFocus={true}
                    className={Classes.FILL}
                    minWidth={250}
                    onConfirm={(v) => {
                        const ctor = Tools.GetConstructorName(this.props.value).toLowerCase();
                        switch (ctor) {
                            case "string": this.props.onChange(v); break;
                            case "number": this.props.onChange(parseFloat(v)); break;
                        }
                    }}
                />
            </div>
        );
    }
}
