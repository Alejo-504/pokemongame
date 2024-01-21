<template>
  <div class="store-pokemon">
    <audio
      class="sound-buy"
      :src="buySound"
      controls="none"
      preload="auto"
      style="display: none"
    ></audio>
    <audio
      class="sound-invalid"
      :src="invalidSound"
      controls="none"
      preload="auto"
      style="display: none"
    ></audio>
    <ShowLoader
      :size="70"
      :border="26"
      style="margin: 20%"
      color_load="#e74c3c"
      color_bar="#ecf0f1"
      v-show="!store?.[pageOn]?.[0]?.features"
    />
    <div class="search-pokemon-store">
      <button
        class="exit-store"
        @click="
          () => {
            changeScreen('maps');
          }
        "
      >
        <span class="exit-text">Back</span> <ExitToApp />
      </button>
      <div class="search-pokemon">
        <Magnify /><input
          v-model="searchStore"
          type="text"
          @keyup="startSearch"
          placeholder="Search..."
        />
      </div>
    </div>
    <div
      class="container-store-pokemon"
      v-show="store?.[pageOn]?.[0]?.features"
    >
      <div
        class="card-pokemon"
        v-for="(pokemon, key) in store[pageOn]"
        v-bind:key="pokemon"
      >
        <div class="card">
          <span class="idpokedex">#{{ store[pageOn][key]?.features?.id }}</span>
          <div class="notAvalible" v-if="!validateStatus(pokemon, trainerLv)">
            <Lock /><span class="required-detail"
              >Trainer Level {{ pokemon.required.trainerLv }} is required</span
            >
          </div>

          <GetPokemon
            :call="pokemon.name"
            :level="pokemon.level ? pokemon.level : 5"
            staticPokemon
            :stats="stats"
            @loaded="
              (evt) => {
                setFeatures(evt, key);
              }
            "
          />
          <div
            :class="
              stats != 'base' ? 'info-pokemon battle' : 'info-pokemon base'
            "
          >
            <section class="header">
              <div class="pos-left">
                <div class="line-title">
                  <h3 class="name">
                    {{ store[pageOn][key]?.features?.name }}
                  </h3>
                </div>
                <ul class="types">
                  <li
                    v-for="type in store[pageOn][key]?.features?.types"
                    v-bind:key="type"
                  >
                    <img
                      draggable="false"
                      :src="
                        require('@/assets/type/' +
                          type.charAt(0).toUpperCase() +
                          type.substring(1, type.length) +
                          '.gif')
                      "
                      alt=""
                    />
                  </li>
                </ul>
              </div>
              <div class="pos-right">
                <div class="level">
                  <div class="lv">Lv</div>
                  {{ store[pageOn][key]?.features?.level }}
                </div>
              </div>
            </section>
            <section
              class="buy-pokemon"
              :style="
                buyProccesing
                  ? 'pointer-events:none; filter:grayscale(100%);'
                  : ''
              "
            >
              <span>
                <Icons name="coins.png" /> {{ store[pageOn][key]?.price }}
              </span>
              <button
                @click="
                  () => {
                    validateStatus(pokemon, trainerLv) && !buyProccesing
                      ? buyPokemon(pageOn, key)
                      : null;
                  }
                "
              >
                <Icons name="add.png" :size="null" />
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button
        class="prevpage"
        :style="
          !pageOn - 1 < 0
            ? 'opacity:1; pointer-events:all;'
            : 'opacity:0.6; pointer-events:none;'
        "
        @click="load(pageOn - 1)"
      >
        <ArrowLeftBold /> Prev
      </button>
      <ul>
        <li @click="load(pageOn - 2)" v-show="!(pageOn - 2 < 0)">
          {{ pageOn - 2 }}
        </li>
        <li @click="load(pageOn - 1)" v-show="!(pageOn - 1 < 0)">
          {{ pageOn - 1 }}
        </li>
        <li class="select-page">
          {{ pageOn }}
        </li>
        <li @click="load(pageOn + 1)" v-show="pageOn + 1 < store.length - 1">
          {{ pageOn + 1 }}
        </li>
        <li @click="load(pageOn + 2)" v-show="pageOn + 2 < store.length - 1">
          {{ pageOn + 2 }}
        </li>
      </ul>
      <button
        class="nextpage"
        :style="
          !(pageOn + 1 < store.length - 1)
            ? 'opacity:0.6; pointer-events:none;'
            : 'opacity:1; pointer-events:all;'
        "
        @click="load(pageOn + 1)"
      >
        Next <ArrowRightBold />
      </button>
    </div>
    <AlertIw
      name="storageFull"
      title="Failed purchase"
      :cssAlert="{
        color: '#000000',
        boxShadow: '0px 0px 58px 0px #2c3e50',
      }"
      :cssTitle="{ background: '#f39c12', borderRadius: '5px 5px 0 0' }"
    >
      <div class="storageFull-content">
        <Icons name="warning4.png" size="100px" />
        <h2 class="title-alert">¡Storage Full!</h2>
        <p>Please remove Pokemon or acquire more space to make the purchase</p>
      </div>
    </AlertIw>
  </div>
