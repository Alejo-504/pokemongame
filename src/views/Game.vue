<template>
  <section id="game" :style="'background-image:url(' + wallpaper + ');'">
    <AlertIw
      name="romSelection"
      :closeIcon="closeIconInSelectRomAlert"
      :easyclose="false"
      :cssTitle="{
        'font-size': '1.5em',
        'font-weight': 'bold',
      }"
    >
      <div class="select-rom">
        <Icons name="title.png" style="width: 190px; height: 70px" />
        <h3>List of avalible rooms</h3>
        <ul>
          <li
            v-for="(rom, key) in roms"
            :key="rom"
            @click="selectRom(rom, key)"
          >
            <span
              ><Icons :name="rom['lang'] + '.png'" size="20px" />{{ rom.title }}
            </span>
            <div class="users-rom">
              <AccountGroup />
              <span class="users-online">
                {{ rom["max-user"] }} / {{ rom?.usersConnected }}</span
              >
            </div>
          </li>
        </ul>
      </div>
    </AlertIw>

    <div class="newMedals-container">
      <PushMsg
        confetti
        :iconCss="{ width: '30px', height: '35px' }"
        name="newMedals"
        type="info"
        :icon="medalIcon"
        :timeout="5000"
      />
    </div>

    <div
      class="side"
      :style="
        !store.state.DATA_USER
          ? 'pointer-events:none; filter: grayscale(100%)'
          : ''
      "
    >
      <user-card
        @changeTab="tab = $event"
        @changeScreen="
          (evt) => {
            changeScreen(evt);
          }
        "
      />

      <chat-online
        @roomDetail="
          (evt) => {
            calUserInRooms(evt);
          }
        "
        :userLoad="userLoad"
        v-show="TAB == 1 && store.state.ROOM"
      />
      <storage-pokemon v-show="TAB == 2" />
      <team-pokemon v-show="TAB == 3" />
    </div>
    <div class="screenGame" v-if="store.state.ROOM">
      <div class="loadScreen">
        <div>
          <Icons name="run-poke.gif" size="90px" class="run-poke" />
          <span>Loading</span>
        </div>
      </div>
      <div class="container-pushmsg">
        <PushMsg
          name="alertDisconnection"
          type="danger"
          :startOn="countdownDisconnection"
          :close="true"
        >
          will be disconnected for inactivity in a few seconds
        </PushMsg>
      </div>
      <store-pokemon
        @changeScreen="
          (evt) => {
            changeScreen(evt);
          }
        "
        v-if="screen == 'store'"
        :forPage="20"
      />

      <div
        v-show="screen == 'maps' && store.state.ROOM && store.state.DATA_USER"
        class="maps"
      >
        <map-grid
          v-if="typeof mapSelected == 'number' && map[mapSelected]"
          :map="map[mapSelected]"
          id="OnMap"
          @mapLoaded="
            () => {
              mapLoaded = true;
            }
          "
        >
        </map-grid>
      </div>

      <button
        v-if="store.state.DATA_USER"
        class="menu-button"
        @click="menu = !menu"
      >
        <MenuLeft v-show="menu" />
        <MenuRight v-show="!menu" />
      </button>

      <footer class="status-bar" v-if="store.state.ROOM?.title">
        <span
          class="rom-status"
          @click="
            () => {
              alertiw.open('romSelection');
            }
          "
        >
          {{ store.state.ROOM?.title }}
        </span>
        <span class="time" v-if="clock">
          {{ clock.format("HH:mm:ss") }}
        </span>
      </footer>
    </div>
  </section>
</template>
<script>
import wallpaper from "@/assets/wallpaper-store.jpg";
import userCard from "@/components/user-card";
import storePokemon from "@/components/store-pokemon";
import chatOnline from "@/components/chat-online";
import StoragePokemon from "@/components/team-pokemon";
import teamPokemon from "@/components/storage-pokemon";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import store from "@/store/index.js";
import { MenuLeft, MenuRight, AccountGroup } from "mdue";
import medalIcon from "@/assets/medals/default.png";
import configRoms from "@/config/roms.json";
import mapGrid from "@/components/map-grid";
import map from "@/config/maps/maps.json";
import generalconfig from "@/config/general.json";
import toStart from "@/config/toStart.json";
import { pushmsg } from "@/components/globals/scripts/PushMsg";

