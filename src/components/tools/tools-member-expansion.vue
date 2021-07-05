<template>
  <v-expansion-panels>
    <v-expansion-panel v-for="(item, indx) in items" :key="indx">
      <v-expansion-panel-header>
        <div class="d-flex justify-space-between">
          <span>{{ item.SignModel.MemberName }}</span>
          <span class="mr-5">{{ item.SignModel.MemberTypeAsString }}</span>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  namе: "ToolsMemberExpansion",

  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  updated() {
    console.warn("ToolsMemberExpansion updated", this.items);
  }
};
</script>
