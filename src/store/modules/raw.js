import Vue from "vue";

export default {
  state: () => ({
    data: {},
    inLoad: [],
    crudResponses: {},
  }),

  getters: {
    getLoadingStateByAlt: (state) => (alt) =>
      state.data[alt] ? state.data[alt].isLoading : true,

    getRawByAlt: (state) => (alt) =>
      state.data[alt] ? state.data[alt].raw : null,

    getMenuData: (state) => state.data.mn,

    getInLoadingByAlt: (state) => (alt) =>
      state.inLoad.includes(alt) ? true : false,

    getCrudResponses: (state) => (id) => state.crudResponses[id],
  },

  mutations: {
    ADDTOCRUDQEUE(state, key) {
      state.crudQeue.push[key];
    },

    REMOVEFROMCRUDQEUE(state, key) {
      const indx = state.crudQeue.indexOf(key);
      state.crudQeue.splice(indx, 1);
    },

    ADD_CRUD_RESPOSE(state, object) {
      //state.crudResponses[object.header.key] = object;
      Vue.set(state.crudResponses, object.header.key, object);
    },

    REMOVE_CRUD_RESPONSE(state, id) {
      console.log("REMOVE_CRUD_RESPONSE:", id);
      Object.prototype.hasOwnProperty.call(state.crudResponses, id)
        ? delete state.crudResponses[id]
        : null;
    },

    SETLOADING(state, alt) {
      if (state.inLoad.indexOf(alt) === -1) state.inLoad.push(alt);
    },

    SETLOADED(state, alt) {
      const indx = state.inLoad.indexOf(alt);
      if (indx > -1) {
        state.inLoad.splice(indx, 1);
      }
    },

    RAWDATA(state, object) {
      state.data[object.alt].raw = object.raw;
      state.data[object.alt].isLoading = false;
    },

    ADDITEM(state, alt) {
      if (!state.data[alt]) {
        Vue.set(state.data, alt, {});
        Vue.set(state.data[alt], "editFields", []);
        Vue.set(state.data[alt], "raw", {});
      }
    },

    DISPOSEDATA(state) {
      state.data = {};
    },
  },

  actions: {
    requestCrud({ commit, dispatch }, { header, body }) {
      commit("SETLOADING", header.alt);

      dispatch("send2back", { header, body });
    },

    fetchData({ commit, dispatch, getters }, header) {
      const alt = header.alt;

      commit("SETLOADING", alt);

      if (!getters.getRawByAlt(alt)) {
        commit("ADDITEM", alt);
      }

      header.type = 2;
      header.key = "data";

      dispatch("send2back", { header });
    },

    extractCrudResponse({ commit, getters }, id) {
      const response = getters.getCrudResponses(id);
      commit("REMOVE_CRUD_RESPONSE", id);
      return response;
    },
  },
};
