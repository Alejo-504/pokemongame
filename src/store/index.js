import { createStore } from "vuex";
import axios from "axios";
import { pushmsg } from "@/components/globals/scripts/PushMsg.js";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import { io } from "socket.io-client";
import router from "@/router";
import generalconfig from "@/config/general.json";
const server = "https://pokemon-v2-dev12.com";
const restApi = "https://pokemonapirest-dev-gxsb.3.us-1.fl0.io/";
const minutesForInactivity = generalconfig["minutes-for-inactivity"];
const minutesTheInactivityForDisconnect =
  generalconfig["minutes-the-inactivity-for-disconnect"];
const moment = require("moment");
export default createStore({
  state: {
    chronometer: {
      inactivity: null,
      disconnection: null,
    },
    status: null,
    clock: null,
    lang: "english",
    token: null,
    loading: false,
    ID_USER: null,
    DATA_USER: null,
    ROOM: null,
    users_connected: [],
    mapSelected: null,
    socket: io(server, {
      reconnectionDelayMax: 10000,
      transports: ["websocket"],
      secure: true,
    }),
    view: null,
    server,
    restApi,
    background_sound: "",
    disable_sound_for_browser: null,
  },
  mutations: {
    setStatus(state, value) {
      if (value == "offline") {
        this.commit("resetChronometer", "disconnection");
      } else if (value == "online") {
        this.commit("resetChronometer", "inactivity");
      }

      state.status = value;
    },
    resetChronometer(state, name) {
      if (state.clock) {
        switch (name) {
          case "disconnection":
            let newtime = state.clock.clone();
            if (minutesTheInactivityForDisconnect) {
              state.chronometer.disconnection = newtime.add(
                minutesTheInactivityForDisconnect,
                "minutes"
              );
            }
            state.chronometer.inactivity = null;
            break;
          case "inactivity":
            let newtime2 = state.clock.clone();

            state.chronometer.inactivity = newtime2.add(
              minutesForInactivity,
              "minutes"
            );
            state.chronometer.disconnection = null;
            break;
        }
      }
    },
    setMapSelected(state, payload) {
      if (payload != null && payload != state.mapSelected) {
        state.mapSelected = payload;
        state.socket.emit("change:map", {
          room: state.ROOM,
          map: state.mapSelected,
          socket: state.socket.id,
        });
      }
    },
    setToken(state, payload) {
      state.token = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setUserID(state, payload) {
      state.ID_USER = payload;
    },
    setDataUser(state, payload) {
      state.DATA_USER = payload;
    },
    setRom(state, payload) {
      state.ROOM = payload;
    },
    setClock(state, payload) {
      let clock = moment(payload);
      state.clock = clock;
    },
  },
  actions: {
    getUserID({ commit }) {
      return new Promise((resolve, rejected) => {
        axios
          .get(restApi + "api/logged", {
            headers: {
              "auth-token": this.state.token,
            },
          })
          .then((res) => {
            commit("setUserID", res.data.data.user.id);
            resolve(res.data.data.user.id);
          })
          .catch((err) => {
            rejected(err);
          });
      });
    },
    getDataUser({ commit }) {
      return new Promise((resolve, rejected) => {
        axios
          .get(restApi + "api/logged/" + this.state.ID_USER, {
            headers: {
              "auth-token": this.state.token,
            },
          })
          .then((res) => {
            commit("setDataUser", res.data);
            resolve(res.data);
          })
          .catch((err) => {
            console.log(err);
            rejected(err);
          });
      });
    },
    login({ commit }, user) {
      commit("setLoading", true);

      axios
        .post(restApi + "api/user/login", user)
        .then((res) => {
          let token = res.data.data.token;
          commit("setToken", token);
          commit("setLoading", false);
          if (generalconfig["persistent-session"]) {
            sessionStorage.setItem("token", token);
          }
          alertiw.close("playNow");
          //mover a la ruta game
          router.go({ name: "game" });
        })
        .catch((err) => {
          let error;
          if (err.response) {
            error = err.response.data.error;
          } else {
            console.log(err);
            error = "CONNECTION ERROR! TRY AGAIN LATER";
          }
          pushmsg.open("errorLogin", error);
          console.log(error);
          commit("setLoading", false);
        });
    },
    readToken({ commit }) {
      let token = sessionStorage.getItem("token");

      if (token && generalconfig["persistent-session"]) {
        commit("setToken", token);
      } else {
        commit("setToken", null);
      }
    },
    updateDataUser({ commit }, newData) {
      axios.post(restApi + "api/logged/update/" + this.state.ID_USER, newData, {
        headers: {
          "auth-token": this.state.token,
        },
      });
    },

    addTrainerExp({ commit }, exp) {
      this.dispatch("updateDataUser", {
        "trainer.exp": (this.state.DATA_USER.trainer.exp += exp),
      });
    },

    addCoins({ commit }, coins) {
      let amount = coins;
      let interval = setInterval(() => {
        this.state.DATA_USER.trainer.coins += 1;
        amount -= 1;

        if (amount == 0) {
          this.dispatch("updateDataUser", {
            "trainer.coins": this.state.DATA_USER.trainer.coins,
          });
          clearInterval(interval);
        }
      }, 100);
    },
    logout({ commit }) {
      sessionStorage.removeItem("token");
      this.dispatch("readToken");
      router.push("/");
      commit("setDataUser", null);
      this.state.socket.disconnect();
    },
  },
  modules: {},
});
