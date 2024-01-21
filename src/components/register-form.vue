<template>
  <div id="login-container">
    <div class="circle-dec">
      <div class="inset1" />
    </div>
    <div class="msgSpace">
      <PushMsg
        :timeout="5000"
        name="msgFormRegister"
        type="danger"
        :onStart="true"
      >
        {{ error }}
      </PushMsg>
    </div>
    <form id="registerForm" @submit.prevent="register(user)" novalidate>
      <div class="tab1">
        <ul>
          <li class="input-alert" id="name">
            <input
              name="name"
              v-model="user.name"
              type="text"
              placeholder="Nombre"
            />
          </li>
          <li class="input-alert" id="lastname">
            <input
              name="lastname"
              v-model="user.lastname"
              type="text"
              placeholder="Apellido"
            />
          </li>
        </ul>
        <ul>
          <li class="input-alert" id="email">
            <input
              name="email"
              v-model="user.email"
              type="email"
              placeholder="Correo Electronico"
            />
          </li>

          <li class="input-alert" id="username">
            <input
              name="username"
              v-model="user.username"
              type="text"
              maxlength="12"
              placeholder="Usuario"
            />
          </li>

          <li class="input-alert" id="password">
            <input
              name="password"
              v-model="user.password"
              type="password"
              placeholder="Password"
            />
          </li>
          <li class="input-alert-radio" id="email">
            <input
              id="sex-user-male"
              name="sex"
              v-model="user.sex"
              value="male"
              type="radio"
            />
            <Icons name="male.png" size="20px" />

            <input
              id="sex-user-female"
              name="sex"
              v-model="user.sex"
              value="female"
              type="radio"
            />
            <Icons name="female.png" size="20px" />
          </li>
        </ul>

        <label for="date-of-birth">Fecha de Nacimineto</label>
        <div class="input-alert">
          <input
            v-model="user.dateofbirth"
            min="1960-01-01"
            max="2018-12-31"
            name="dateofbirth"
            type="date"
          />
        </div>
      </div>
      <div class="tab2">
        <h4 style="margin-bottom: 10px">
          Eligue {{ amountPokemon - pokemonsSelected }}
          {{ amountPokemon == 1 ? "pokemon" : "pokemones" }} para empezar
        </h4>
        <ul
          class="container-pokemon"
          :style="loading ? 'pointer-events:none; opacity:0.6;' : ''"
        >
          <li
            class="noselect-pokemon"
            v-for="(pokemon, key) in pokemonToStart"
            v-bind:key="pokemon"
            :dataKey="key"
          >
            <GetPokemon
              :call="pokemon"
              :level="captureLevel(pokemon)"
              :infoTrigger="[['mouseenter', 'mouseleave']]"
              @loaded="
                (evt) => {
                  selectionPokemonToStart.push({ pokemon: evt.features, key });
                }
              "
            />
          </li>
        </ul>
      </div>
      <div
        class="move-button"
        :style="loading ? 'pointer-events:none; opacity:0.6;' : ''"
      >
        <input
          :style="'visibility:' + previous.visibility"
          class="previous-tab"
          type="button"
          value="Regresar"
        />
        <input
          class="next-tab"
          type="button"
          value="Continua"
          v-show="tabActive == 1"
        />
        <button class="next-tab" type="submit" v-show="tabActive == 2">
          Registrarse
          <ShowLoader
            v-if="loading"
            border="4"
            size="10"
            :css="{ top: '-20px' }"
          >
          </ShowLoader>
        </button>
      </div>
    </form>
    <AlertIw name="registerEnd" mod="success" :easyclose="false">
      <div class="msg-succes">
        Registro Existoso

        <button @click="finishRegistration" class="btn-finish">Finish!</button>
      </div>
    </AlertIw>
  </div>
</template>
<script>
import lang from "@/assets/languages-template/index.json";
import store from "@/store/index.js";
import pokemonToStart from "@/config/toStart.json";
import check from "@/assets/check.png";
import cancel from "@/assets/cancel.png";
import axios from "axios";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import { pushmsg } from "@/components/globals/scripts/PushMsg.js";

const $ = require("jquery");

