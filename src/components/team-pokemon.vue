<template>
  <div
    class="container-teams"
    v-if="store.state?.DATA_USER?.storagePokemon?.length > 0"
  >
    <div
      v-for="(team, key) in teams"
      v-bind:key="team"
      :id="'team-' + key"
      :class="key == 0 ? 'team select-team' : 'team'"
    >
      <header>
        {{ team.name }}
        <Numeric_1Circle v-if="key == 0" />
        <Numeric_2Circle v-if="key == 1" />
        <Numeric_3Circle v-if="key == 2" />
        <Numeric_4Circle v-if="key == 3" />
        <Numeric_5Circle v-if="key == 4" />
      </header>

      <ul v-if="key == 0 && teamOn">
        <h3 v-if="teamOn.length == 0">¡Empty team!</h3>
        <li
          v-for="myTeam in teamOn"
          v-bind:key="myTeam"
          :id="'teamPokemon-' + myTeam.token"
        >
          <GetPokemon
            :call="myTeam.id"
            :level="myTeam.level"
            :stats="myTeam"
            :await="0"
            :trigger="[['click', 'click:out']]"
          />

          <ToolTip
            class="contextmenu-pokemon"
            theme="black"
            :trigger="[['contextmenu', 'click:out', true]]"
            :on="'#teamPokemon-' + myTeam.token"
            :await="0"
            :beforeShow="closeAllInfoPokemon"
            :css="{
              background: '#34495e',
            }"
          >
            <ul
              :id="'contextualMenuTeam-' + myTeam.token"
              class="contextualMenu"
            >
              <li @click="controlTeam(myTeam.token, false)">
                <MinusCircleOutline />Remove from team
              </li>

              <li
                @click="
                  alertiw.open('questionReleasePokemonTeam' + myTeam.token)
                "
              >
                <AlertIw
                  :name="'questionReleasePokemonTeam' + myTeam.token"
                  title="Release pokemon"
                  :icon="warning"
                  :cssIconTitle="{
                    width: '15px',
                    height: '15px',
                  }"
                >
                  <div class="release-pokemon-alert">
                    <GetPokemon
                      :call="myTeam.id"
                      :level="myTeam.level"
                      :stats="myTeam"
                      :await="0"
                      :trigger="[['click', 'click:out']]"
                    />
                    <h3>You want to release {{ myTeam.name }}?</h3>

                    <button
                      @click="releasePokemon(myTeam.token)"
                      class="danger-button"
                    >
                      Aceptar
                    </button>
                  </div>
                </AlertIw>

                <CloseCircleOutline />Release pokemon
              </li>
            </ul>
          </ToolTip>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import store from "@/store";
import configTeams from "@/config/toStart.json";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import warning from "@/assets/warning.png";
const $ = require("jquery");

import {
  Numeric_1Circle,
  Numeric_2Circle,
  Numeric_3Circle,
  Numeric_4Circle,
  Numeric_5Circle,
  CloseCircleOutline,
  MinusCircleOutline,
} from "mdue";
export default {
  data() {
    return {
      warning,
      storagePokemon: null,
      alertiw,
      store,
      teams: configTeams["teams"],
      indexBindTeam: [],
    };
  },
  components: {
    Numeric_1Circle,
    Numeric_2Circle,
    Numeric_3Circle,
    Numeric_4Circle,
    Numeric_5Circle,
    CloseCircleOutline,
    MinusCircleOutline,
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
    teamOn() {
      let team = [];
      let storage = store.state.DATA_USER.storagePokemon;

      for (let i in storage) {
        if (storage[i].team) {
          let pokemon = storage[i];
          team.push(pokemon);
        }
      }
      return team;
    },
  },
  methods: {
    searchIndexForToken(token, storage) {
      let found = storage.findIndex((pokemon) => {
        return pokemon.token == token;
      });
      return found;
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
    controlTeam(token, control) {
      let keyPokemon = this.searchIndexForToken(token, this.storagePokemon);

      let pokemon = $("#teamPokemon-" + token);
      pokemon.animate(
        {
          opacity: 0,
        },
        {
          complete: () => {
            pokemon.remove();
            this.storagePokemon[keyPokemon].team = control;
            store.dispatch("updateDataUser", {
              storagePokemon: this.storagePokemon,
            });
          },
        }
      );
    },
    releasePokemon(token) {
      let pokemon = $("#teamPokemon-" + token);
      let keyPokemon = this.searchIndexForToken(token, this.storagePokemon);
      this.alertiw.close("questionReleasePokemonTeam" + token, () => {
        pokemon.animate(
          {
            opacity: 0,
          },
          {
            complete: () => {
              pokemon.remove();
              this.storagePokemon.splice(keyPokemon, 1);
              store.dispatch("updateDataUser", {
                storagePokemon: this.storagePokemon,
              });
              $("#alertiw-questionReleasePokemonTeam" + token).remove();
            },
          }
        );
      });
    },
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
$team-1: linear-gradient(
  90deg,
  rgba(69, 221, 137, 1) 0%,
  rgba(69, 221, 137, 1) 45%,
  rgba(57, 214, 170, 1) 75%,
  rgba(59, 215, 179, 1) 83%,
  rgba(69, 221, 214, 1) 100%
);

.container-teams {
  @include flex(flex-start, nowrap, column, flex-start);
  @include scrollbar("y", #ffffff, rgb(214, 67, 48), #ffffff);
  background: rgb(240, 240, 240);
  height: 80%;
}
.team {
  width: 100%;
  height: 210px;

  &:hover {
    background: rgb(235, 233, 233);
  }

  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  > ul {
    @include flex(center, wrap);
    list-style: none;
    h3 {
      margin-top: 30px;
    }
    > li {
      width: 75px;
      height: 75px;
      margin-bottom: 5px;
      margin-left: 8px;
      @include flex(flex-start, wrap, row, flex-end);
      user-select: none;
      img {
        user-select: none;
        pointer-events: none;
      }
    }
  }

  header {
    background: #929394;
    color: white;
    font-family: "Roboto-Black";
    font-size: 12px;
    padding: 5px 10px;

    @include flex(space-between);
    svg {
      font-size: 18px;
    }
  }

  //mostrar con una animacion de desplazamiento hacia la izquierda
  animation: slide-in-left 0.5s ease-in-out;

  @keyframes slide-in-left {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
}
.select-team {
  header {
    background: $team-1;
    animation: slide-in-left 0.6s ease-in-out;
  }
  position: relative;
}
.team:last-child {
  margin-bottom: 40px;
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
.contextualMenu {
  @include flex(center, wrap, column);

  li {
    padding: 3px;
    @include flex(flex-start, wrap, row, center);
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
@keyframes temblor {
  0% {
    transform: rotate(0deg);
  }

  70% {
    transform: rotate(0deg);
  }
  72% {
    transform: rotate(6deg);
  }
  74% {
    transform: rotate(0deg);
  }
  76% {
    transform: rotate(5deg);
  }
  78% {
    transform: rotate(1deg);
  }
  80% {
    transform: rotate(-3deg);
  }
  82% {
    transform: rotate(0deg);
  }
}
</style>
