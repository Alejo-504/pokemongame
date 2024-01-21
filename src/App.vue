<template>
  <main id="principal">
    <audio
      id="sound-effect-global"
      controls="none"
      preload="auto"
      style="display: none"
    ></audio>
    <audio
      id="sound-effect-global2"
      controls="none"
      preload="auto"
      style="display: none"
    ></audio>
    <sound class="global-sound"></sound>
    <router-view></router-view>
  </main>
</template>
<script>
import lang from "@/assets/languages-template/index.json";
import store from "@/store/index.js";
import { mapActions } from "vuex";
import sound from "@/components/globals/audio";
export default {
  components: { sound },
  methods: {
    ...mapActions(["readToken"]),
  },
  created() {
    this.readToken();
  },
  computed: {
    loged() {
      return store.state.token;
    },
    text() {
      return lang[store.state.lang];
    },
  },
  watch: {
    loged(val) {
      if (val) {
        //#principal se cambia a negro
      }
    },
  },
};
</script>

<style lang="scss">
.include-talk {
  padding: 4px;
  transition: all 5s ease-in;
  width: auto;
  height: auto;
  min-width: 70px;
  max-width: 120px;
  max-height: 60px;
  background-color: rgba(63, 99, 218, 0.685);
  box-shadow: 10px 10px 33px -17px rgba(0, 0, 0, 0.75);
  position: absolute;
  z-index: 32;
  bottom: calc(100%);
  font-size: 11px;
  border-radius: 7px;
  font-family: "Roboto-Regular";
  text-align: center;
  overflow: hidden;
  margin-bottom: 0;
  margin: 0;
}
.include-context-menu {
  padding: 4px;
  transition: all 5s ease-in;
  width: auto;
  height: auto;
  min-width: 70px;
  max-width: 120px;
  max-height: 60px;
  background-color: rgba(241, 241, 241, 0.685);
  box-shadow: 10px 10px 33px -17px rgba(0, 0, 0, 0.75);
  position: absolute;
  z-index: 32;
  bottom: calc(100%);
  font-size: 11px;
  border-radius: 7px;
  font-family: "Roboto-Regular";
  text-align: center;
  overflow: hidden;
  margin-bottom: 0;
  margin: 0;
  z-index: 33;
  color: black;
  .include-context-menu-option {
    border-radius: 5px;
    padding: 6px;
    &:hover {
      background: rgba(207, 206, 206, 0.788);
      cursor: pointer;
    }
  }
}
@font-face {
  font-family: "sans";
  src: local("sans"), url("assets/fonts/Open_Sans/OpenSans-Regular.ttf");
  font-display: block;
}
@font-face {
  font-family: "Poppins";
  src: local("Poppins"), url("assets/fonts/Poppins/Poppins-ExtraBold.ttf");
  font-display: auto;
}
@font-face {
  font-family: "Poppins-light";
  src: local("Poppins"), url("assets/fonts/Poppins/Poppins-Light.ttf");
  font-display: auto;
}
@font-face {
  font-family: "bangers";
  src: local("bangers"), url("assets/fonts/Bangers/Bangers-Regular.ttf");
  font-display: block;
}
@font-face {
  font-family: "Roboto-Black";
  src: local("Roboto-Black"), url("assets/fonts/Roboto/Roboto-Black.ttf");
  font-display: block;
}
@font-face {
  font-family: "Roboto-Regular";
  src: local("Roboto-Regular"), url("assets/fonts/Roboto/Roboto-Regular.ttf");
  font-display: block;
}
@font-face {
  font-family: "nunito-light";
  src: local("nunito-light"), url("assets/fonts/Nunito/Nunito-Light.ttf");
  font-display: block;
}
@font-face {
  font-family: "nunito-bold";
  src: local("nunito-bold"), url("assets/fonts/Nunito/Nunito-Bold.ttf");
  font-display: block;
}
@import "@/_basic.scss";
body,
html {
  height: 100%;
  position: relative;
  scroll-behavior: smooth;
  //overflow-x: hidden;
  @include scrollbar();
}
* {
  margin: 0;
  padding: 0;
  input[type="text"] {
    font-size: "14px";
  }
}
#principal {
  font-family: "sans", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #4db96d !important;
  min-height: 240px;
}
</style>
