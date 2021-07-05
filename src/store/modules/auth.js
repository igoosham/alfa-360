// import router from "@/router"

export default {
  state: () => ({
    user: {
      LOGIN: null,
      IS_TOOLS_OWNER: false,
      TOKEN_GUID: null,
    },
  }),
  getters: {
    userName(state) {
      return state.user.LOGIN;
    },
    token({ user }) {
      return user.TOKEN_GUID;
    },
  },
  mutations: {
    USER(state, obj) {
      state.user = obj;
    },
  },
  actions: {
    authenticateWithPassword({ dispatch }, { login, password }) {
      dispatch("send2back", {
        header: {
          type: 1,
          alt: "usr",
          key: "auth",
          fieldName: "LOGIN",
          fieldValue: login,
        },
        body: [
          {
            PASSWORD: {
              type: "custom",
              value: password
                .split("")
                .map((x) => String.fromCharCode(x.charCodeAt(0) - 8))
                .join(""),
            },
          },
        ],
      });
    },
    logOut({ commit }) {
      commit("DISPOSEDATA");
      commit("USER", {
        LOGIN: null,
        IS_TOOLS_OWNER: false,
        TOKEN_GUID: null,
      });
      commit("CONNECTED", false);
      commit("WS", null);
    },
  },
};
