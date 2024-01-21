<template>
  <div
    class="storagePokemon"
    v-if="store.state?.DATA_USER?.storagePokemon?.length > 0"
  >
    <div class="search-pokemon" v-if="search">
      <div><Magnify /></div>
      <input
        @keyup="searchPokemonInStorage"
        type="text"
        placeholder="Search pokemon..."
        v-model="searchPokemon"
      />
    </div>
    <div class="container-pokemon">
      <div
        v-for="(pokemon, index) in storagePokemon"
        v-bind:key="pokemon"
        :id="'pokemon-' + uuid + '-' + index"
      >
        <div class="pokemon-alm" v-if="group == 'all'">
          <span class="name">{{ pokemon.name }}</span>
          <GetPokemon
            :stats="pokemon"
            :call="pokemon.id"
            :level="pokemon.level"
            :infoAwait="0"
            :token="pokemon.token"
            @loaded="
              (data) => {
                this.savePokemon(data.features, index);
              }
            "
          />
          <div class="team-tag" v-if="pokemon.team == true">
            <img :src="tagTeam" />
          </div>
          <ToolTip
            class="contextmenu-pokemon"
            theme="black"
            :trigger="[['contextmenu', 'click:out', true]]"
            :on="'#pokemon-' + uuid + '-' + index"
            :await="0"
            :beforeShow="closeAllInfoPokemon"
            :css="{
              background: '#34495e',
            }"
          >
            <ul
              :id="'contextualMenu-' + uuid + '-' + index"
              class="contextualMenu"
            >
              <li
                @click="controlTeam(index, true)"
                v-if="
                  group != 'team' && pokemon.team != true && countPokemon() < 6
                "
              >
                <Plus />Add to team
              </li>
              <li
                @click="controlTeam(index, false)"
                v-if="pokemon.team == true"
              >
                <Minus />Remove from team
              </li>

              <li
                v-if="storagePokemon.length > 1"
                @click="alertiw.open('questionReleasePokemon' + index)"
              >
                <AlertIw
                  :name="'questionReleasePokemon' + index"
                  title="Release pokemon"
                  :icon="warning"
                  :cssIconTitle="{
                    width: '15px',
                    height: '15px',
                  }"
                >
                  <div class="release-pokemon-alert">
                    <img
                      draggable="false"
                      :src="require('@/assets/pokegif/' + pokemon.id + '.webp')"
                      alt="pokemon"
                    />
                    <h3>You want to release {{ pokemon.name }}?</h3>

                    <button
                      @click="releasePokemon(index)"
                      class="danger-button"
                    >
                      Aceptar
                    </button>
                  </div>
                </AlertIw>

                <Close />Release pokemon
              </li>
            </ul>
          </ToolTip>
        </div>
      </div>
      <div class="empty-team" v-if="emptyTeam() == false && group == 'team'">
        The team is empty
      </div>
    </div>
    <div class="details-storage">
      <span class="description-storage">
        <Icons name="pokeball.svg" size="20px" style="filter: grayscale(60%)" />
        {{ store.state.DATA_USER.storagePokemon.length }} /
        {{ toStart["storage-pokemon-space"] }}
      </span>
    </div>
  </div>
