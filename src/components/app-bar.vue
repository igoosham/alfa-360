<template>
  <v-app-bar app clipped-left color="primary" dark>
    <v-app-bar-nav-icon
      @click.stop="$emit('drawerToggle')"
    ></v-app-bar-nav-icon>
    <v-toolbar-title>360.alfa</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-icon class="mr-4" v-on="on">{{ connectedIcon.icon }}</v-icon>
      </template>
      <span>{{ connectedIcon.tip }}</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-icon class="mr-4" v-on="on">{{ loggedIcon.icon }}</v-icon>
      </template>

      <span>{{ loggedIcon.tip }}</span>
    </v-tooltip>

    <span>{{ userName }}</span>

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="$emit('logOut')">
          <v-list-item-title>Log out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <template v-slot:extension>
      <v-tabs v-model="active" align-with-title show-arrows>
        <v-tab
          v-for="(t, indx) in tabs"
          :key="indx"
          @click.stop="$emit('tabClick', indx)"
        >
          <v-icon class="mr-4">{{ t.icon }}</v-icon>
          <span>{{ t.title }}</span>
          <v-btn icon plain right @click.stop="$emit('tabClose', indx)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AppBar",

  props: {
    tabs: {
      type: Array,
      required: true,
      default: () => []
    },
    forsed: {
      type: Number,
      required: false
    }
  },

  data: () => ({
    active: null
  }),

  computed: {
    ...mapGetters({
      connected: "getIsConnected",
      userName: "userName"
    }),
    connectedIcon() {
      return this.connected
        ? {
            icon: "mdi-cloud-outline",
            tip: "connected"
          }
        : {
            icon: "mdi-cloud-off-outline",
            tip: "disconnected"
          };
    },
    loggedIcon() {
      return this.userName
        ? {
            icon: "mdi-account-check",
            tip: `logged as ${this.userName}`
          }
        : {
            icon: "mdi-account-cancel",
            tip: "not logged in"
          };
    }
  },

  methods: {},

  watch: {
    forsed: function(indx) {
      // console.log("watch forsed:", indx);
      // console.log((this.active = indx));
      if (this.active !== indx) this.active = indx;
    }
  }
};
</script>