export default {
  data() {
    return {
      toStart,
      pushmsg,
      socket: store.state.socket,
      wallpaper,
      medalIcon,
      screen: "maps",
      menu: true,
      tab: 1,
      store,
      alertiw,
      closeIconInSelectRomAlert: false,
      roms: configRoms,
      generalconfig,
      map,
      startClock: false,
      countdownDisconnection: 0,
      userLoad: false,
      intervalLoadMap: null,
      mapLoaded: false,
    };
  },
  computed: {
    status() {
      let val = this.store.state.status;
      return val;
    },
    chronometer() {
      return this.store.state.chronometer;
    },
    clock() {
      return this.store.state.clock;
    },
    mapSelected() {
      return this.store.state.mapSelected;
    },
    TAB() {
      return this.tab;
    },
    ID_USER() {
      return this.store.state.ID_USER;
    },
  },
  watch: {
    mapSelected(val) {
      let loadScreen = document.querySelector(".loadScreen");
      if (loadScreen) {
        loadScreen.style.display = "flex";
        this.mapLoaded = false;

        this.intervalLoadMap = setInterval(() => {
          if (this.mapLoaded) {
            loadScreen.style.display = "none";
            clearInterval(this.intervalLoadMap);
          }
        }, 2000);
      }
    },
    status(val) {
      if (val == "online") {
        this.countdownDisconnection = 0;
      }
      this.store.state.socket.emit("update:sprite", {
        status: val,
        socket: this.store.state.socket.id,
      });
    },
    menu() {
      let game = document.getElementById("game");
      let side = document.querySelector(".side");

      if (this.menu) {
        cssApply(
          side,
          {
            transform: "translateX(0%)",
          },
          400,
          () => {
            game.style.gridTemplateColumns = "290px 1fr";
            side.style.borderRight = "0px white solid";
          }
        );
      } else {
        side.style.transform = "translateX(-100%)";
        side.style.borderRight = "5px white solid";
        game.style.gridTemplateColumns = "0px 1fr";
      }
    },
    clock(clock) {
      if (clock) {
        if (!this.startClock) {
          this.startClock = true;
        }

        this.checkChronomether("inactivity", clock, () => {
          this.store.commit("setStatus", "offline");
        });

        this.checkChronomether("disconnection", clock, () => {
          this.store.dispatch("logout");
        });

        this.countdownDisconnection = this.checkChronomether(
          "disconnection",
          clock,
          (diff) => {
            this.pushmsg.open("alertDisconnection");
          },
          20
        );
      }
    },
    startClock() {
      this.store.commit("setStatus", "online");
    },
  },
  methods: {
    animateFade(parentFade, value) {
      let exp_fadeup = document.querySelector(parentFade + " .fadeUp");
      exp_fadeup.fade(value);
    },
    sound(src) {
      let sound = require("@/assets/sounds/" + src);
      new Audio(sound).play();
    },
    addCoin(val) {
      this.store.dispatch("addCoins", val);
      this.animateFade(".coins", val);
      this.sound("moneda.mp3");
    },
    addTrainerExp(trainerExp) {
      this.store.dispatch("addTrainerExp", trainerExp);
      this.animateFade(".level-view", trainerExp);
    },
    deleteRedwards() {
      this.store.state.DATA_USER.data.redwards = null;
      this.store.dispatch("updateDataUser", {
        "data.redwards": null,
      });
    },
    recivedRedwards() {
      let redwards = this.store.state.DATA_USER.data.redwards;

      if (redwards) {
        if (redwards.trainerExp) {
          this.addTrainerExp(redwards.trainerExp);
        }
        if (redwards.coins) {
          this.addCoin(redwards.coins);
        }
      }
    },
    startLoadGame() {
      this.store.state.socket.connect();
      this.loadLastRoom();

      //verificar si existe sprite si no establecerlo
      let spriteDefault = this.toStart["default-user-sprite"];
      if (!store.state.DATA_USER.data) {
        store.state.DATA_USER.data = { sprite: spriteDefault };
      } else {
        if (!store.state.DATA_USER.data.sprite) {
          store.state.DATA_USER.data.sprite = spriteDefault;
        }
      }

      this.store.state.status = "online";
      this.selectionInitialMap();
      this.managerClock();
      this.userLoad = true;
      this.detectUserActivity();
      setTimeout(() => {
        this.recivedRedwards();
        this.deleteRedwards();
      }, 1000);
    },
    loadLastRoom() {
      let romLocal = localStorage.getItem("rom-" + this.store.state.ID_USER);

      if (romLocal) {
        store.commit(
          "setRom",
          configRoms[localStorage.getItem("rom-" + this.store.state.ID_USER)]
        );
      } else {
        this.alertiw.open("romSelection");
      }
    },
    detectUserActivity() {
      window.addEventListener("click", () => {
        this.store.commit("setStatus", "online");
        this.store.state.disable_sound_for_browser = false;
      });
      window.addEventListener("touchstart", () => {
        this.store.commit("setStatus", "online");
        this.store.state.disable_sound_for_browser = false;
      });
      window.addEventListener("keydown", () => {
        this.store.commit("setStatus", "online");
        this.store.state.disable_sound_for_browser = false;
      });
    },
    checkChronomether(name, clock, fn, secondsDiff = 0) {
      let chronometer = this.chronometer[name];

      if (chronometer) {
        let diff = chronometer.diff(clock, "seconds");

        if (diff <= secondsDiff) {
          fn(diff);
        } else {
          return 0;
        }

        return diff;
      }
    },
    managerClock() {
      this.socket.on("clock", (data) => {
        this.store.commit("setClock", data);
      });
    },
    selectionInitialMap() {
      if (this.store.state.DATA_USER?.data?.position?.map) {
        this.store.commit(
          "setMapSelected",
          this.store.state.DATA_USER.data.position.map
        );
        return this.store.state.DATA_USER.data?.position?.map;
      } else {
        this.store.commit("setMapSelected", generalconfig["default-map"]);
        return generalconfig["default-map"];
      }
    },
    calUserInRooms(rooms) {
      for (let i in this.roms) {
        this.roms[i].usersConnected = rooms.filter((obj) => {
          return obj.room.title == this.roms[i].title;
        }).length;
      }
    },
    selectRom(rom, key) {
      //verificar el ruta actual en el router
      this.store.commit("setRom", rom);
      this.alertiw.close("romSelection");
      localStorage.setItem("rom-" + store.state.ID_USER, key);
    },
    changeScreen(screen) {
      this.screen = screen;
    },
  },
  components: {
    mapGrid,
    teamPokemon,
    storePokemon,
    MenuRight,
    MenuLeft,
    StoragePokemon,
    chatOnline,
    userCard,
    AccountGroup,
  },
  mounted() {
    store.state.background_sound = "off"; /*require("@/assets/sounds/" +
      this.generalconfig["sound-background"]);*/
    store.state.disable_sound_for_browser = true;
    let soundiconcontrol = document.querySelector(".sound-icon-control");
    soundiconcontrol.style.display = "none";
    if (this.store.state.ID_USER) {
      this.startLoadGame();
    } else {
      store.dispatch("getUserID").then((id) => {
        store.dispatch("getDataUser").then(() => {
          console.log(
            "se cargaron los datos de: " + store.state.DATA_USER.username
          );
          this.startLoadGame();
        });
      });
    }
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
* {
  user-select: none;
}

.loadScreen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  z-index: 100;
  display: none;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  div {
    @include flex(center, wrap);
    width: 100%;
  }

  span {
    width: 100%;
    color: white;
    font-family: "nunito-bold";
    font-size: 11px;
    height: 15px;
    padding: 5px 0;
    text-align: center;
  }
}
.status-bar {
  position: absolute;
  width: auto;

  color: rgb(4, 4, 4);
  bottom: 0;
  text-align: left;
  padding: 2px 10px;
  left: 0;
  font-size: 10px;
  margin: 0 10px;
  z-index: 9999;
  .rom-status:hover {
    cursor: pointer;
    color: rgb(4, 4, 4);
    text-decoration: underline;
  }
  span {
    padding: 2px 3px;
    margin: 0 5px;
    background: rgba(250, 250, 250, 0.453);
  }
}
.select-rom {
  width: 400px;
  height: 250px;
  @include flex(center, wrap);
  h3 {
    width: 100%;
    text-align: center;
    @include flex(center);
  }
  ul {
    list-style: none;
    padding: 25px;
    @include flex(flex-start, wrap);
    li {
      width: 100%;
      margin: 5px;
      @include flex(space-between, wrap);
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
    .users-rom {
      @include flex(center, wrap);
      .users-online {
        margin-left: 10px;
        font-size: 12px;
      }
    }
  }
  span {
    @include flex(flex-start);
    img {
      margin-right: 5px;
    }

    .users-online {
      font-size: 11px;
    }
  }
}
#principal {
  background: rgb(209, 209, 209) !important;
}
.newMedals-container {
  position: absolute;
  bottom: 10%;
  pointer-events: none;
  width: 100%;
  z-index: 100;
  .msg img {
    width: 60px !important;
    height: 65px !important;
  }
  @include flex(center);
  #newMedals {
    padding: 4px;
    font-size: 13px;
    font-family: "nunito-bold";
    pointer-events: all;
    width: auto;
    border-radius: 10px;
    @include phones {
      font-size: 12px;
    }
  }
}

