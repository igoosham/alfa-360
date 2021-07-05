<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on" @click="onClick">
        <v-icon> {{ icon }} </v-icon>
      </v-btn>
    </template>
    <span> {{ tooltip }} </span>
  </v-tooltip>
</template>

<script>
export default {
  name: "ButtonTooltiped",

  props: {
    icon: {
      type: String,
      required: true
    },
    tooltip: {
      type: String,
      required: true
    }
  },

  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
