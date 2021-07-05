<template>
  <v-dialog v-model="value" max-width="550px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-progress-linear
        :style="{ visibility: dialogProgresVisibility }"
        class="dialog-progress"
        indeterminate
      ></v-progress-linear>

      <v-card-text v-if="editFields.length">
        <v-row v-for="editField in editFields" :key="editField.field">
          <v-col cols="4" class="vertical-centered-flex">
            <label> {{ editField.label || editField.field }} </label>
          </v-col>
          <v-col cols="8">
            <text-box
              v-if="editField.component === 'TextBox'"
              v-model="editField.value"
              :readonly="editField.readonly"
            ></text-box>
            <v-checkbox
              v-if="editField.component === 'RadioListBool'"
              v-model="editField.value"
              :label="editField.value ? 'Да' : 'Нет'"
              dense
            ></v-checkbox>
            <v-overflow-btn
              v-if="editField.component === 'ComboBox'"
              :items="editField.items"
              v-model="editField.value"
              dense
            ></v-overflow-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" text @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import TextBox from "./text-box.vue";

export default {
  name: "DataEditForm",
  comments: {
    TextBox
  },
  props: {
    value: {
      type: Boolean
    },
    items: {
      type: Array,
      required: false,
      default: function() {
        return [];
      }
    },
    title: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      dialog: this.visible,
      editFields: this.items,
      dialogProgresVisibility: "hidden"
    };
  },
  watch: {
    items(val) {
      this.editFields = val;
    }
  },
  methods: {
    close() {
      this.dialog = false;
      this.$emit("input", false);
    },
    save() {
      this.printJson(this.editFields);
      // this.close();
    },
    printJson(json) {
      console.log(JSON.parse(JSON.stringify(json)));
    }
  }
};
</script>

<style scoped>
.dialog-progress {
  width: 90%;
  margin: 0 auto;
}
</style>
