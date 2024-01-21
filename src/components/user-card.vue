<template>
  <div class="trainer-info">
    <div class="up-buttons">
      <button
        @click="
          () => {
            changeScreen('store');
          }
        "
        class="store-btn"
      >
        <Icons id="access-store" name="store.png" size="22px" />
        <ToolTip on="#access-store" :arrow="false" :await="200">Store</ToolTip>
      </button>
      <!--<button
        @click="
          () => {
            changeScreen('pokemons');
          }
        "
        class="pokemons-btn"
      >
        <Icons id="access-pokemons" name="pokedex.svg" size="22px" />
        <ToolTip on="#access-pokemons" :await="200" :arrow="false"
          >Pokemons</ToolTip
        >
      </button>
      -->
      <button
        @click="
          () => {
            changeScreen('store');
          }
        "
        class="bag-btn"
      >
        <Icons id="access-bag" name="bag.svg" size="22px" />
        <ToolTip on="#access-bag" :arrow="false" :await="200">Bag</ToolTip>
      </button>
      <button @click="alertiw.open('MapsList')">
        <Icons id="access-map" name="map.png" size="22px" />
        <ToolTip on="#access-map" :arrow="false" :await="200">Maps</ToolTip>
        <AlertIw
          :icon="require('@/assets/map.png')"
          title="Map"
          name="MapsList"
          :cssAlert="{
            background: '#f4f4f4',
            borderRadius: '0',
          }"
        >
          <div id="listMaps">
            <ul class="types">
              <li
                v-for="map in Object.keys(mapList)"
                @click="changeMap(map)"
                v-bind:key="map"
              >
                <span class="title" v-if="!mapList[map].hidden">{{
                  mapList[map].location
                }}</span>
                <div class="typesMap" v-if="!mapList[map].hidden">
                  <Icons
                    v-for="type in mapList[map].types"
                    v-bind:key="type"
                    :name="
                      'type/' +
                      type.charAt(0).toUpperCase() +
                      type.substring(1, type.length) +
                      '.gif'
                    "
                  />
                </div>
              </li>
            </ul>
          </div>
        </AlertIw>
      </button>
    </div>
    <Logout class="icon-logout" @click="logout"> </Logout>
    <ToolTip on=".icon-logout" :await="400"> Logout </ToolTip>
    <AlertIw title="LEVEL UP" width="250px" name="levelUp">
      <div id="lv-celebrate">
        <h3>Trainer LEvel</h3>
        <h1>{{ beforeLevel }}</h1>
      </div>
    </AlertIw>
    <ShowLoader
      :size="20"
      color_load="#e74c3c"
      color_bar="#ecf0f1"
      v-if="!store.state.DATA_USER"
    />
    <div class="container-info-trainer" v-if="store.state.DATA_USER">
      <div class="level-view">
        <FadeUp
          course="top"
          position="60%"
          color="#3498db"
          :time="3000"
          :font="{
            fontSize: '14px',
          }"
        >
          <Icons name="star.svg" size="22px" />
        </FadeUp>

        <div class="level-number"><span class="text">Lv.</span>{{ LEVEL }}</div>
        <ToolTip
          on="#exp-progress"
          :await="400"
          style="width: auto; text-overflow: ellipsis; white-space: pre"
        >
          <span class="text-exp">
            <Icons name="star.svg" size="22px" />

            {{ DATA.trainer?.exp }}
            {{
              LEVEL != levels["trainer-levels"].length - 2
                ? " / " + levels["trainer-levels"][Number.parseInt(LEVEL) + 1]
                : ""
            }}</span
          ></ToolTip
        >

        <circle-progress
          :border-bg-width="10"
          :border-width="7"
          :size="60"
          :percent="getPorcentExp(DATA?.trainer?.exp, LEVEL)"
          id="exp-progress"
          empty-color="#34495e"
        >
        </circle-progress>
      </div>
      <div class="info-user">
        <h4 @click="alertiw.open('detailUser')">
          <AccountCircle />{{ DATA.username }}
        </h4>
        <AlertIw
          title="Trainer details"
          name="detailUser"
          :icon="card"
          :cssTitle="{
            color: 'black',
          }"
          :cssAlert="{
            background: 'url(' + wallp + ')',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom',
            backgroundColor: 'white',
            backgroundRepeat: 'no-repeat',
          }"
        >
          <user-details
            :DATA="DATA"
            :LEVEL="LEVEL"
            :porcent="getPorcentExp(DATA?.trainer?.exp, LEVEL)"
            :levels="levels"
          ></user-details>
        </AlertIw>
        <div class="coins">
          <img :src="coins" />{{ DATA?.trainer?.coins }}
          <FadeUp
            course="top"
            position="60%"
            color="#3498db"
            :time="3000"
            :font="{
              fontSize: '14px',
            }"
          >
            <Icons name="coins.png" size="22px" />
          </FadeUp>
        </div>
      </div>
    </div>
    <div class="tabs-nav">
      <div @click="selectTab(1)" id="tabnav-1" class="select">
        Chat
        <ChatOutline />
      </div>
      <div @click="selectTab(2)" id="tabnav-2">
        Team
        <ShieldOutline />
      </div>
      <div @click="selectTab(3)" id="tabnav-3">
        Pokemons
        <Pokeball />
      </div>
    </div>
  </div>