</template>
<script>
import storePokemon from "@/config/store.json";
import toStart from "@/config/toStart.json";
import pokedex from "@/config/pokemon_data/pokedex.json";
import storeVuex from "@/store/index";
import { ExitToApp, ArrowLeftBold, ArrowRightBold, Lock } from "mdue";
import buySound from "@/assets/sounds/buy-sound.mp3";
import invalidSound from "@/assets/sounds/invalid.mp3";
import { Magnify } from "mdue";
import { alertiw } from "@/components/globals/scripts/AlertIw";

export default {
  props: {
    forPage: {
      type: Number,
      default: 28,
    },
    stats: {
      type: String,
      default: "base",
    },
  },
  data() {
    return {
  
      invalidSound,
      searchStore: "",
      buySound,
      numberPage: 0,
      paginationPokemon: [],
      trainerLv: storeVuex.state.DATA_USER.trainerLv,
      timeout: null,
      storeVuex,
      buyProccesing: false,
      toStart,
    };
  },
  components: {
    ExitToApp,
    ArrowLeftBold,
    ArrowRightBold,
    Magnify,
    Lock,
  },
  methods: {
    changeScreen(screen) {
      this.$emit("changeScreen", screen);
    },
    getPagination(storePokemon, forPage = this.forPage) {
      let paginationPokemon = [];

      for (let a = 0; a < storePokemon.length; a += forPage) {
        let pag = [];

        for (let i = 0; i < forPage; i++) {
          if (storePokemon[i + a]) {
            pag.push(storePokemon[i + a]);
          }
        }
        paginationPokemon.push(pag);
      }
      return paginationPokemon;
    },
    setNewStore(search, storePokemon) {
      let newStore = [];
      if (search == "") {
        return storePokemon;
      } else {
        let count = 0;
        for (let pokemon of storePokemon) {
          if (pokemon.name.toLowerCase().includes(search.toLowerCase())) {
            newStore.push(pokemon);
          } else if (
            pokedex[count].type.includes(
              search.charAt(0).toUpperCase() + search.slice(1)
            )
          ) {
            search.charAt(0).toUpperCase() + search.slice(1);
            newStore.push(pokemon);
          }
          count++;
        }
        return newStore;
      }
    },
    setFeatures(evt, key) {
      this.paginationPokemon[this.pageOn][key].features = evt.features;
    },
    buyPokemon(page, key) {
      let price = this.store[page][key].price;
      if (this.coins < price) {
        let sound = document.querySelector(".sound-invalid");
        sound.play();
      } else if (
        this.toStart["storage-pokemon-space"] <=
        storeVuex.state.DATA_USER.storagePokemon.length
      ) {
        alertiw.open("storageFull", function () {
          let sound = document.querySelector(".sound-invalid");
          sound.play();
        });
      } else {
        this.buyProccesing = true;
        let pokemon = this.store[page][key].features;
        storeVuex.state.DATA_USER.storagePokemon.push(pokemon);

        let cobrado = 0;
        let postCoins = storeVuex.state.DATA_USER.trainer.coins - price;
        let interval = setInterval(() => {
          if (cobrado != price) {
            storeVuex.state.DATA_USER.trainer.coins -= 1;
            cobrado++;
          } else {
            this.buyProccesing = false;
            clearInterval(interval);
          }
        }, 1);

        let sound = document.querySelector(".sound-buy");
        let coins = document.querySelector(".info-user .coins > span");

        coins.fade("-" + price);
        sound.play();

        storeVuex.dispatch("updateDataUser", {
          "trainer.coins": postCoins,
        });
      }
    },
    async load(page) {
      let a = await this.store;
      a = await a[page];
      a = await a[this.forPage - 1];
      if (a) {
        this.numberPage = page;
      }
    },
    validateStatus(pokemon, trainerLv) {
      let required = pokemon.required;
      let nr_validations = (() => {
        let count = 0;
        for (var prop in required) {
          if (required.hasOwnProperty(prop)) count++;
        }
        return count;
      })();
      let validations_done = 0;
      if (required.trainerLv) {
        if (trainerLv >= required.trainerLv) {
          validations_done++;
        }
      }
      if (nr_validations > validations_done) {
        return false;
      } else {
        return true;
      }
    },
    startSearch(evt) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        let newStore = this.setNewStore(this.searchStore, storePokemon);
        this.paginationPokemon = this.getPagination(newStore);
        let input = document.querySelector(".search-pokemon input");
        this.numberPage = 0;
        input.focus();
      }, 1500);
    },
  },
  computed: {
    coins() {
      return this.storeVuex.state.DATA_USER?.trainer.coins;
    },
    store() {
      return this.paginationPokemon;
    },
    pageOn() {
      return this.numberPage;
    },
  },
  mounted() {
    let newStore = this.setNewStore(this.searchStore, storePokemon);
    this.paginationPokemon = this.getPagination(newStore);
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

//GET POKEMON STYLES

.backform {
  z-index: -1;
  margin: 2%;
  height: 100px;
  border-radius: 0 100% 0 10px;
  width: 110px;
  position: absolute;
  bottom: -5px;
  left: -5px;
  border-right: #ffffff solid 3px;
  border-top: solid 3px white;
}
.pokemon img {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  pointer-events: none;
}
.info-pokemon {
  position: relative;
  width: 250px;
  height: 180px;
  z-index: 999;
  box-shadow: 0px 2px 20px -6px rgba(0, 0, 0, 0.616);
  background: #34495e;
  border-radius: 10px;
  padding: 10px;
  color: rgb(255, 255, 255);
  .progressbar .values-right {
    width: 30px !important;
    @include flex(center);
    position: relative;
    .iv-header {
      position: absolute;
      top: -11px;
      font-size: 8px;
      right: -6px;
      font-weight: 900;
    }
    .value-iv {
      background: rgb(228, 228, 228);
      width: 12px;
      height: 16px;
      height: auto;
      @include flex(center);
      position: absolute;
      right: -10px;
      font-size: 8px;
      text-align: center;
      border-radius: 50%;
      padding: 1px;
      color: rgb(31, 144, 250);
    }
  }
  .nature-name {
    margin-left: 10px;
  }
  .line-title {
    @include flex(flex-start);
  }
  .header {
    height: 40px;
    @include flex(space-between);
    .pos-left {
      width: 50%;
    }
    .pos-left .name {
      font-size: 18px;
      font-family: "nunito-bold";
    }
    .pos-right {
      height: 100%;
      margin-top: 10px;
      margin-right: 5px;
      width: 30px;
      .level {
        width: 30px;
        height: 65%;
        border-radius: 0px 200px 200px 200px;
        border: 1px inset #000000;
        @include flex(center);
        font-size: 17px;
        font-family: "Roboto-Black";
        position: relative;
        background: #34495e;
        color: white;

        .lv {
          position: absolute;
          top: -5px;
          left: -16px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 11px;
          @include flex(center);
        }
      }
    }
  }

  .body {
    @include flex(space-around);
    width: 100%;
    height: 80%;

    .stats {
      width: 90%;
      height: 70%;
      padding: 13px 0;
      background: rgba(250, 250, 250, 1);
      box-shadow: 0px 2px 10px -6px rgb(0, 0, 0);
      border-radius: 8px;
      @include flex(center, wrap);
      position: relative;
      .statTitle {
        font-size: 10px;
        font-family: "nunito-bold";
        position: absolute;
        top: -15px;
        color: rgb(255, 255, 255);
      }
      .progressbar {
        width: 60%;
        box-shadow: 0px 0px 5px -6px rgb(0, 0, 0);
        height: 10px;
        margin-left: -10px;
      }
    }
  }
  .types {
    height: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-left: -3px;
    list-style: none;
    li {
      width: auto;
      height: 16px;
      &:hover {
        background: transparent;
      }
      img {
        width: 45px;
        height: 15px;
      }
    }
  }
}
.pokemon-information-tooltip {
  z-index: 10000000000;
}
//GET POKEMON STYLES

.idpokedex {
  font-size: "nunito-bold";
  font-size: 16px;
  position: absolute;
  top: 5px;
  left: 5px;
  font-weight: 900;
  font-style: italic;
}
.storageFull-content {
  padding: 10px 17px;
  width: 215px;
  @include flex(center, wrap);
  .title-alert {
    margin-bottom: 19px;
    @include flex(center);
  }
  > p {
    text-align: justify;
  }
}
.preloader {
  order: 1;
}
.search-pokemon-store {
  width: 90%;
  padding: 7px;
  @include flex(space-between);
  border-radius: 20px;
  padding: 35px 10px 10px 10px;
  order: 0;
  .exit-store {
    color: white;
    padding: 4px;
    padding-right: 15px;
    font-size: 30px;
    outline: none;
    cursor: pointer;
    border: none;
    margin-right: 30px;
    background: none;
    @include flex(center);
    @include phones() {
      @include flex(flex-start);
    }
    .exit-text {
      font-size: 18px;
      font-family: "nunito-bold";
      margin-right: 10px;
      @include tablets() {
        display: none;
      }
    }
  }
  > div {
    width: auto;
    @include flex(flex-end);
    @include phones() {
      @include flex(flex-start);
    }
  }
  svg {
    color: white;
    font-size: 30px;
  }
  input {
    width: 100%;
    min-width: 100px;
    padding: 10px;
    border-radius: 20px;
    border: none;
    flex-shrink: 10;
    outline: none;
  }
  @include tablets() {
    @include flex(center);
    .exit-store {
      order: 2;
      margin-right: 0;
    }
  }
  @include phones() {
    @include flex(center);
  }
}
.pagination {
  width: 50%;
  padding: 5px;
  border-radius: 20px;
  @include flex(space-around);
  font-family: "Roboto-Black";
  background: rgba(77, 77, 77, 0.719);
  margin: 20px;
  button {
    font-family: "Roboto-Black";
    padding: 5px;
    border-radius: 10px;
    border: none;
    @include flex(center);
    outline: none;
    cursor: pointer;
    background: rgb(0, 0, 0);
    color: white;
    svg {
      font-size: 25px;
    }
  }
  ul {
    list-style: none;
    display: flex;
    justify-content: space-around;
  }
  li {
    margin: 0 5px;
    @include flex(center);
    padding: 5px;
    cursor: pointer;
    color: #949494;
    transition: color 0.2s ease-in-out;
    &:hover {
      color: rgb(231, 231, 231);
    }
  }
  .select-page {
    background: rgb(211, 44, 44);
    border-radius: 50%;
    border: solid 3px rgb(255, 255, 255);
    font-size: 18px;
    font-weight: 900;
    color: rgb(255, 255, 255);
    width: 20px;
    height: 20px;
    &:hover {
      color: rgb(255, 255, 255);
    }
  }
}
.container-store-pokemon {
  width: 100%;
  height: auto;
  padding: 25px 10px 10px 10px;
  @include tablets() {
    padding: 20px 10px 10px 10px;
  }
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  animation: slide-in-left 0.5s ease-in-out;

  @keyframes slide-in-left {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .card-pokemon {
    background: rgb(240, 240, 240);
    min-width: 200px;
    width: 150px;
    height: 200px;
    margin: 15px;
    position: relative;
    border-radius: 10px;
    padding-top: 3px;

    @include flex(center, wrap);
    .card {
      @include flex(center, wrap);
    }
    .pokemon-style {
      width: 100px;
      height: 100px;
      @include flex(center);
      cursor: pointer;
    }
    .notAvalible {
      .required-detail {
        color: rgb(255, 255, 255);
        padding: 3px;
        font-size: 14px;
        width: 90%;
        text-align: center;
        border-radius: 3px;
        font-family: "nunito-bold";
        background: rgba(92, 92, 92, 0.493);
      }

      position: absolute;
      width: 100%;
      height: calc(100% + 13px);
      top: 0;
      left: 0;
      @include flex(center, wrap, column);
      background: rgba(34, 34, 34, 0.781);
      z-index: 23;
      border-radius: 10px;
      font-size: 45px;
      color: white;
    }
  }
}
.store-pokemon {
  width: 100%;
  height: 100%;
  position: relative;
  @include scrollbar("y", #000000, rgba(228, 48, 48, 0.801), #888888);
  overflow-x: auto;
  @include flex(center, wrap);
  scroll-behavior: auto;
  min-width: 250px;
  background: #00000083;
  .info-pokemon {
    width: 180px;
    height: auto;
    border-radius: 0 0 8px 8px;
    z-index: 21;
  }
  .buy-pokemon {
    @include flex(space-between);
    margin-top: 8px;
    color: rgb(238, 208, 39);
    font-family: "bangers";
    border-top: 0.5px solid #476481;
    padding-top: 5px;

    span {
      img {
        margin-right: 10px;
      }
      @include flex(flex-start);
    }
    button {
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      transition: all 0.25s ease-in-out;

      &:active {
        img {
          transform: scale(1.1);
        }
      }
      img {
        width: 40px;
        height: 35px;
      }
    }
  }
}
</style>