#game {
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  position: relative;
  display: grid;
  grid-template-columns: 290px 1fr;
  grid-template-rows: 100vh;
  .side {
    background: #f1f1f1;
    box-shadow: 1px -1px 20px -5px rgba(0, 0, 0, 0.75);
    @include scrollbar("y", #999999, rgba(80, 80, 80, 0.801), #888888);
    z-index: 24;
    transition: transform 0.4s ease-in-out;
    width: 290px;
  }
  .maps {
    color: white;
    @include flex(center);
    @include scrollbar("xy", #999999, rgba(80, 80, 80, 0.801), #888888);
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: relative;
    background: rgba(0, 0, 0, 0.733);
  }
  .screenGame {
    position: relative; // si se cambia se perdera el boton del sidemenu
    .container-pushmsg {
      @include flex(center);
      top: 20px;
      position: absolute;
      width: 100%;
      padding: 10px 0;
      pointer-events: none;
      z-index: 100;
    }
    .menu-button {
      border: none;
      background: rgb(209, 209, 209);
      border-radius: 50%;
      @include flex(center);
      outline: none;
      font-size: 27px;
      height: 20px;
      width: 20px;
      position: absolute;
      bottom: 45%;
      left: 10px;
      cursor: pointer;
      z-index: 21;
      transition: all 1s ease-in-out;
    }
  }
}
</style>
