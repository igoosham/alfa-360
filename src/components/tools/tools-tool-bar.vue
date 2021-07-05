<template>
  <v-toolbar dense floating>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on">
          <v-overflow-btn
            :items="items"
            prepend-icon="mdi-layers-triple-outline"
            v-model="selectedLayer"
            style="width:240px;"
            flat
            hide-details
            dense
          >
          </v-overflow-btn>
        </div>
      </template>
      <span>active layer</span>
    </v-tooltip>

    <button-tooltiped
      @click="buttonClick(`addLayer`)"
      icon="mdi-layers-plus"
      tooltip="add new layer"
    />

    <button-tooltiped
      @click="buttonClick(`removeLayer`)"
      icon="mdi-layers-remove"
      tooltip="remove current layer"
    />

    <v-divider vertical class="ml-4"></v-divider>

    <button-tooltiped
      @click="buttonClick(`newModel`)"
      icon="mdi-table-plus"
      tooltip="add new model"
    />

    <button-tooltiped
      @click="buttonClick(`editModel`)"
      icon="mdi-table-edit"
      tooltip="edit selected model"
    />

    <button-tooltiped
      @click="buttonClick(`removeModel`)"
      icon="mdi-table-remove"
      tooltip="remove selected model"
    />

    <button-tooltiped
      @click="buttonClick(`resizeDiagram`)"
      icon="mdi-image-filter-center-focus"
      tooltip="resize schema"
    />
  </v-toolbar>
</template>

<script>
import ButtonTooltiped from "../button-tooltiped.vue";

export default {
  name: "ToolsToolBar",

  props: {
    layers: {
      type: Array,
      required: false,
      default: () => []
    },
    layer: {
      type: Number,
      require: false,
      default: 0
    }
  },

  data() {
    return {
      items: this.layers,
      selectedLayer: this.layers[this.layer]
    };
  },

  components: {
    "button-tooltiped": ButtonTooltiped
  },

  methods: {
    buttonClick(ev) {
      this.$emit(ev);
    }
  }
};
</script>

<style>
.v-autocomplete.v-select.v-input--is-focused input {
  min-width: auto !important;
}
</style>
