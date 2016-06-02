﻿module BABYLON.EDITOR {
    export class AnimationTool extends AbstractDatTool {
        // Public members
        public tab: string = "ANIMATION.TAB";

        // Private members
        private _animationSpeed: number = 1.0;
        private _loopAnimation: boolean = false;

        /**
        * Constructor
        * @param editionTool: edition tool instance
        */
        constructor(editionTool: EditionTool) {
            super(editionTool);

            // Initialize
            this.containers = [
                "BABYLON-EDITOR-EDITION-TOOL-ANIMATION"
            ];
        }

        // Object supported
        public isObjectSupported(object: any): boolean {
            if (object.animations && Array.isArray(object.animations))
                return true;

            return false;
        }

        // Creates the UI
        public createUI(): void {
            // Tabs
            this._editionTool.panel.createTab({ id: this.tab, caption: "Animations" });
        }

        // Update
        public update(): boolean {
            var object: { animations: Animation[] } = this.object = this._editionTool.object;

            super.update();

            if (!object)
                return false;

            this._element = new GUI.GUIEditForm(this.containers[0], this._editionTool.core);
            this._element.buildElement(this.containers[0]);
            this._element.remember(object);

            // Edit animations
            this._element.add(this, "_editAnimations").name("Edit Animations");

            // Animations
            var animationsFolder = this._element.addFolder("Play Animations");
            animationsFolder.add(this, "_playAnimations").name("Play Animations");
            animationsFolder.add(this, "_animationSpeed").min(0).name("Speed");
            animationsFolder.add(this, "_loopAnimation").name("Loop");

            if (object instanceof AbstractMesh && object.skeleton) {
                var skeletonFolder = this._element.addFolder("Skeleton");
                skeletonFolder.add(this, "_playSkeletonAnimations").name("Play Animations");

                object.skeleton.needInitialSkinMatrix = object.skeleton.needInitialSkinMatrix || false;
                skeletonFolder.add(object.skeleton, "needInitialSkinMatrix").name("Need Initial Skin Matrix");
            }

            // Actions Builder
            if (object instanceof Scene || object instanceof AbstractMesh) {
                var actionsBuilderFolder = this._element.addFolder("Actions Builder");
                actionsBuilderFolder.add(this, "_openActionsBuilder").name("Open Actions Builder");
            }

            return true;
        }

        // Loads the animations tool
        private _editAnimations(): void {
            var animCreator = new GUIAnimationEditor(this._editionTool.core, this.object);
        }

        // Plays animations
        private _playAnimations(): void {
            this._editionTool.core.currentScene.beginAnimation(this.object, 0, Number.MAX_VALUE, this._loopAnimation, this._animationSpeed);
        }

        // Plays animations of skeleton
        private _playSkeletonAnimations(): void {
            var object: AbstractMesh = this.object = this._editionTool.object;
            var scene = object.getScene();

            scene.beginAnimation(object.skeleton, 0, Number.MAX_VALUE, this._loopAnimation, this._animationSpeed);
        }

        // Opens the actions builder. Creates the action manager if does not exist
        private _openActionsBuilder(): void {
            var actionManager = null;
            var object: Scene | AbstractMesh = this.object;

            if (this.object instanceof Scene)
                actionManager = this._editionTool.core.isPlaying ? this.object.actionManager : SceneManager._SceneConfiguration.actionManager;
            else
                actionManager = this._editionTool.core.isPlaying ? this.object.actionManager : SceneManager._ConfiguredObjectsIDs[this.object.id].actionManager;

            if (!actionManager) {
                actionManager = new ActionManager(this._editionTool.core.currentScene);

                if (this.object instanceof Scene)
                    SceneManager._SceneConfiguration.actionManager = actionManager;
                else
                    SceneManager._ConfiguredObjectsIDs[(<AbstractMesh>object).id].actionManager = actionManager;
            }

            var actionsBuilder = new GUIActionsBuilder(this._editionTool.core, this.object, actionManager);
        }
    }
}