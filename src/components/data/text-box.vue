<template>
  <v-text-field
    @change="onChange"
    :readonly="readonly"
    :value="value"
    dense
  ></v-text-field>
</template>

<script>
export default {
  name: "TextBox",
  props: {
    value: {
      type: String,
      required: false,
      default: ""
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    onChange(ev) {
      console.log(ev);
      // this.$emit("input");
    }
  }
};
</script>