</template>
<script>
import store from "@/store/index.js";
import coins from "@/assets/coins.png";
import wallp from "@/assets/alertWallpaper.png";

import card from "@/assets/IdCard.png";
import levels from "@/config/levelup";
import general_config from "@/config/general.json";
import {
  AccountCircle,
  ChatOutline,
  Pokeball,
  ShieldOutline,
  Logout,
  //Medal /*, Store , Medal*/,
} from "mdue";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import userDetails from "@/components/user-details.vue";
//import ListMedals from "@/components/list-medals";
import defaultMedals from "@/assets/medals/default.png";
import mapList from "@/config/maps/maps.json";
export default {
  components: {
    userDetails,
    ShieldOutline,
    AccountCircle,
    ChatOutline,
    Pokeball,
    Logout,
    //Store,
    //Medal,
    //ListMedals,
  },
  data() {
    return {
      mapList,
      card,
      wallp,
      defaultMedals,
      general_config,
      coins,
      store,
      levels,
      alertiw,
      beforeLevel: null,
    };
  },
  computed: {
    DATA() {
      return store.state.DATA_USER;
    },
    LEVEL() {
      let res = this.calcLevel(this.DATA?.trainer?.exp, levels);
      store.state.DATA_USER.trainerLv = res;
      return res;
    },
  },
  methods: {
    changeMap(map) {
      //si es string pasar a number
      if (typeof map === "string") {
        map = Number.parseInt(map);
      }
      this.alertiw.close("MapsList");
      store.commit("setMapSelected", map);
    },
    selectTab(nrTab) {
      let tabs = document.querySelectorAll(".tabs-nav div");
      tabs.forEach((element) => {
        if (element.getAttribute("id") == "tabnav-" + nrTab) {
          element.classList.add("select");
          this.$emit("changeTab", nrTab);
        } else {
          if (element.classList[0]) element.classList.remove("select");
        }
      });
    },
    calcLevel(exp, levels) {
      levels = levels["trainer-levels"];
      for (let i in levels) {
        if (levels[i] > exp) {
          let level = Number.parseInt(i) - 1;
          if (this.beforeLevel && this.beforeLevel < level) {
            if (this.general_config["levelup-trainer-alert"]) {
              this.alertiw.open("levelUp");
            }
          }
          this.beforeLevel = level;
          return level;
        }
      }
      return levels.length - 2;
    },
    sound(src) {
      let sound = require("@/assets/sounds/" + src);
      let audio = new Audio(sound);
      audio.play();
    },
    getPorcentExp(exp, levelExp) {
      let nextLevelExp = levelExp + 1;
      let expEnd =
        levels["trainer-levels"][nextLevelExp] -
        levels["trainer-levels"][levelExp];
      exp = exp - levels["trainer-levels"][levelExp];

      let res = exp != null ? (exp * 100) / expEnd : null;
      return res;
    },
    logout() {
      store.dispatch("logout");
    },
    animateExpUp(parentFade) {
      let exp_fadeup = document.querySelector(parentFade + " .fadeUp");
      exp_fadeup.fade("+20");
    },
    changeScreen(screen) {
      this.$emit("changeScreen", screen);
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* document.addEventListener("keyup", (evt) => {
        if (evt.keyCode == 32) {
          this.animateExpUp(".level-view");
          store.dispatch("addExp", 10);
        }
      });
      */
    });
  },
};
</script>
<style scoped lang="scss">
@import "@/_basic.scss";
$hover: rgb(248, 104, 104);

.icon-logout {
  position: absolute;
  top: 5px;
  left: 5px;
  cursor: pointer;
  font-size: 20px;
  z-index: 100000;
}
.tooltip {
  width: auto;
  background: $hover;
  color: black;
  padding: 2px 10px;
  font-size: 13px;

  font-family: "Roboto-Black";
  border-radius: 5px !important;
}