</template>
<script>
import { alertiw } from "@/components/globals/scripts/AlertIw";
import warning from "@/assets/warning.png";
import tagTeam from "@/assets/pokeball.svg";
import {
  CloseCircleOutline,
  PlusCircleOutline,
  MinusCircleOutline,
  Magnify,
} from "mdue";
import store from "@/store/index";
import toStart from "@/config/toStart.json";
import pokedex from "@/config/pokemon_data/pokedex.json";
import { v4 as uuidv4 } from "uuid";
const $ = require("jquery");
var uuid = 0;
export default {
  props: {
    search: {
      type: Boolean,
      default: true,
    },
    group: {
      type: String,
      default: "all",
    },
  },
  data() {
    return {
      uuidv4,
      pokedex,
      sort: null,
      store,
      toStart,
      tagTeam,
      alertiw,
      searchPokemon: "",
      uuid,
      warning,
      storagePokemon: null,
    };
  },
  methods: {
    savePokemon(pokemon, index) {
      if (!pokemon.token) {
        pokemon.token = this.uuidv4();
        this.store.state.DATA_USER.storagePokemon[index] = pokemon;
        this.store.dispatch("updateDataUser", {
          storagePokemon: this.store.state.DATA_USER.storagePokemon,
        });
      }
    },
    countPokemon() {
      let count = 0;
      for (let i in this.storagePokemon) {
        if (this.storagePokemon[i].team == true) {
          count++;
        }
      }
      return count;
    },
    emptyTeam() {
      let empty = false;
      for (let i in this.storagePokemon) {
        if (this.storagePokemon[i].team == true) {
          empty = true;
          break;
        }
      }
      return empty;
    },
    controlTeam(index, control) {
      this.storagePokemon[index].team = control;

      store.dispatch("updateDataUser", {
        storagePokemon: this.storagePokemon,
      });
    },

    releasePokemon(index) {
      let pokemon = $("#pokemon-" + this.uuid + "-" + index);

      this.alertiw.close("questionReleasePokemon" + index, () => {
        pokemon.animate(
          {
            opacity: 0,
          },
          {
            complete: () => {
              pokemon.remove();
              this.storagePokemon.splice(index, 1);
              store.dispatch("updateDataUser", {
                storagePokemon: this.storagePokemon,
              });
              $("#alertiw-questionReleasePokemon" + index).remove();
            },
          }
        );
      });
    },
    searchPokemonInStorage() {
      let tempSearch = [];
      let search = this.searchPokemon;
      if (search != "" && search.replace(" ", "") != "") {
        for (let i in this.storagePokemon) {
          for (let key of Object.keys(this.storagePokemon[i])) {
            if (key != "team" || key != "key" || key != "base") {
              let stringConverted = JSON.stringify(this.storagePokemon[i][key]);
              stringConverted = stringConverted.toLowerCase();
              if (stringConverted.indexOf(search.toLowerCase()) != -1) {
                let notpush = false;
                for (let pokemonRegistred in tempSearch) {
                  if (
                    tempSearch[pokemonRegistred].key ==
                    this.storagePokemon[i].key
                  ) {
                    notpush = true;
                  }
                }
                if (notpush == false) {
                  tempSearch.push(this.storagePokemon[i]);
                }
              }
            }
          }
        }
        this.storagePokemon = tempSearch;
      } else {
        this.storagePokemon = store.state.DATA_USER.storagePokemon;
      }
    },
    closeAllInfoPokemon() {
      let contextMenus = document.querySelectorAll(".contextmenu-pokemon");
      let tooltipInformation = document.querySelectorAll(
        ".pokemon-information-tooltip"
      );
      contextMenus.forEach((el) => {
        el.style.display = "none";
      });
      tooltipInformation.forEach((el) => {
        el.style.display = "none";
      });
    },
    sortBy(directive = "asc", ...sort) {
      this.storagePokemon = this.storagePokemon.sort(function (a, b) {
        for (let i in sort) {
          a = a[sort[i]];
          b = b[sort[i]];
        }

        if (directive == "asc") {
          if (a > b) {
            return 1;
          }
          if (a < b) {
            return -1;
          }
        } else if (directive == "desc") {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
        }
        return 0;
      });

      return this.storagePokemon;
    },
  },
  components: {
    Magnify,
    Close: CloseCircleOutline,
    Plus: PlusCircleOutline,
    Minus: MinusCircleOutline,
  },
  watch: {
    storagePokemon2() {
      this.storagePokemon = store.state.DATA_USER?.storagePokemon
        ? store.state.DATA_USER?.storagePokemon
        : null;
    },
  },
  computed: {
    storagePokemon2() {
      return store.state.DATA_USER?.storagePokemon
        ? store.state.DATA_USER?.storagePokemon
        : null;
    },
  },
  created() {
    uuid++;
  },
  mounted() {
    this.storagePokemon = store.state.DATA_USER?.storagePokemon
      ? store.state.DATA_USER?.storagePokemon
      : null;
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.empty-team {
  @include flex(center);
  width: 100%;
  font-family: "nunito-bold";
  padding: 20px;
  color: #000000;
  font-size: 22px;
  font-style: italic;
}
.team-tag {
  border-radius: 50%;
  position: absolute;
  @include flex(center);
  left: -3px;
  bottom: -3px;
  img {
    width: 15px;
    height: 15px;
  }
}
.release-pokemon-alert {
  font-size: 20px;
  height: auto;
  width: 230px;
  @include flex(center, wrap);
  text-align: center;
  padding: 0px 10px;
  .danger-button {
    background: rgb(185, 21, 21);
    color: white;
    font-family: "Roboto-Black";
    border: none;
    padding: 5px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 100%;
    margin: 10px;

    border-radius: 2px;
    &:hover {
      transform: scale(1.05);
    }
    &:active {
      background: white;
      color: rgb(218, 20, 20);
    }
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.search-pokemon {
  animation: slide-in-left 0.5s ease-in-out;
  animation-fill-mode: forwards;

  height: 30px;
  background: #f8f8f8;
  @include flex(center);
  padding: 4px 4px;
  width: 100%;
  div {
    width: 30px;
    height: 30px;
    font-size: 20px;
    @include flex(center);
  }
  input {
    &:focus {
      border: solid rgb(158, 158, 158) 0.5px;
    }
    padding: 1px 15px;
    border: none;
    width: 80%;
    height: 70%;
    outline: none;
    border-radius: 20px;
    border: solid rgb(216, 216, 216) 0.5px;

    &::placeholder {
      font-style: italic;
      font-size: 11.5px;
    }
  }
}
.storagePokemon {
  height: 80%;
  width: 100%;
  margin-bottom: -8px;
  @include flex(center, wrap);

  .details-storage {
    height: 7%;
    font-size: 10px;

    @include flex(center);
    span {
      width: 55px;
      @include flex(space-between);

      margin-top: -8px;
    }
  }
  .container-pokemon {
    .name {
      font-size: 9px;
      font-family: "nunito-bold";
      width: 100%;
      text-align: center;
      background: #bababa;
      border-radius: 10px;
      bottom: 0;
      position: absolute;
      pointer-events: none;
      display: none;
    }
    @include scrollbar("y", #494949, rgb(214, 67, 48), #464646);
    background: #e9e9e9;
    padding: 0px 0px;
    width: 100%;
    height: 90%;
    display: grid;
    grid-template-columns: 70px 70px 70px;
    grid-gap: 15px;
    grid-auto-rows: 70px;
    justify-content: center;
    align-items: center;
    > div {
      position: relative;
    }

    .pokemon-alm {
      @include flex(center, wrap, row, flex-end);
      @include size(70px, 70px, 70px, 70px);
      padding: 0 5px;
      margin-left: 2px;
      cursor: pointer;
      user-select: none;
      position: relative;
      object-fit: cover;
      animation: slide-in-left 0.5s ease-in-out;

      img {
        user-select: none;
        pointer-events: none;
      }
    }
  }

  .contextualMenu {
    > li {
      padding: 3px;
      @include flex(flex-start, nowrap, row, center);
      width: 150px;
      margin-bottom: 0;
      &:hover {
        color: #ec3434;
      }
      svg {
        margin-right: 3px;
        font-size: 15px;
      }
      position: relative;
    }
    list-style: none;
  }
}
</style>
