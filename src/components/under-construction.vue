<template>
  <div
    class="wrapper d-flex flex-column justify-center align-center text-center"
  >
    <div class="text-h3 grey--text lighten-2">{{ params.title }}</div>
    <div class="text-h4 grey--text lighten-3">
      This page is under construction
    </div>
  </div>
</template>

<script>
export default {
  name: "UnderConstruction",

  props: {
    params: {
      type: Object,
      required: false,
      default: () => ({
        title: null,
        alt: null
      })
    }
  }
};
</script>

<style scoped>
.wrapper {
  height: 80vh;
  width: 100%;
}
.wrapper > div {
  padding: 2rem 0;
}
</style>
