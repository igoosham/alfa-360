<template>
  <div style="height: 100%;">
    <tool-bar
      @newModel="onNewModel"
      @editModel="editModel"
      @removeModel="deleteModel"
      @resizeDiagram="resizeDiagram"
      :layers="layers"
      :layer="layer"
    />

    <edit-model-dialog
      v-model="modelForm.show"
      :title="modelForm.title"
      :model="modelForm.model"
      @cancel="closeModelForm"
      @add="addModel"
    />

    <div id="diagram"></div>
  </div>
</template>

<script>
import modelProvider from "../../files/schema/schema-model.js";
import connectionsProvider from "../../files/schema/schema-connections.js";
import { getModel, getNewModel } from "../../files/getModel.js";

import ToolsToolBar from "@/components/tools/tools-tool-bar.vue";
import ToolsModelDialog from "@/components/tools/tools-model-dialog.vue";

export default {
  name: "ToolsSchema",

  components: {
    "tool-bar": ToolsToolBar,
    "edit-model-dialog": ToolsModelDialog
  },

  data() {
    return {
      diagram: null,
      shapes: [],
      resizeListener: null,
      layer: 1,
      layers: ["All", "User case", "Layer 3"],
      modelForm: {
        show: false,
        title: "Add new model",
        model: getNewModel()
      }
    };
  },

  computed: {
    selectedModel() {
      const selected = this.diagram.select();
      if (selected.length > 1) return;

      if (!(selected[0] instanceof window.kendo.dataviz.diagram.Shape)) return;

      return selected[0].dataItem;
    }
  },

  methods: {
    onNewModel() {
      const model = getNewModel();
      console.log("onNewModel", model);
      this.modelForm.model = JSON.parse(JSON.stringify(model));
      this.$nextTick(() => {
        this.modelForm.show = true;
      });
    },

    addModel() {
      this.closeModelForm();

      const [model] = getModel(["modelc"]);

      const { x, y } = document
        .getElementById("diagram")
        .getBoundingClientRect();

      const initialPosition = this.diagram.documentToModel({ x, y });
      model.X = initialPosition.x;
      model.Y = initialPosition.y;

      console.log({ model });

      const shape = modelProvider.renderModel(model);
      this.diagram.select(shape);
      this.shapes.push(shape);
    },

    editModel() {
      if (!this.selectedModel) return;
      this.modelForm.model = JSON.parse(JSON.stringify(this.selectedModel));
      this.$nextTick(() => {
        this.modelForm.show = true;
      });
    },

    deleteModel() {
      if (!this.selectedModel) return;
      console.log("delete:", this.selectedModel);

      connectionsProvider.removeConnections(this.diagram, [this.selectedModel]);

      this.diagram.remove(
        this.diagram.getShapeById(this.selectedModel.SHAPE_ID),
        false
      );
    },

    closeModelForm() {
      this.modelForm.show = false;
    },

    onDragStart() {
      console.log("onDragStart");
    },

    onDragEnd() {
      console.log("onDragEnd");
    },

    onRemove(e) {
      console.log("onRemove");
      e.preventDefault();
      this.deleteModel();
    },

    onSelect({ selected, deselected }) {
      // console.log("onSelect:", { selected, deselected });
      selected.forEach(x => {
        if (x.dataItem) x.redrawVisual();
        if (x instanceof window.kendo.dataviz.diagram.Connection) {
          console.log(JSON.parse(JSON.stringify(x)));
          x.redraw({
            stroke: {
              color: "#F57F17"
            },
            startCap: {
              fill: { color: "#F57F17" }
            },
            endCap: {
              fill: { color: "#F57F17" }
            }
          });
        }
      });

      this.diagram.toFront(selected);

      deselected.forEach(x => {
        if (x.dataItem) x.redrawVisual();
        if (x instanceof window.kendo.dataviz.diagram.Connection) {
          x.redraw({
            stroke: {
              color: "#1976d2"
            },
            startCap: {
              fill: { color: "#1976d2" }
            },
            endCap: {
              fill: { color: "#1976d2" }
            }
          });
        }
      });
    },

    resizeDiagram() {
      this.diagram.zoom(1);
      window.kendo.resize(window.$(".diagram-wrapper"));

      this.diagram.bringIntoView(this.diagram.shapes);

      const curZoom = this.diagram.zoom();
      let comfornZoom = curZoom * 0.95;
      this.diagram.zoom(comfornZoom);
    }
  },

  mounted() {
    const $ = window.$;

    $("#diagram").kendoDiagram({
      editable: {
        resize: false
      },
      dragStart: this.onDragStart,
      dragEnd: this.onDragEnd,
      remove: this.onRemove,
      select: this.onSelect,
      selectable: {
        stroke: {
          dashType: "dot",
          color: "#ea9d07",
          width: 1
        }
      }
    });

    this.diagram = $("#diagram").getKendoDiagram();

    try {
      modelProvider.init(this.diagram);

      const models = getModel(["modela", "modelb"]);

      models.forEach(model => {
        const shape = modelProvider.renderModel(model);
        this.shapes.push(shape);
      });

      connectionsProvider.renderConnections(this.diagram, this.diagram.shapes);

      this.diagram.deselect();
    } catch (e) {
      console.error(e);
    }
  },

  updated() {
    console.warn("schema updated");
  },

  beforeDestroy() {
    this.diagram.destroy();
    this.shapes = null;
    this.diagram = null;
  }
};
</script>

<style scoped>
#diagram {
  height: 100%;
  max-height: calc(100vh - 192px);
  z-index: 1;
  overflow: hidden;
}
#menu {
  float: left;
  position: fixed;
  z-index: 10;
}
</style>