.text-exp {
  padding: 2px;
  @include flex(center);
}
.up-buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  @include flex(center, nowrap, column);
  button {
    background: none;
    border: none;
    outline: none;

    font-size: 20px;
    cursor: pointer;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: $hover;
    }
  }
}
.tabs-nav {
  position: absolute;
  bottom: 0;
  width: 100%;
  color: rgb(0, 0, 0);
  @include flex(flex-start);
  font-size: 11px;

  svg {
    font-size: 12px;
  }
  div {
    @include flex(space-between);
    padding: 3px 10px;
    background: rgb(233, 233, 233);
    width: 85px;
    font-family: "Roboto-Black";
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    &:hover {
      background: $hover;
      color: rgb(0, 0, 0);
    }
  }
  .select {
    color: rgb(0, 0, 0);

    background: $hover;
  }
}
#lv-celebrate {
  width: 100%;
  height: 150px;
  @include flex(center, wrap);
  font-size: 25px;
  font-family: "bangers";
  position: relative;

  h1 {
    text-align: center;
    width: 100%;
    margin: 0;
    font-size: 4em;
    padding: 0;
    color: white;
    text-shadow: 0 0.1em 20px black, 0.05em -0.03em 0 black,
      0.05em 0.005em 0 black, 0em 0.08em 0 black, 0.05em 0.08em 0 black,
      0px -0.03em 0 black, -0.03em -0.03em 0 black, -0.03em 0.08em 0 black,
      -0.03em 0 0 black;
  }
  h1 span {
    -webkit-transform: scale(0.9);
    transform: scale(0.9);
    display: inline-block;
  }
  h1 span:first-child {
    -webkit-animation: bop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards
      infinite alternate;
    animation: bop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards infinite
      alternate;
  }
  h1 span:last-child {
    -webkit-animation: bopB 1s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)
      forwards infinite alternate;
    animation: bopB 1s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards
      infinite alternate;
  }

  span {
    font-family: "Roboto-Black";
    position: absolute;
    bottom: -20px;
    text-shadow: none;
    font-style: italic;
    font-size: 25px;
  }
}
.trainer-info {
  background-size: contain;
  background-repeat: no-repeat;
  @include flex(flex-start);
  height: 15%;
  min-height: 120px;
  width: 100%;
  position: relative;
  .container-info-trainer {
    @include flex(flex-start, wrap);
    width: 100%;
    margin-left: 20px;
    margin-top: -13px;
    .info-user {
      h4 {
        cursor: pointer;
        svg {
          margin-right: 5px;
          font-size: 17px;
        }
        margin-bottom: 5px;
        @include flex(flex-start);
        font-family: "Roboto-Black";
        font-size: 16px;
        width: 100%;
      }
      .coins {
        font-family: "bangers";
        font-size: 14px;
        @include flex(flex-start);

        color: #000000;
        img {
          margin: 0 7px 0 10px;
          width: 15px;
          height: 15px;
        }
      }
    }

    .level-view {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      @include flex(center);
      position: relative;

      .level-number {
        font-size: 18px;
        font-family: "bangers";
        color: #000000;
        height: auto;
        margin-top: -8px;
        .text {
          font-size: 10px;
          font-weight: 900;
          position: absolute;
          left: -30px;
          bottom: -16px;
          text-shadow: none;
          font-family: "Roboto-Black";
        }
        position: absolute;
      }
    }
    h4 {
      margin: 0 10px;
    }
  }
}

#listMaps {
  max-width: 400px;
  min-width: 300px;
  width: 100%;

  height: auto;
  padding: 0;
  margin: 0;
  .types {
    @include flex(center, wrap);

    margin-left: -3px;
    list-style: none;
    width: 100%;
    padding: 0;
    margin: 0;

    li {
      padding: 2px 4px;
      transition: background 0.2s ease-in-out;
      height: auto;
      padding: 0 30px;
      width: 100%;
      margin: 5px 0;
      cursor: pointer;

      @include flex(space-between);
      @include phones {
        @include flex(flex-start, wrap);

        .title {
          width: 100%;
        }
        .typesMap {
          @include flex(flex-start);
          height: auto;
          width: 100%;
        }
      }
      .title {
        margin-right: 5px;
      }
      &:hover {
        background: #e9e9e9;
      }
      img {
        width: 40px !important;
        height: 17px !important;
        margin: 0 2px;
        margin-bottom: -3px;
      }
    }
  }
}
</style>
