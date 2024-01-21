<template>
  <div class="home">
    <ul @click="toggleIdioms" class="idioms">
      {{
        text.lang
      }}
      <img
        :src="$store.state.lang == 'spanish' ? es : en"
        alt="icono en español"
      />
      <li class="english" @click="selLangEnglish">
        {{ text.idioms.en }}<img :src="en" alt="icono de ingles" />
      </li>
      <li class="spanish" @click="selLangSpanish">
        {{ text.idioms.es }}<img :src="es" alt="icono de español" />
      </li>
    </ul>
    <div id="wallpapper-sky" :class="sky">
      <gif-moving
        :src="clouds"
        :size="{ width: '550px', height: '250px' }"
        :heightshow="{ min: 20, max: 30 }"
        runTo="left"
        :interval="4000"
        :duration="35000"
        :inverted="true"
      />
      <gif-moving
        :src="clouds"
        :size="{ width: '200px', height: '100px' }"
        :heightshow="{ min: 0, max: 10 }"
        runTo="left"
        :interval="9000"
        :duration="30000"
      />
      <gif-moving
        :src="clouds"
        :size="{ width: '200px', height: '100px' }"
        :heightshow="{ min: 0, max: 10 }"
        runTo="left"
        :interval="2000"
        :duration="30000"
        :noloop="true"
      />
      <gif-moving
        :src="pixilart"
        runTo="right"
        size="90px"
        :interval="37000"
        :duration="3000"
        :turnback="true"
        :turnback-delay="18000"
      />
      <gif-moving
        :src="pelipper"
        runTo="left"
        :inverted="true"
        :interval="1200"
        :duration="7000"
        :turnback="true"
        :turnback-delay="18000"
      />
      <gif-moving
        :src="pelipper"
        runTo="right"
        :interval="1200"
        :duration="7000"
        :noloop="true"
      />
      <gif-moving
        :src="charizar"
        runTo="right"
        size="120px"
        :interval="10000"
        :turnback="true"
        :turnback-delay="20000"
        :duration="10000"
      />
    </div>
    <div class="cesped-center" :style="backgroundEarth"></div>
    <div id="wallpapper-tierra">
      <gif-moving
        :src="pikachu"
        runTo="right"
        :inverted="true"
        :interval="16000"
        :turnback="true"
        :turnback-delay="8000"
      />
      <gif-moving :src="evve" runTo="right" :interval="12000" :noloop="true" />
      <gif-moving
        :src="evve"
        runTo="left"
        :inverted="true"
        :interval="9000"
        :duration="4000"
        :turnback="true"
        :turnback-delay="14000"
      />
      <gif-moving
        :src="mew"
        runTo="right"
        :inverted="true"
        :interval="15000"
        :duration="3600"
        :noloop="true"
      />
      <gif-moving
        :src="mew"
        runTo="left"
        :interval="25000"
        :duration="3600"
        :turnback="true"
        :turnback-delay="18000"
      />

      <gif-moving :src="pikachu" runTo="left" :interval="1000" :noloop="true" />
      <div class="down-wallp"></div>
    </div>
    <div class="cap-index">
      <div class="game-title">
        <img :src="title" />
      </div>

      <div class="index-buttons">
        <AlertIw
          name="playNow"
          title="LOGIN "
          :cssAlert="{
            borderRadius: '10px',
            background: '#2c3e50',
          }"
          :cssTitle="{
            backgroundColor: 'white',
            color: '#000000',
          }"
        >
          <login-form></login-form>
        </AlertIw>

        <button id="playnow" @click="alertiw.open('playNow')">
          ¡PLAY NOW!
        </button>
      </div>
    </div>
    <section class="advertisements">
      <article
        v-for="(item, index) in starterArticles"
        v-bind:key="index"
        :style="
          'justify-content:' +
          (item.text.align != 'center' ? 'flex-' + item.text.align : 'center') +
          ';' +
          'background-image:url(' +
          require('@/assets/' + item.background.src) +
          ');' +
          'background-attachment:' +
          (item.background.attachment ? item.background.attachment : 'scroll') +
          ';' +
          'background-size:' +
          (item.background.size ? item.background.size : 'cover') +
          ';'
        "
      >
        <div
          :data-aos="item.text.effect ? item.text.effect : 'slide-right'"
          :class="'container-article ' + item.text.theme"
        >
          <h2>{{ item.text.title }}</h2>
          <p>{{ item.text.description }}</p>
        </div>
      </article>
    </section>
  </div>