export default {
  data() {
    return {
      selectionPokemonToStart: [],
      loading: false,
      showRegisterEnd: false,
      pokemonToStart: pokemonToStart["pokemon-to-start"].list,
      amountPokemon: pokemonToStart["pokemon-to-start"].amount,
      pokemonsSelected: 0,
      alertiw,
      store,
      pushmsg,
      check,
      cancel,
      errorRegister: "",
      user: {
        name: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        dateofbirth: "",
        storagePokemon: [],
        sex: "",
        trainer: {
          exp: 0,
          winnerBattles: 0,
          numberBattles: 0,
          coins: pokemonToStart.coins,
        },
        medals: {
          triggers: {
            win: 0,
            win_in_a_row: 0,
          },
          earns: [],
        },
      },
      tabActive: 1,
    };
  },
  computed: {
    text() {
      return lang[store.state.lang];
    },
    error() {
      return this.errorRegister;
    },
    previous() {
      return {
        visibility: this.tabActive > 1 ? "visible" : "hidden",
        pointerEvents: this.tabActive > 1 ? "auto" : "none",
      };
    },
  },
  methods: {
    finishRegistration() {
      this.alertiw.close("registerEnd", () => {
        this.clearSelectedPokemon();
        this.previousTab();
        this.resetBorder();
        this.user = {
          name: "",
          lastname: "",
          username: "",
          email: "",
          password: "",
          dateofbirth: "",
          storagePokemon: [],

          trainer: {
            exp: 0,
            winnerBattles: 0,
            numberBattles: 0,
            coins: pokemonToStart.coins,
          },
          medals: {
            triggers: {
              win: 0,
              win_in_a_row: 0,
            },
            earns: [],
          },
        };
        this.$emit("registered-user", true);
      });
    },
    register(usuario) {
      this.loading = true;
      if (this.pokemonsSelected == this.amountPokemon) {
        this.getPokemonSelected();
        axios
          .post(this.store.state.restApi + "api/user/register", usuario)
          .then((res) => {
            this.loading = false;
            this.alertiw.open("registerEnd");
          })
          .catch((err) => {
            if (err.response) {
              let error = err.response.data.error;
              let fin = error.substring(1, error.length).indexOf('"') + 2;
              let input = error.substring(0, fin).replaceAll('"', "");

              if (input != "pokemon") {
                input = document.getElementsByName(input)[0];
                this.resetBorder();
                input.style.border = "solid 1px red";
                this.previousTab();
              }
              this.loading = false;
              this.showFailMsg(error);
              //console.log(err.response.data.error);
            } else {
              this.loading = false;
              this.showFailMsg("CONNECTION ERROR! TRY AGAIN LATER");
              console.log(err);
            }
          });
      } else {
        this.loading = false;
        this.showFailMsg("Number of pokemon selected invalid");
      }
    },
    showFailMsg(error) {
      this.errorRegister = error;
      this.pushmsg.open("msgFormRegister");
    },
    resetBorder() {
      let input = document.querySelectorAll("#registerForm input");
      input.forEach((el) => {
        if (el.getAttribute("type") != "button") {
          el.style.border = "none";
        }
      });
    },
    toggleSelectPokemon(el) {
      if (el.classList[0] == "select-pokemon") {
        el.classList.replace("select-pokemon", "noselect-pokemon");
        this.pokemonsSelected--;
      } else if (el.classList[0] == "noselect-pokemon") {
        if (this.amountPokemon == this.pokemonsSelected) {
          this.clearSelectedPokemon();
          el.classList.replace("noselect-pokemon", "select-pokemon");
          this.pushmsg.close("msgFormRegister");

          this.pokemonsSelected++;
        } else {
          this.pushmsg.close("msgFormRegister");
          el.classList.replace("noselect-pokemon", "select-pokemon");

          this.pokemonsSelected++;
        }
      }
    },
    getPokemonSelected() {
      let el = document.querySelectorAll(".container-pokemon > li");

      el.forEach((li) => {
        if (li.classList[0] === "select-pokemon") {
          let pokemonInfo = this.selectionPokemonToStart.filter((i) => {
            if (i.key == li.getAttribute("dataKey")) {
              return true;
            }
          });
          pokemonInfo[0].pokemon.team = true;
          this.user.storagePokemon.push(pokemonInfo[0].pokemon);
        }
      });
    },
    clearSelectedPokemon() {
      this.user.storagePokemon = [];
      let el = document.querySelectorAll(".container-pokemon li");
      el.forEach((element) => {
        element.classList.replace("select-pokemon", "noselect-pokemon");
      });
      this.pokemonsSelected = 0;
    },
    captureLevel(key) {
      if (typeof key == "string" || typeof key == "number") {
        return 5;
      } else if (typeof key == "object" && !Array.isArray(key)) {
        return key.level;
      } else if (Array.isArray(key)) {
        return key[1];
      }
    },
    previousTab() {
      this.tabActive--;
      let oldTab = $(".tab" + (this.tabActive + 1));
      let nextTab = $(".tab" + this.tabActive);

      oldTab.fadeOut(200, function () {
        nextTab.fadeIn(200);
      });
    },
    nextTab() {
      if ($(".tab" + (this.tabActive + 1)).length != 0) {
        this.tabActive++;
        let oldTab = $(".tab" + (this.tabActive - 1));
        let nextTab = $(".tab" + this.tabActive);
        this.pushmsg.close("msgFormRegister");
        oldTab.fadeOut(200, function () {
          nextTab.fadeIn(200);
        });
      }
    },
  },
  mounted() {
    let nextTab = document.querySelector(".next-tab");
    let previousTab = document.querySelector(".previous-tab");
    let pokemons = document.querySelectorAll(".container-pokemon li");
    pokemons.forEach((el) => {
      el.addEventListener("click", (evt) => {
        this.toggleSelectPokemon(el);
      });
    });
    nextTab.onclick = () => {
      this.nextTab();
    };
    previousTab.onclick = () => {
      this.previousTab();
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/_basic.scss";
.msgSpace {
  width: 100%;
  @include flex(center);
}

.circle-dec {
  position: absolute;
  top: 0%;
  width: 100%;
  border-radius: 10px 10px 50% 50%;
  //border: solid 3px black;
  height: 400px;
  background: #ecf0f1;
  left: 0%;
  z-index: -1;
}
.tooltipError {
  display: inline-block;
  background: #ffffff;
  color: #ee1414;
  font-weight: bold;
  padding: 5px 10px;
  font-size: 13px;
  border-radius: 4px;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}

.tooltipError[data-popper-placement^="top"] > #arrow {
  bottom: -4px;
}

.tooltipError[data-popper-placement^="bottom"] > #arrow {
  top: -4px;
}

.tooltipError[data-popper-placement^="left"] > #arrow {
  right: -4px;
}

