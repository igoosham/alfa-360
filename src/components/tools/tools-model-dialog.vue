<template>
  <v-dialog v-model="value" persistent scrollable max-width="900">
    <v-card>
      <v-card-title> {{ title }} </v-card-title>

      <v-divider class="mb-5"></v-divider>

      <v-card-text style="max-height: 80vh;">
        <v-stepper v-model="stepIndex" vertical>
          <v-stepper-step :complete="stepIndex > 1" step="1">
            {{ modelName }}
          </v-stepper-step>

          <v-stepper-content step="1">
            <v-form
              @submit.prevent="setName"
              ref="nameForm"
              v-model="validName"
            >
              <v-text-field
                class="mb-5"
                v-model="currentModel.objAsString"
                :rules="[rules.required, rules.min6]"
                hint="At least 6 characters"
                required
                dense
              ></v-text-field>

              <v-btn type="submit" color="primary">
                Continue
              </v-btn>
            </v-form>
          </v-stepper-content>

          <v-stepper-step :complete="stepIndex > 2" step="2">
            Model members
          </v-stepper-step>

          <v-stepper-content step="2">
            <tools-member-expansion
              :items="
                currentModel.ListMemberModel.length
                  ? currentModel.ListMemberModel
                  : []
              "
            ></tools-member-expansion>
          </v-stepper-content>
        </v-stepper>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="blue darken-1" text @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" text @click="$emit('add')">
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { required, min6 } from "@/files/validation-rules.js";
import ToolsMemberExpansion from "@/components/tools/tools-member-expansion.vue";

export default {
  name: "ToolsModelDialog",

  components: {
    ToolsMemberExpansion
  },

  props: {
    value: {
      type: Boolean
    },
    title: {
      type: String,
      default: "Edit model"
    },
    model: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      stepIndex: 1,
      currentModel: this.model,
      nameFormInitialName: "Choose model name",
      nameFormHasErrors: false,
      validName: true,
      rules: {
        required,
        min6
      }
    };
  },

  computed: {
    modelName() {
      return this.validName
        ? `Name: ${this.currentModel.objAsString}`
        : this.nameFormInitialName;
    }
  },

  watch: {
    value(val) {
      if (!val) return;
      this.currentModel = this.model;
      console.log("new show:", val);
    }
  },

  methods: {
    cancel() {
      this.stepIndex = 1;
      this.$emit("cancel");
    },
    setName() {
      console.log("setName:", this.currentModel.objAsString);
      if (this.validName) {
        this.stepIndex = 2;
      }
    }
  }
};
</script>
