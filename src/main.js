import { createApp } from "vue/dist/vue.esm-bundler";
import App from "./App.vue";
import "normalize.css";
//import './registerServiceWorker';
import router from "./router";
import store from "./store";
import AlertIw from "@/components/globals/AlertIw";
import ToolTip from "@/components/globals/ToolTip";
import GetSprite from "@/components/globals/GetSprite";
import GetPokemon from "@/components/globals/GetPokemon";
import ProgressBar from "@/components/globals/ProgressBar";
import ShowLoader from "@/components/globals/ShowLoader";
import PushMsg from "@/components/globals/PushMsg";
import FadeUp from "@/components/globals/FadeUp";
import icons from "@/components/globals/icons.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import circleProgress from "vue3-circle-progress";
const confetti = require("canvas-confetti");

let app = createApp(App);
app.component("GetSprite", GetSprite);
app.component("FadeUp", FadeUp);
app.component("PushMsg", PushMsg);
app.component("ShowLoader", ShowLoader);
app.component("GetPokemon", GetPokemon);
app.component("ToolTip", ToolTip);
app.component("AlertIw", AlertIw);
app.component("Icons", icons);
app.component("ProgressBar", ProgressBar);
app.component("circleProgress", circleProgress);
app.use(VueAxios, axios);
app.use(store);
app.use(router);
//preparar conffeti para usarlo globalmente
app.config.globalProperties.$confetti = (
  node,
  options = {
    particleCount: 100,
    startVelocity: 20,
    spread: 400,
  },
  width,
  height
) => {
  let canvas = document.createElement("canvas");
  canvas.width = !width ? node.offsetWidth : width;
  canvas.height = !height ? node.offsetHeight : height;
  canvas.style.position = "absolute";
  node.appendChild(canvas);
  let myConffeti = confetti.create(canvas, {
    resize: false,
  });

  myConffeti(options);
};
app.mount("#app");