.tooltipError[data-popper-placement^="right"] > #arrow {
  left: -4px;
}
.tooltipError {
  background: white;
  border: solid 1px red;
  color: red;
}
.msg-succes {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  .btn-finish {
    width: 70%;
    background: #269cca;
    padding: 5px;
    border-radius: 20px;
    border: none;
    font-family: "Roboto-Regular";
    color: white;
    cursor: pointer;
    box-shadow: -1px 10px 20px -10px rgba(0, 0, 0, 0.89);

    &:hover {
      transition: transform 0.2s ease-in-out;
      transform: scale(1.1);
      box-shadow: -1px 10px 20px -11px rgba(0, 0, 0, 0.89);
    }
  }
  font-family: "Roboto-Black";
  font-size: 18px;
  height: 90px;
  width: 250px;
}
.gifRegister {
  background: pink;
  width: 60px;
  height: 55px;
}
.noselect-pokemon {
  border: none;
  background: transparent;
}
.select-pokemon {
  transition: none;
  background: #ade5ff77 !important;
}
.container-pokemon {
  width: 100%;
  height: 250px;

  @include scrollbar("y", #16a4e6, #444432, #16a4e6);
  list-style: none;
  @include flex(center, wrap);
  li {
    border-radius: 10px;
    transition: background 0.3s ease-in-out;
    width: 80px;
    height: 80px;
    background: #dfdfdf00;
    margin: 2px;
    cursor: pointer;
    @include flex(center);
    &:hover {
      background: rgb(197, 197, 197);
    }
  }
}
.next-tab {
  float: right;
}
.previous-tab {
  float: left;
}
.next-tab,
.previous-tab {
  background: #9c9c9c;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  padding: 5px 7px;
  outline: none;
  color: rgb(0, 0, 0);
  transition: all 0.2s ease-in-out;
  font-family: "Roboto-Black";
}
.next-tab:hover,
.previous-tab:hover {
  background: #16a4e6;
  color: white;
}
.tab1 {
  height: 300px;
  @include flex(center);
  flex-direction: column;
}
.tab2 {
  width: 100%;
  height: 300px;
  display: none;
  h4 {
    margin-top: 15px;
    text-align: center;
    color: black;
  }
  @include scrollbar("y", #16a4e6);
}
.move-button {
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin-top: 20px;
  button,
  input {
    pointer-events: inherit;
  }
}
form {
  width: 100%;
  height: 80%;
  max-height: 350px;
  @include flex(center, wrap);
  overflow-x: hidden;
  overflow-y: auto;
  font-family: "Roboto-Regular";
  @include scrollbar();
  label {
    font-family: "Roboto-Regular";
    width: 90%;
    font-size: 12px;
    margin-left: 20px;
    color: black;
  }
  .button {
    font-family: "sans";
    font-weight: 900;
    background: #6baadf !important;
    border: none;
    cursor: pointer;
    justify-content: center !important;
    text-align: center !important;
    color: white;
    font-size: 16px;
    border-radius: 20px !important;
  }
  .button:hover {
    background: #4296db !important;
  }
}
.input-alert,
.input-alert-radio {
  width: 180px;
  background: transparent;
  border-radius: 20px;
  height: 32px;
  position: relative;
  .check-icon {
    width: 15px;
    height: 15px;
    position: absolute;
    right: -5px;
  }
  @include flex(flex-start);
  margin: 8px;
}
.input-alert-radio {
  width: 130px;
  height: 20px;
  margin: 8px;
  @include flex(flex-start);
  padding: 7px;
  input,
  img {
    margin: 5px;
    padding: 3px;
  }
}

.input-alert input {
  box-shadow: 10px 10px 10px -15px rgba(0, 0, 0, 0.959);
  font-family: "Roboto-Regular";
  width: 160px;
  height: 19px;
  padding: 6px;
  border: none;
  outline: none;
  border-radius: 20px;
  background: white;
}

#login-container {
  min-width: 280px;
  max-width: 400px;
  width: 35vw;
  padding: 10px 0px;
  @include flex(center, wrap);
}
</style>
