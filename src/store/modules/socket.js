import readIsoArray from "@/files/BinaryReader.js";
import MessageWriter from "@/files/MessageWriter.js";

export default {
  state: () => ({
    ws: null,
    connected: false,
    unboundMessages: [],
  }),

  getters: {
    getIsConnected(state) {
      return state.connected;
    },
    getUnbound(state) {
      return state.unboundMessages;
    },
  },

  mutations: {
    WS(state, socketObject) {
      state.ws = socketObject;
    },
    CONNECTED(state, isConnected) {
      state.connected = isConnected;
    },
    UNBOUNDMESSAGE(state, message) {
      state.unboundMessages.push(message);
    },
  },

  actions: {
    connect({ commit, dispatch }) {
      let websocket = new WebSocket("ws://triton.xenlab.one:8086/");

      websocket.onopen = () => {
        commit("WS", websocket);
        commit("CONNECTED", true);
      };

      websocket.onclose = () => {
        // console.log('WEBSOCKET DISCONNECTED. EVENT OBJECT:', e);
        dispatch("disconnect");
        websocket = null;
      };

      websocket.onmessage = async (e) => {
        // console.log(typeof e.data);
        const blob = e.data;
        const buffer = await blob.arrayBuffer();
        const array = new Uint8Array(buffer);

        const message = readIsoArray(array);
        // console.log(
        //   "websocket.onmessage:",
        //   JSON.parse(JSON.stringify(message))
        // );

        dispatch("message", message);
      };
    },

    message({ commit, dispatch }, { type, header, model, data, attachments }) {
      try {
        switch (type) {
          case 1:
            commit("USER", data);
            break;
          case 2:
            commit("RAWDATA", {
              alt: header.alt,
              raw: {
                model,
                data,
              },
            });
            commit("SETLOADED", header.alt);
            break;
          case 3:
          case 4:
          case 5:
            dispatch("fetchData", { alt: header.alt });
            break;
          case 8:
          case 11:
            commit("ADD_CRUD_RESPOSE", {
              type,
              header,
              model,
              data,
              attachments,
            });
            commit("SETLOADED", header.alt);
            break;
          default:
            commit("UNBOUNDMESSAGE", {
              type,
              header,
              model,
              data,
              attachments,
            });
        }
      } catch (e) {
        console.error(e);
      }
    },

    disconnect({ commit }) {
      commit("CONNECTED", false);
      commit("WS", null);
    },

    reconnect({ dispatch, getters }) {
      if (getters.WS) {
        dispatch("disconnect");
        setTimeout(() => {
          dispatch("connect");
        }, 3000);
      } else {
        dispatch("connect");
      }
    },

    send2back({ state, getters }, { header, body }) {
      console.log("Sending message:", { header, body });

      header.token = getters.token;

      const json = {
        header: header,
      };

      if (typeof body === "object") json.body = body;

      let writer = new MessageWriter(json);

      let message = writer.message;

      try {
        state.ws.send(message);
      } catch (e) {
        console.log(state);
        console.log("SEND ERROR:", e.message);
      } finally {
        message = null;
        writer = null;
      }
    },
  },
};