</template>
<script>
import lang from "@/assets/languages-template/index.json";
import store from "@/store/index.js";
import es from "@/assets/español.png";
import en from "@/assets/ingles.png";
import background_earth from "@/assets/earth.png";
import pikachu from "@/assets/pikachu.gif";
import pixilart from "@/assets/pixilart.gif";
import charizar from "@/assets/charizar.gif";
import evve from "@/assets/evve.gif";
import mew from "@/assets/mew.gif";
import pelipper from "@/assets/pelipper.gif";
import clouds from "@/assets/clouds.png";
import bola from "@/assets/bola.png";
import title from "@/assets/title.png";
import check from "@/assets/check.png";
import cancel from "@/assets/cancel.png";
import gifMoving from "@/components/gif-animator";
import starterArticles from "@/config/articles";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import loginForm from "@/components/login-form";
import AOS from "aos";
import "aos/dist/aos.css";
export default {
  props: {
    sky: {
      type: String,
      default: "morning",
    },
  },
  name: "Home",
  components: {
    "gif-moving": gifMoving,
    loginForm,
  },
  data() {
    return {
      starterArticles,
      alertiw,
      backgroundEarth: "background-image:url(" + background_earth + ")",
      pikachu,
      evve,
      pixilart,
      mew,
      clouds,
      pelipper,
      charizar,
      check,
      cancel,
      title,
      store,
      en,
      es,
      idioms: true,
      bola,
      showRegisterForm: false,
    };
  },
  computed: {
    text() {
      return lang[store.state.lang];
    },
    randomInt() {
      return this.randomValue;
    },
  },

  methods: {
    selLangEnglish() {
      store.state.lang = "english";
    },
    selLangSpanish() {
      store.state.lang = "spanish";
    },
    toggleIdioms() {
      const idioms = document.querySelectorAll(".idioms li");

      if (this.idioms == true) {
        idioms.forEach((el) => {
          if (store.state.lang != el.classList[0]) {
            el.style.display = "flex";
          }
        });
      } else {
        idioms.forEach((el) => {
          el.style.display = "none";
        });
      }
      this.idioms = !this.idioms;
    },
  },
  created() {
    //si store.state.token esta definido, entonces se redirige a la pagina de /game
    if (store.state.token) {
      this.$router.push("/game");
    }
  },
  mounted() {
    AOS.init();

    this.$nextTick(() => {
      this.$emit("homePainted");
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.home {
  .advertisements {
    height: auto;
    width: 100%;
    background: rgb(84, 84, 94);
    article {
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      height: 300px;
      border-top: solid 25px black;
      display: flex;
      align-items: center;
      padding: 10px 20px;
      @include phones() {
        padding: 0;
        width: 100%;
        font-size: 13px;
        justify-content: center !important;
      }
      .container-article {
        @include phones() {
          height: auto;
          min-width: 200px;
        }
        h2 {
          font-family: "Roboto-Black";
        }
        p {
          text-align: justify;
          font-family: "nunito-bold";
        }
        box-shadow: 0px 10px 25px -15px rgba(0, 0, 0, 0.75);
        min-width: 300px;
        max-width: 450px;
        width: 50%;
        padding: 20px;
        border-radius: 5px;
      }
      .light {
        background: rgba(248, 248, 248, 0.753);
        color: rgb(0, 0, 0);
        h2 {
          background: -webkit-linear-gradient(rgb(0, 0, 0), rgb(0, 201, 84));
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: tomato;
        }
      }
      .dark {
        background: rgba(0, 0, 0, 0.753);
        color: rgb(255, 255, 255);
        h2 {
          background: -webkit-linear-gradient(
            rgb(255, 255, 255),
            rgb(248, 204, 7)
          );
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: tomato;
        }
      }
    }
  }
  .cap-index {
    @include flex(center, wrap);
    width: 100%;
    height: 100vh;
    min-height: 400px;
    z-index: 15;
    position: absolute;
    top: 0;
    .index-buttons {
      padding: 5px;
      width: 200px;
      top: 200px;
      @include flex(center, wrap);
      button {
        font-family: "bangers";
        font-size: 29px;
        margin-bottom: 10px;
        @include flex(center, nowrap, row, flex-start);
        padding-top: 13px;
        @include button3D(rgb(255, 238, 0));
        width: 200px;
        height: 60px;
        color: rgb(0, 0, 0);
        font-weight: 900;
        letter-spacing: 1.3px;
        &:hover {
          font-size: 31px;
          text-shadow: -1px 0px 19px rgba(255, 0, 0, 0.87);
        }
      }
    }
    .game-title {
      width: 100%;
      height: 100px;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      pointer-events: none;
      margin-top: 50px;
      img {
        z-index: 15;
        width: 420px;
        height: 180px;
        bottom: -10px;
        @include phones() {
          width: 300px;
          height: 130px;
        }
      }
    }
  }
}
.cesped-center {
  width: 100%;
  height: 40px;
  position: absolute;
  top: 47%;
  left: 0;
  background-size: cover;
  z-index: 14;
  @include phones() {
    height: 55px;
  }
}
.morning {
  background: rgb(255, 254, 248);
  background: linear-gradient(
    5deg,
    rgba(255, 254, 248, 1) 0%,
    rgba(247, 241, 143, 1) 46%,
    rgba(255, 215, 133, 1) 73%,
    rgba(255, 172, 124, 1) 86%,
    rgba(255, 126, 126, 1) 95%,
    rgba(249, 94, 94, 1) 100%
  );
}
.sunrising {
  background: rgb(244, 39, 39);
  background: linear-gradient(
    186deg,
    rgba(244, 39, 39, 1) 0%,
    rgba(249, 38, 38, 1) 0%,
    rgba(251, 94, 38, 1) 0%,
    rgba(252, 145, 38, 1) 20%,
    rgba(254, 176, 19, 1) 49%,
    rgba(252, 212, 46, 1) 79%,
    rgba(236, 249, 247, 1) 100%
  );
}
.afternoon {
  background: rgb(80, 120, 203);
  background: linear-gradient(
    186deg,
    rgba(80, 120, 203, 1) 0%,
    rgba(155, 156, 222, 1) 14%,
    rgba(240, 174, 174, 1) 52%,
    rgba(255, 167, 108, 1) 66%,
    rgba(255, 183, 67, 1) 88%,
    rgba(255, 211, 97, 1) 94%,
    rgba(255, 214, 164, 1) 100%
  );
}
.night {
  background: rgb(50, 121, 200);
  background: linear-gradient(
    14deg,
    rgba(50, 121, 200, 1) 0%,
    rgba(68, 112, 205, 1) 0%,
    rgba(96, 141, 204, 1) 3%,
    rgba(45, 70, 194, 1) 32%,
    rgba(24, 36, 105, 1) 58%,
    rgba(26, 34, 80, 1) 69%,
    rgba(38, 39, 41, 1) 92%,
    rgba(25, 28, 43, 1) 98%,
    rgba(23, 23, 23, 1) 100%
  );
}
#wallpapper-sky {
  height: 50vh;
  min-height: 200px;
  position: relative;
  overflow: hidden;
  @include phones {
    min-height: 100px;
  }
}
#wallpapper-tierra {
  background-size: contain;
  width: 100%;
  height: 50vh;
  min-height: 240px;
  position: relative;
  overflow: hidden;
  @include phones() {
    min-height: 120px;
  }
  background-repeat: no-repeat;
  .down-wallp {
    position: absolute;
    bottom: 0;
    height: 40vh;
    min-height: 200px;
    width: 100%;
    @include phones() {
      height: 45vh;
      min-height: 100px;
    }
    background: #4db96d;
  }
}

.idioms {
  background: rgba(0, 0, 0, 0.527);
  color: white;
  border-radius: 5px;
  list-style: none;
  width: 120px;
  padding: 5px;
  height: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 15px;
  right: 5px;
  cursor: pointer;
  z-index: 16;
  font-size: 11px;
}
.idioms img {
  width: 25px;
  height: 15px;
  border: solid 1px black;
}
.idioms li {
  padding: 5px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
  display: none;
  color: white;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.527);
  margin-top: 10px;
}
</style>
