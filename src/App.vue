<template>
  <v-app>
    <app-bar
      @drawerToggle="onDrawerToggle"
      @tabClose="onTabClose"
      @tabClick="onTabClick"
      @logOut="onLogOut"
      :tabs="tabs"
      :forsed="activeTab"
    />

    <nav-drawer-main
      v-if="userName"
      :visible="drawer"
      @drawerSelect="onDrawerSelect"
    />

    <v-main>
      <v-container fluid style="height:100%;">
        <component
          key="componentParams.alt"
          :is="currentTabComponent"
          :params="componentParams"
        ></component>

        <!-- <keep-alive include="ToolsSchema">
          <component
            key="componentParams.alt"
            v-bind:is="currentTabComponent"
            :params="componentParams"
          ></component>
        </keep-alive> -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/app-bar.vue";
import Tiles from "@/components/tiles.vue";
import DataGrid from "@/components/data/data-grid.vue";
import UnderConstruction from "@/components/under-construction.vue";
import NavDrawerMain from "@/components/nav-drawer-main.vue";
import LoginForm from "@/components/login-form.vue";
import ToolsSchema from "@/components/tools/tools-schema.vue";

import { mapActions, mapGetters } from "vuex";

export default {
  name: "App",

  components: {
    AppBar,
    DataGrid,
    Tiles,
    UnderConstruction,
    NavDrawerMain,
    LoginForm,
    ToolsSchema
  },

  data: () => ({
    drawer: false,
    tabs: [],
    activeTab: -1
  }),

  computed: {
    ...mapGetters(["userName", "token"]),
    currentTabComponent() {
      let comp = null;
      if (this.userName) {
        if (this.tabs.length) {
          comp = this.tabs[this.activeTab].component
            ? this.tabs[this.activeTab].component
            : "UnderConstruction";
        }
      } else {
        comp = "LoginForm";
      }
      return comp;
    },
    componentParams() {
      if (this.tabs.length) {
        return {
          title: this.tabs[this.activeTab].title,
          alt: this.tabs[this.activeTab].alt
        };
      }
      return null;
    }
  },

  methods: {
    ...mapActions(["connect", "fetchData", "logOut"]),

    onDrawerSelect(item) {
      // console.log("onDrawerSelect item:", item);
      let indx = this.tabs.findIndex(x => x.alt === item.alt);
      if (indx === -1) {
        indx = this.tabs.length;
        this.tabs.push(item);
      }

      this.setActiveTab(indx);
    },

    onDrawerToggle() {
      this.drawer = !this.drawer;
    },

    onTabClose(indx) {
      this.tabs.splice(indx, 1);

      if (indx <= this.tabs) {
        this.setActiveTab(indx);
        return;
      }

      this.setActiveTab(this.tabs.length - 1);
    },

    onLogOut() {
      this.activeTab = -1;
      this.tabs = [];
      this.logOut();
    },

    onTabChange(indx) {
      console.log("onTabChange", indx);
      this.activeTab = indx;
    },

    onTabClick(indx) {
      console.log("onTabClick", indx);
      this.setActiveTab(indx);
    },

    setActiveTab(indx) {
      this.activeTab = indx;
    }
  },

  watch: {
    token: function(newToken) {
      // console.log("newToken:", newToken);
      if (newToken) {
        //console.log(obj);
        this.fetchData({
          alt: "mn"
        });
      }
    }
  },

  created() {
    this.connect();
  }
};
</script>
