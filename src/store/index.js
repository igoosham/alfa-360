import Vue from "vue";
import Vuex from "vuex";

import socket from "./modules/socket.js";
import auth from "./modules/auth.js";
import raw from "./modules/raw.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    socket,
    auth,
    raw,
  },
});
