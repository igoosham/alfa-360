<template>
  <v-sheet color="white" elevation="1"><h1>CHATER</h1></v-sheet>
<!-- 
  <v-container>
    
  </v-container> -->
  <!-- <div id="chat-wrapper">

  </div> -->
</template>

<script>
export default {
  name: "Chater",
    props: {
    params: {
      type: Object,
      required: false,
      default: () => ({
        title: null,
        alt: null
      })
    }
  },
};
</script>

<style scoped></style>
