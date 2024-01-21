<template>
  <div class="battle-field">
    <img class="background-battle" src="" alt="layout battle pokemon" />-->
    <img class="background-map" src="" />
    <div
      v-if="teamEnemy[0]?.name"
      class="pokemon-container"
      :style="'transform: scale(1.5);'"
    >
      <AlertIw name="evolving" title="" :closeIcon="false" :easyclose="false">
        <div class="evolving" v-if="current_evolving[0]">
          <h3>Your pokemon will evolve</h3>
          <div class="container-evolving">
            <div class="container-before">
              <GetPokemon
                :call="current_evolving[0][0].name"
                :level="current_evolving[0][0].level"
                :stats="current_evolving[0][0]"
                ><span class="namepoke">{{
                  current_evolving[0][0].name
                }}</span></GetPokemon
              >
            </div>
            <Icons name="green_arrows.gif" class="arrow-evolution" />
            <div class="container-after">
              <GetPokemon
                :call="current_evolving[0][1].name"
                :level="current_evolving[0][1].level"
                :stats="current_evolving[0][1]"
              >
                <span class="namepoke"> {{ current_evolving[0][1].name }}</span>
              </GetPokemon>
            </div>
          </div>
          <div class="buttons-evol">
            <button @click="evolutionSkip" class="skip">Skip</button>
            <button @click="evolutionAccept" class="accept">Accept</button>
          </div>
        </div>
      </AlertIw>
      <AlertIw
        name="battle-result"
        title="Battle result"
        :closeIcon="false"
        :easyclose="false"
        :cssTitle="{
          'font-size': '1.5em',
          'font-weight': 'bold',
        }"
        :cssAlert="{
          'font-weight': 'bold',

          'box-shadow': 'none',
          border: '2px black solid',
        }"
      >
        <div class="victory-battle">
          <div class="victory">
            <Icons name="hojas-olimpicas.svg" size="200px" />
            <h1>{{ ResultBattle.header }}</h1>

            <button @click="endBattle">Continue {{ timeToEnd }}</button>
            <ul
              class="pokemon-levels-up"
              v-if="
                pokemonLevelsUp.length > 0 ||
                redwards.coins > 0 ||
                redwards.trainerExp > 0
              "
            >
              <h4>Your redwards:</h4>
              <li v-for="i in pokemonLevelsUp" v-bind:key="i">
                <GetPokemon
                  :call="i.name"
                  :level="i.level"
                  staticPokemon
                  :stats="i"
                  width="45px"
                  height="45px"
                />
                <Icons name="green_arrows.gif" size="20px" />
              </li>

              <li
                class="pokemoney"
                v-show="redwards.coins"
                style="margin-right: 5px"
              >
                <Icons name="coins.png" size="25px" />
                <span>{{ redwards.coins }}</span>
              </li>
              <li class="trainerExp" v-show="redwards.trainerExp">
                <Icons name="star.svg" size="25px" />
                <span>{{ redwards.trainerExp }}</span>
              </li>
            </ul>
          </div>
        </div>
      </AlertIw>
      <get-pokemon
        v-if="hero"
        class="hero"
        infoPlacement="top"
        :call="hero.name"
        :stats="hero"
        :level="hero.level"
        :token="hero.token"
        @isEvolving="evolution"
        @levelup="
          (newStats) => {
            hero.attack = newStats.attack;
            hero.defense = newStats.defense;
            hero.speed = newStats.speed;
            hero.hp = newStats.hp;
            hero['special-attack'] = newStats['special-attack'];
            hero['special-defense'] = newStats['special-defense'];
          }
        "
      >
        <FadeUp
          course="top"
          :time="3000"
          position="60%"
          :font="{
            fontSize: '12px',
          }"
          class="attackheroFadeUp"
        ></FadeUp>
      </get-pokemon>

      <get-pokemon
        class="enemy"
        infoPlacement="top"
        :call="teamEnemy[keyEnemy]?.name"
        :level="teamEnemy[keyEnemy]?.level"
        :infoCss="{
          display: config_battle['show-info-enemy'] ? 'flex' : 'none',
        }"
        :token="'enemy-' + keyEnemy"
        stats="battle"
        @loaded="
          (data) => {
            prepareTeam('enemy', [data.features]);
          }
        "
      >
        <FadeUp
          course="top"
          :time="3000"
          position="60%"
          :font="{
            fontSize: '12px',
          }"
          class="attackenemyFadeUp"
        ></FadeUp>
      </get-pokemon>
      <div id="enemy-stats" v-if="enemy?.hp">
        <span class="container-name-level" style="font-size: 10px"
          ><span class="level">Lv. {{ enemy.level }}&nbsp; </span>
          <span class="name"> {{ enemy.name }} </span>
          <span class="types">
            <Icons
              v-for="type in enemy.types"
              v-bind:key="type"
              :name="
                'type/' +
                type.charAt(0).toUpperCase() +
                type.substring(1, type.length) +
                '.gif'
              "
          /></span>
        </span>
        <div class="hp-container">
          <Heart />

          <ProgressBar
            :max="enemy.hp"
            :value="EnemyCurrentHP"
            style="height: 10px"
            color="#ff7979"
            :title="EnemyCurrentHP + ' / ' + enemy.hp"
            width="100"
          >
          </ProgressBar>
          <FadeUp
            course="top"
            :time="1500"
            position="100%"
            :font="{
              fontSize: '12px',
            }"
            class="currenthpenemyFadeUp"
          ></FadeUp>
        </div>
        <div class="xp-container" v-if="experienceEnemy">
          <Star />

          <ProgressBar
            :max="experienceEnemy.progress.max"
            :value="experienceEnemy.progress.value"
            style="height: 10px"
            color="#3498db"
            :title="experienceEnemy.now + ' / ' + experienceEnemy.nextLevel"
            width="100"
          >
          </ProgressBar>
          <FadeUp
            course="top"
            :time="1500"
            position="100%"
            :font="{
              fontSize: '12px',
            }"
            class="experienceenemyFadeUp"
          ></FadeUp>
        </div>
      </div>

      <div id="hero-stats" v-if="hero.hp">
        <span class="container-name-level" style="font-size: 10px">
          <span class="level"
            >Lv. {{ hero.level }}&nbsp;
            <span class="name"> {{ hero.name }} </span></span
          >

          <span class="types">
            <Icons
              v-for="type in hero.types"
              v-bind:key="type"
              :name="
                'type/' +
                type.charAt(0).toUpperCase() +
                type.substring(1, type.length) +
                '.gif'
              "
          /></span>
        </span>
        <div class="hp-container">
          <Heart />

          <ProgressBar
            :max="hero.hp"
            :value="HeroCurrentHP"
            style="height: 10px"
            color="#ff7979"
            :title="HeroCurrentHP + ' / ' + hero.hp"
            width="100"
          >
          </ProgressBar>
          <FadeUp
            course="top"
            :time="1500"
            position="100%"
            :font="{
              fontSize: '12px',
            }"
            class="currenthpheroFadeUp"
          ></FadeUp>
        </div>

        <div class="xp-container" v-if="experienceHero">
          <Star />

          <ProgressBar
            :max="experienceHero.progress.max"
            :value="experienceHero.progress.value"
            style="height: 10px"
            color="#3498db"
            :title="experienceHero.now + ' / ' + experienceHero.nextLevel"
            width="100"
          >
          </ProgressBar>
          <FadeUp
            course="top"
            :time="1500"
            position="100%"
            :font="{
              fontSize: '12px',
            }"
            class="experienceheroFadeUp"
          ></FadeUp>
        </div>
      </div>
    </div>

    <div class="container-buttons-battle">
      <button
        id="fight"
        class="btn-battle"
        @click="
          () => {
            openfight = !openfight;
            closemenuicon = true;
          }
        "
      >
        <div class="title-button">
          <Icons name="glove.svg" size="30px" style="margin-right: 10px" />Fight
        </div>
        <span>select an attack</span>
      </button>

      <button
        id="team"
        class="btn-battle"
        @click="
          () => {
            openteam = !openteam;
            closemenuicon = true;
          }
        "
      >
        <div class="title-button">
          <Icons
            name="pokeball-group.svg"
            size="30px"
            style="margin-right: 10px"
          />Team
        </div>
        <span>select a pokemon</span>
      </button>

      <button id="bag" class="btn-battle">
        <div class="title-button">
          <Icons name="bag.svg" size="30px" style="margin-right: 10px" />Bag
        </div>
        <span>open your bag</span>
      </button>

      <button id="run" class="btn-battle" @click="run">
        <div class="title-button">Run</div>
        <span>run away</span>
        <AlertIw
          name="run-alert"
          title="Run away"
          :closeIcon="false"
          :cssTitle="{
            'font-size': '1.5em',
            'font-weight': 'bold',
            background: '#3498db',
          }"
          :cssAlert="{
            'font-weight': 'bold',
            background: '#3498db',
            'box-shadow': 'none',
            border: '2px black solid',
          }"
          ><div class="run-alert-content">
            <h2>You want to give up this battle?</h2>
            <div>
              <button @click="alertiw.close('run-alert')" class="no-run">
                Cancel
              </button>
              <button
                @click="
                  () => {
                    alertiw.close('run-alert', () => {
                      quit();
                    });
                  }
                "
                class="yes-run"
              >
                Continue
              </button>
            </div>
          </div>
        </AlertIw>
      </button>

      <div class="menu fight-menu" v-if="openfight">
        <CloseCircle
          v-if="closemenuicon"
          class="close-menu"
          @click="closeMenu"
        />
        <ul>
          <li
            class="attack-hero"
            v-for="attack in hero.moves"
            v-bind:key="attack"
            :disabled="attack.currentPp > 0 ? 'false' : 'true'"
            :style="attack.currentPp == 0 ? 'opacity: 0.5' : ''"
            @click="
              () => {
                heroAttack(attack);
              }
            "
          >
            <span class="name-attack">{{ attack.name }}</span>
            <span class="pp-attack"
              >{{ attack.currentPp }} / {{ attack.pp }}</span
            >
          </li>
        </ul>
      </div>

      <div class="menu team-menu" v-if="openteam">
        <CloseCircle
          v-if="closemenuicon"
          class="close-menu"
          @click="closeMenu"
        />
        <ul>
          <li
            v-for="pokemon in HeroTeamWithoutTheCurrentHero"
            v-bind:key="pokemon"
            :id="'pokemon-team-' + pokemon.token"
          >
            <get-pokemon
              :call="pokemon.name"
              :level="pokemon.level"
              :stats="pokemon"
            />
            <ToolTip
              class="contextmenu-pokemon"
              theme="black"
              :trigger="[['contextmenu', 'click:out', true]]"
              :on="'#pokemon-team-' + pokemon.token"
              :await="0"
              :beforeShow="closeAllInfoPokemon"
              :css="{
                background: '#34495e',
              }"
            >
              <ul
                :id="'contextualMenu-' + pokemon.token"
                class="contextualMenu"
              >
                <li @click="() => changeHero(pokemon.token)">
                  Selected for battle
                </li>
              </ul>
            </ToolTip>
          </li>
        </ul>
      </div>
    </div>
    <div class="layout-hidden">
      <Icons name="bola.png" style="margin-right: 5px" size="20px" /> Loading
    </div>
  </div>
</template>
<script>
import store from "@/store";
import config_battle from "@/config/battles";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import { Heart, Star, CloseCircle } from "mdue";
import config_levels from "@/config/levelup";
import maps from "@/config/maps/maps";
import pokedex from "@/config/pokemon_data/pokedex";
import battleMusic from "@/assets/sounds/battle.mp3";
export default {
  data() {
    return {
      battleMusic,
      alertiw,
      config_levels,
      config_battle,
      store,
      hero: null,
      enemy: null,
      teams: {},
      maps,
      pokedex,
      wildPokemons: [],
      map: null,
      keyEnemy: 0,
      openfight: false,
      openteam: false,
      turn: "hero",
      closemenuicon: false,
      teamEnemy: [],
      ID_USER: null,
      DATA_BATTLE: null,
      timeLoad: 0,
      intervalLoad: null,
      current_evolving: [],
      callbacksEvolution: [],
      promiseEvolutionDone: [],
      awaitEvolving: false,
      count_queue_of_evolutions: 0,
      status: "start",
      ResultBattle: {
        header: "",
      },
      intervalClose: null,
      redwards: {
        trainerExp: 0,
        pokemon_levelup: {},
        pokemon_evolution: [],
        coins: 0,
      },
      timeCounter: 0,
    };
  },
  components: {
    Heart,
    Star,
    CloseCircle,
  },
  computed: {
    pokemonLevelsUp() {
      let heros = [];
      for (let i in this.redwards.pokemon_levelup) {
        let pokemon = this.teams["hero"].find((poke) => poke.token == i);
        heros.push(pokemon);
      }
      return heros;
    },

    timeToEnd() {
      return this.timeCounter;
    },
    experienceHero() {
      //devolver valor max de este nivel y la experiencia actual para que funcione el progress bar
      return {
        now: this.hero?.experience,
        nextLevel: this.config_levels["pokemon-levels"][this.hero?.level],
        progress: {
          // nivel siguiente menos el actual
          max:
            this.config_levels["pokemon-levels"][this.hero?.level] -
            this.config_levels["pokemon-levels"][this.hero?.level - 1],
          // experiencia actual menos el nivel anterior
          value:
            this.hero?.experience -
            this.config_levels["pokemon-levels"][this.hero?.level - 1],
        },
      };
    },
    experienceEnemy() {
      return {
        now: this.enemy?.experience,
        nextLevel: this.config_levels["pokemon-levels"][this.enemy?.level],
        progress: {
          // nivel siguiente menos el actual
          max:
            this.config_levels["pokemon-levels"][this.enemy?.level] -
            this.config_levels["pokemon-levels"][this.enemy?.level - 1],
          // experiencia actual menos el nivel anterior
          value:
            this.enemy?.experience -
            this.config_levels["pokemon-levels"][this.enemy?.level - 1],
        },
      };
    },
    menuOpen() {
      if (this.openfight || this.openteam) {
        return true;
      } else {
        return false;
      }
    },
    HeroCurrentHP() {
      return this.hero?.currentHp;
    },
    EnemyCurrentHP() {
      return this.enemy?.currentHp;
    },
    HeroTeamWithoutTheCurrentHero() {
      if (this.teams["hero"] && this.teams["hero"].length > 0) {
        return this.teams["hero"].filter(
          (pokemon) =>
            pokemon.token !== this.hero.token && pokemon.currentHp > 0
        );
      } else {
        return [];
      }
    },
    queue_of_evolutions() {
      return this.promiseEvolutionDone;
    },
  },
  watch: {
    DATA_BATTLE(value) {
      if (value) {
        let awaitToStartBattle =
          config_battle["await-to-start-battle"] - this.timeLoad;
        //si awaitToStartBattle es negativo se iguala a 0
        awaitToStartBattle = awaitToStartBattle < 0 ? 0 : awaitToStartBattle;
        let layoutHidden = document.querySelector(".layout-hidden");
        if (awaitToStartBattle > 0) {
          setTimeout(() => {
            layoutHidden.style.display = "none";
          }, awaitToStartBattle * 1000);
        } else {
          layoutHidden.style.display = "none";
        }

        this.backgroundMap(this.map["field-battle-src"]);
      }
    },
    experienceHero(value, oldValue) {
      if (value && value != oldValue && this.ID_USER) {
        let data_level = this.getLevelForExperience(value.now, this.hero.level);

        if (data_level > 0) {
          this.levelUpHero(data_level);
        }
      }
    },
    experienceEnemy(value, oldValue) {
      if (value && value != oldValue && this.ID_USER) {
        let data_level = this.getLevelForExperience(
          value.now,
          this.enemy.level
        );

        if (data_level > 0) {
          this.levelUpEnemy(data_level);
        }
      }
    },
    turn() {
      let buttonsBattle = document.getElementsByClassName("btn-battle");
      let time_attack_enemy = config_battle["await-enemy-attack"];
      function enableButtons() {
        buttonsBattle[0].parentNode.style.filter = "grayscale(0%)";
        for (let i = 0; i < buttonsBattle.length; i++) {
          buttonsBattle[i].removeAttribute("disabled");
        }
      }
      function disableButtons() {
        buttonsBattle[0].parentNode.style.filter = "grayscale(100%)";
        for (let i = 0; i < buttonsBattle.length; i++) {
          buttonsBattle[i].setAttribute("disabled", "disabled");
        }
      }
      //desactivar buttons battle mientras que el turno sea del enemigo
      if (this.turn === "enemy") {
        disableButtons();

        setTimeout(() => {
          this.enemyAttack();
        }, time_attack_enemy * 1000);
      } else if (this.turn === "hero") {
        enableButtons();
      } else if (this.turn === "system") {
        disableButtons();
      }
    },
    menuOpen(value) {
      let buttons = document.querySelectorAll(
        ".container-buttons-battle button"
      );
      if (value) {
        buttons.forEach((button) => {
          button.style.visibility = "hidden";
        });
      } else {
        buttons.forEach((button) => {
          button.style.visibility = "visible";
        });
      }
    },
    status(val) {
      if (val == "Win" || val == "Loser") {
        if (this.awaitEvolving == false) {
          this[val]();
        } else {
          this.current_evolving.push(this.queue_of_evolutions[0]);
          this.alertiw.open("evolving");
        }
      }
    },
    count_queue_of_evolutions() {
      if (this.count_queue_of_evolutions == this.queue_of_evolutions.length) {
        this.awaitEvolving = false;
        this[this.status]();
      } else {
        this.current_evolving[0] =
          this.queue_of_evolutions[this.count_queue_of_evolutions];
        this.alertiw.open("evolving");
      }
    },
  },
  methods: {
    evolution_hero_pokemon(
      hero,
      evo,
      link_team = this.searchIndexForToken(hero.token, this.teams["hero"])
    ) {
      evo.token = hero.token;
      evo.team = true;
      evo.level = hero.level;
      evo.experience = hero.experience;
      this.teams["hero"][link_team] = evo;
      if (this.hero.token == hero.token) {
        this.hero = evo;
      }
      /*if (this.redwards.pokemon_levelup[hero.token]) {
        delete this.redwards.pokemon_levelup[hero.token];
      }*/
      this.redwards.pokemon_evolution.push([hero, evo]);
    },
    evolutionAccept() {
      this.alertiw.close("evolving", () => {
        let hero = this.queue_of_evolutions[this.count_queue_of_evolutions];
        let link_team = this.searchIndexForToken(
          hero[0].token,
          this.teams["hero"]
        );
        this.teams["hero"][link_team].evolution_preference = "accept";
        this.evolution_hero_pokemon(hero[0], hero[1], link_team);
        this.count_queue_of_evolutions++;
      });
    },
    evolutionSkip() {
      this.alertiw.close("evolving", () => {
        let hero = this.queue_of_evolutions[this.count_queue_of_evolutions];
        let link_team = this.searchIndexForToken(
          hero[0].token,
          this.teams["hero"]
        );
        this.teams["hero"][link_team].evolution_preference = "skip";
        this.count_queue_of_evolutions++;
      });
    },
    execallbacksEvolution() {
      for (let i = 0; this.callbacksEvolution.length >= i; i++) {
        if (typeof this[this.callbacksEvolution[i]] == "function") {
          this[this.callbacksEvolution[i]]();
        }
      }
    },
    async evolution(evo) {
      this.awaitEvolving = true;
      let current_token = this.hero.token;
      //verificar el current_token no exista en this.queue_of_evolutions
      if (
        this.queue_of_evolutions.filter(
          (hero) => hero[0].token == current_token
        ).length == 0
      ) {
        await evo.then((data) => {
          this.promiseEvolutionDone.push([this.hero, data]);
        });
      }
    },
    getLevelForExperience(exp_actual, level) {
      let levels = this.config_levels["pokemon-levels"];
      let level_actual = level;
      for (let i = level_actual; i < levels.length; i++) {
        if (exp_actual < levels[i]) {
          return i - level_actual;
        }
      }
    },
    counter(segundos, fn) {
      this.timeCounter = segundos;
      this.intervalClose = setInterval(() => {
        this.timeCounter--;
        if (this.timeCounter == 0) {
          clearInterval(this.intervalClose);
          fn();
        }
      }, 1000);
    },
    levelUpHero(nr_levels) {
      this.hero.level += nr_levels;
      this.addRedward("pokemon_levelup", nr_levels);
    },
    levelUpEnemy(nr_levels) {
      this.enemy.level += nr_levels;
    },
    backgroundMap(map) {
      let img = new Image();
      img.src = require("@/assets/battleLayout/" + map);
      let backgroundMap = document.querySelector(`.background-map`);
      //cargar imagen en .background-map
      img.onload = () => {
        backgroundMap.src = img.src;
        this.map_load++;
        this.mapOpacity = "1";
      };
    },
    sound(src, loop = false) {
      let sound = require("@/assets/sounds/" + src);
      let audio = new Audio(sound);
      audio.loop = loop;
      audio.play();
      return audio;
    },
    hitAnimate(player) {
      let speedAttack = config_battle["speed-attack"];
      player = document.querySelector("." + player);
      player.classList.add("hit");
      player.style.animationDuration = speedAttack + "s";

      this.sound("hit.mp3");

      setTimeout(() => {
        player.classList.remove("hit");
      }, speedAttack * 1000);
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
    changeHero(token) {
      this.closeMenu();

      this.selectPokemonToBattle("hero", token);
      //remove class death si existe
      let hero = document.querySelector(".hero");
      hero.classList.remove("death");
      this.closemenuicon = true;
    },
    closeMenu() {
      this.openfight = false;
      this.openteam = false;
    },
    getDamage(attacker, defender, move) {
      let v = getRandomInt(85, 101);
      let e = this.getEffectiveness(attacker.types, defender.types);
      let b = 1;
      for (let i = 0; i < attacker.types.length; i++) {
        if (attacker.types[i].toLowerCase() == move.type) {
          b = 1.5;
        }
      }
      let d =
        move.category == "special"
          ? defender["special-defense"]
          : defender.defense;
      let p = move.power;
      let a =
        move.category == "special"
          ? attacker["special-attack"]
          : attacker.attack;
      let n = attacker.level;

      let dam = Math.round(
        0.01 * b * e * v * (((0.2 * n + 1) * a * p) / (25 * d) + 2)
      );

      return dam;
    },
    getEffectiveness(typeAttacker, typeDefender) {
      let val = [];
      var effectiveness = {
        Normal: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 0.25,
          Bug: 1,
          Ghost: 0,
          Steel: 0.25,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 1,
          Dark: 1,
          Fairy: 1,
        },
        Fighting: {
          Normal: 2,
          Fighting: 1,
          Flying: 0.25,
          Poison: 0.25,
          Ground: 1,
          Rock: 2,
          Bug: 0.25,
          Ghost: 0,
          Steel: 2,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 0.25,
          Ice: 2,
          Dragon: 1,
          Dark: 2,
          Fairy: 0.25,
        },
        Flying: {
          Normal: 1,
          Fighting: 2,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 0.25,
          Bug: 2,
          Ghost: 1,
          Steel: 0.25,
          Fire: 1,
          Water: 1,
          Grass: 2,
          Electric: 0.25,
          Psychic: 1,
          Ice: 1,
          Dragon: 1,
          Dark: 1,
          Fairy: 1,
        },
        Poison: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 0.25,
          Ground: 0.25,
          Rock: 0.25,
          Bug: 1,
          Ghost: 0.25,
          Steel: 0,
          Fire: 1,
          Water: 1,
          Grass: 2,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 1,
          Dark: 1,
          Fairy: 2,
        },
        Ground: {
          Normal: 1,
          Fighting: 1,
          Flying: 0,
          Poison: 2,
          Ground: 1,
          Rock: 2,
          Bug: 0.25,
          Ghost: 1,
          Steel: 2,
          Fire: 2,
          Water: 1,
          Grass: 0.25,
          Electric: 2,
          Psychic: 1,
          Ice: 1,
          Dragon: 1,
          Dark: 1,
          Fairy: 1,
        },
        Rock: {
          Normal: 1,
          Fighting: 0.25,
          Flying: 2,
          Poison: 1,
          Ground: 0.25,
          Rock: 1,
          Bug: 2,
          Ghost: 1,
          Steel: 0.25,
          Fire: 2,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 1,
          Ice: 2,
          Dragon: 1,
          Dark: 1,
          Fairy: 1,
        },
        Bug: {
          Normal: 1,
          Fighting: 0.25,
          Flying: 0.25,
          Poison: 0.25,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 0.25,
          Steel: 0.25,
          Fire: 0.25,
          Water: 1,
          Grass: 2,
          Electric: 1,
          Psychic: 2,
          Ice: 1,
          Dragon: 1,
          Dark: 2,
          Fairy: 0.25,
        },
        Ghost: {
          Normal: 0,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 2,
          Steel: 1,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 2,
          Ice: 1,
          Dragon: 1,
          Dark: 0.25,
          Fairy: 1,
        },
        Steel: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 2,
          Bug: 1,
          Ghost: 1,
          Steel: 0.25,
          Fire: 0.25,
          Water: 0.25,
          Grass: 1,
          Electric: 0.25,
          Psychic: 1,
          Ice: 2,
          Dragon: 1,
          Dark: 1,
          Fairy: 2,
        },
        Fire: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 0.25,
          Bug: 2,
          Ghost: 1,
          Steel: 2,
          Fire: 0.25,
          Water: 0.25,
          Grass: 2,
          Electric: 1,
          Psychic: 1,
          Ice: 2,
          Dragon: 0.25,
          Dark: 1,
          Fairy: 1,
        },
        Water: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 2,
          Rock: 2,
          Bug: 1,
          Ghost: 1,
          Steel: 1,
          Fire: 2,
          Water: 0.25,
          Grass: 0.25,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 0.25,
          Dark: 1,
          Fairy: 1,
        },
        Grass: {
          Normal: 1,
          Fighting: 1,
          Flying: 0.25,
          Poison: 0.25,
          Ground: 2,
          Rock: 2,
          Bug: 0.25,
          Ghost: 1,
          Steel: 0.25,
          Fire: 0.25,
          Water: 2,
          Grass: 0.25,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 0.25,
          Dark: 1,
          Fairy: 1,
        },
        Electric: {
          Normal: 1,
          Fighting: 1,
          Flying: 2,
          Poison: 1,
          Ground: 0,
          Rock: 1,
          Bug: 1,
          Ghost: 1,
          Steel: 1,
          Fire: 1,
          Water: 2,
          Grass: 0.25,
          Electric: 0.25,
          Psychic: 1,
          Ice: 1,
          Dragon: 0.25,
          Dark: 1,
          Fairy: 1,
        },
        Psychic: {
          Normal: 1,
          Fighting: 2,
          Flying: 1,
          Poison: 2,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 1,
          Steel: 0.25,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 0.25,
          Ice: 1,
          Dragon: 1,
          Dark: 0,
          Fairy: 1,
        },
        Ice: {
          Normal: 1,
          Fighting: 1,
          Flying: 2,
          Poison: 1,
          Ground: 2,
          Rock: 1,
          Bug: 1,
          Ghost: 1,
          Steel: 0.25,
          Fire: 0.25,
          Water: 0.25,
          Grass: 2,
          Electric: 1,
          Psychic: 1,
          Ice: 0.25,
          Dragon: 2,
          Dark: 1,
          Fairy: 1,
        },
        Dragon: {
          Normal: 1,
          Fighting: 1,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 1,
          Steel: 0.25,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 2,
          Dark: 1,
          Fairy: 0,
        },
        Dark: {
          Normal: 1,
          Fighting: 0.25,
          Flying: 1,
          Poison: 1,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 2,
          Steel: 1,
          Fire: 1,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 2,
          Ice: 1,
          Dragon: 1,
          Dark: 0.25,
          Fairy: 0.25,
        },
        Fairy: {
          Normal: 1,
          Fighting: 2,
          Flying: 1,
          Poison: 0.25,
          Ground: 1,
          Rock: 1,
          Bug: 1,
          Ghost: 1,
          Steel: 0.25,
          Fire: 0.25,
          Water: 1,
          Grass: 1,
          Electric: 1,
          Psychic: 1,
          Ice: 1,
          Dragon: 2,
          Dark: 2,
          Fairy: 1,
        },
      };
      for (let i in typeAttacker) {
        typeAttacker[i] =
          typeAttacker[i].charAt(0).toUpperCase() + typeAttacker[i].slice(1);
      }
      for (let i in typeDefender) {
        typeDefender[i] =
          typeDefender[i].charAt(0).toUpperCase() + typeDefender[i].slice(1);
      }

      if (typeAttacker.length == 1 && typeDefender.length == 1) {
        for (let i in typeAttacker) {
          val.push(effectiveness[typeAttacker[i]][typeDefender[i]]);
        }
        return val[0];
      }
      if (typeAttacker.length == 2 && typeDefender.length == 1) {
        for (let i in typeAttacker) {
          val.push(effectiveness[typeAttacker[i]][typeDefender[0]]);
        }
        return val[0] * val[1];
      }
      if (typeAttacker.length == 1 && typeDefender.length == 2) {
        for (let i in typeDefender) {
          val.push(effectiveness[typeAttacker[0]][typeDefender[i]]);
        }
        return val[0] * val[1];
      }
      if (typeAttacker.length == 2 && typeDefender.length == 2) {
        for (let i in typeDefender) {
          val.push(effectiveness[typeAttacker[i]][typeDefender[i]]);
        }
        return val[0] * val[1];
      }
    },
    heroDeath() {
      let hero = document.querySelector(".hero");
      hero.classList.add("death");
      this.openteam = true;
      this.closemenuicon = false;
      this.openfight = false;
      this.changeBattleStats(
        "enemy",
        "experience",
        "+",
        this.calcPokemonExperienceGained(this.hero)
      );
      if (this.HeroTeamWithoutTheCurrentHero.length == 0) {
        this.status = "Loser";
      }
    },
    calcPokemonExperienceGained(opponent) {
      let cal = Math.floor(
        (opponent.base.Experience * (opponent.level * 1)) / 7
      );

      return cal;
    },
    calcCoinsGained(opponent) {
      let productionCoin = this.config_battle["production-coins"];
      let coins = Math.floor(
        Math.random() * productionCoin * (opponent.level / 2) +
          getRandomInt(1, 11)
      );
      return coins;
    },
    calcTrainerExpGained(opponent) {
      let productionTrainerExp = this.config_battle["production-trainer-exp"];
      let trainerExp = Math.floor(
        Math.random() * productionTrainerExp * (opponent.level / 2) +
          getRandomInt(1, 11)
      );
      return trainerExp;
    },
    saveDataPokemon() {
      let team = this.teams["hero"].map((pokemon) => {
        pokemon.currentHp = pokemon.hp;
        return pokemon;
      });

      let storagePokemon = this.store.state.DATA_USER.storagePokemon;
      for (let i = 0; i < team.length; i++) {
        let index = this.searchIndexForToken(team[i].token, storagePokemon);
        storagePokemon[index] = team[i];
      }

      this.store.dispatch("updateDataUser", {
        storagePokemon,
      });
      this.store.state.DATA_USER.storagePokemon = storagePokemon;
    },
    changeEnemy() {
      this.keyEnemy++;
      this.enemy.currentHp = this.enemy.hp;
    },
    saveRedwards() {
      let redwards = this.redwards;
      if (redwards.coins || redwards.trainerExp) {
        this.store.dispatch("updateDataUser", {
          "data.redwards": redwards,
        });
      }
      this.store.state.DATA_USER.data.redwards = redwards;
    },
    endBattle() {
      //apagar sonido de batalla

      this.alertiw.close("battle-result", () => {
        clearInterval(this.intervalClose);
        this.$router.push("/game");
        this.saveDataPokemon();
        this.saveRedwards();
      });
    },
    Loser() {
      this.ResultBattle.header = "Defeat";
      this.status = "lose";
      setTimeout(() => {
        this.alertiw.open("battle-result", () => {
          this.counter(10, () => {
            this.endBattle();
          });
        });
      }, 2000);
    },
    Win() {
      this.ResultBattle.header = "Victory";
      setTimeout(() => {
        this.alertiw.open("battle-result", () => {
          let result = document.querySelector(".victory");
          let config_conffeti = this.config_battle["confetti-victory"];
          if (config_conffeti) {
            this.$confetti(result);
            this.sound("confetti-pop.mp3");
            this.sound("people-celebrate.mp3");
          }
          this.counter(10, () => {
            this.endBattle();
          });
        });
      }, 2000);
    },
    addRedward(name_redward, redward) {
      if (name_redward == "pokemon_levelup") {
        if (this.redwards[name_redward][this.hero.token]) {
          this.redwards[name_redward][this.hero.token] += redward;
        } else {
          this.redwards[name_redward][this.hero.token] = redward;
        }
      } else if (name_redward == "coins") {
        this.redwards[name_redward] += redward;
      } else if (name_redward == "trainerExp") {
        this.redwards[name_redward] += redward;
      }
    },
    enemyDeath() {
      let awaitToChangeEnemy = config_battle["await-to-change-enemy"];
      let enemy = document.querySelector(".enemy");
      this.turn = "system";
      let heroExp = this.calcPokemonExperienceGained(this.enemy);
      this.changeBattleStats("hero", "experience", "+", heroExp);

      this.addRedward("coins", this.calcCoinsGained(this.enemy));
      this.addRedward("trainerExp", this.calcTrainerExpGained(this.enemy));
      enemy.classList.add("death");

      if (this.teamEnemy[this.keyEnemy + 1]) {
        setTimeout(() => {
          this.turn = "enemy";
          this.changeEnemy();
          enemy.classList.remove("death");
        }, awaitToChangeEnemy * 1000);
      } else {
        setTimeout(() => {
          this.status = "Win";
        }, awaitToChangeEnemy * 1000);
      }
    },
    changeBattleStats(hero_or_enemy, key, type, value) {
      let player = hero_or_enemy == "hero" ? this.hero : this.enemy;

      let playerFade = document.querySelector(
        "." + key.toLowerCase() + hero_or_enemy + "FadeUp"
      );

      if (type == "-") {
        player[key] -= value;
        //si player[key] es negativo, lo pongo a 0
        if (player[key] < 0) {
          player[key] = 0;
        }
        //si player[key] es 0 pokemon muerto
        if (player[key] == 0) {
          this[hero_or_enemy + "Death"]();
        }

        playerFade.fade("-" + value, "#ff7979");
      } else if (type == "+") {
        player[key] += value;
        playerFade.fade("+" + value, "#3498db");
      }
      if (player.token) {
        let index = this.searchIndexForToken(
          player.token,
          this.teams[hero_or_enemy]
        );

        this.teams[hero_or_enemy][index][key] = player[key];
      }
    },
    searchIndexForToken(token, storage) {
      let found = storage.findIndex((pokemon) => {
        return pokemon.token == token;
      });
      return found;
    },
    fadeUpAttack(player, nameAttack) {
      player = document.querySelector(".attack" + player + "FadeUp");
      player.fade(nameAttack, "black");
    },
    getWildPokemonsInThisMap() {
      let map = this.map;
      let alloweTypes = map.types;

      let pokedex = this.pokedex;
      return pokedex.filter((pokemon) => {
        let types = pokemon.type;
        return types.some((type) => {
          return alloweTypes.includes(type.toLowerCase());
        });
      });
    },
    selectWildPokemon() {
      let map = this.map;
      let rangeLevel = map["pokemons-wild-levels"]; // array [min, max]
      let level = Math.floor(
        Math.random() * (rangeLevel[1] - rangeLevel[0]) + rangeLevel[0]
      );
      let pokemon =
        this.wildPokemons[Math.floor(Math.random() * this.wildPokemons.length)];
      return {
        name: pokemon.name,
        level: level,
      };
    },
    createWildTeam() {
      let nr_the_pokemons = this.config_battle["nr-wild-battles"];
      let team = [];
      for (let i = 0; i < nr_the_pokemons; i++) {
        let pokemon = this.selectWildPokemon();
        //agregar currentPp a cada move del pokemon

        team.push(pokemon);
      }
      return team;
    },
    selectPokemonToBattle(hero_or_enemy, token) {
      this[hero_or_enemy] = this.teams[hero_or_enemy].find((pokemon) => {
        return pokemon.token == token;
      });
    },
    prepareTeam(hero_or_enemy, team) {
      this.teams[hero_or_enemy] = team;

      this.teams[hero_or_enemy].forEach((pokemon) => {
        if (typeof pokemon.currentHp !== "number") {
          pokemon.currentHp = pokemon.hp;
        }
        //analizar todos los movimientos y establecer currentPp en cada uno si no esta establecido
        pokemon.moves.forEach((move) => {
          move.currentPp = move.pp;
        });
      });
      this.selectPokemonToBattle(hero_or_enemy, team[0].token);
    },
    quit() {
      this.$router.go(-1);
      //apagar sonido
    },
    run() {
      this.alertiw.open("run-alert");
    },
    heroAttack(attack) {
      if (attack.currentPp == 0) {
        return;
      }
      this.hitAnimate("hero");
      this.fadeUpAttack("hero", attack.name);
      let damage = this.getDamage(this.hero, this.enemy, attack);
      this.changeBattleStats("enemy", "currentHp", "-", damage);
      this.turn = this.turn != "system" ? "enemy" : "system";
      this.openfight = false;
      attack.currentPp--;
    },
    enemyAttack() {
      let moves = this.enemy.moves.filter((move) => {
        return move.currentPp > 0;
      });
      if (moves) {
        let attack = moves[Math.floor(Math.random() * moves.length)];
        this.hitAnimate("enemy");
        this.fadeUpAttack("enemy", attack.name);
        let damage = this.getDamage(this.enemy, this.hero, attack);
        this.changeBattleStats("hero", "currentHp", "-", damage);
        this.turn = "hero" == "hero" ? "hero" : "system";
      } else {
        this.changeEnemy();
      }
    },
    firstStylesToInit() {
      this.$nextTick(() => {
        let enemy = document.querySelector(".enemy img");
        enemy.style.transform =
          "scale(" + this.config_battle["size-pokemons"] + ")";

        let hero = document.querySelector(".hero img");
        hero.style.transform =
          "scale(" + this.config_battle["size-pokemons"] + ") scaleX(-1)";
      });
    },
    loadDataBattle(fn) {
      //convertir este codigo en un interceptor en router para verificar que data.onbattle esta definido
      if (this.store.state.ID_USER) {
        this.ID_USER = this.store.state.ID_USER;
        this.store.dispatch("getDataUser").then((user) => {
          this.DATA_BATTLE = this.store.state.DATA_USER.data.onbattle;
          fn(this.DATA_BATTLE);
        });
      } else {
        this.store.dispatch("getUserID").then((id) => {
          this.ID_USER = id;
          this.store.dispatch("getDataUser").then((user) => {
            this.DATA_BATTLE = this.store.state.DATA_USER.data.onbattle;
            fn(this.DATA_BATTLE);
          });
        });
      }
    },
  },
  created() {
    this.intervalLoad = setInterval(() => {
      this.timeLoad++;
    }, 1000);
    this.loadDataBattle((data) => {
      this.intervalLoad = clearInterval(this.intervalLoad);
      if (data) {
        this.map = this.maps[data.map];
        if (data.enemy == "wild") {
          this.wildPokemons = this.getWildPokemonsInThisMap();
          this.teamEnemy = this.createWildTeam();
        } else {
          this.teamEnemy = data.enemy;
        }
        this.prepareTeam("hero", data.team);
        this.firstStylesToInit();
        this.store.dispatch("updateDataUser", {
          "data.onbattle": null,
        });
      } else {
        //regresar a /game
        this.$router.push("/game");
      }
    });
  },
  mounted() {
    store.state.background_sound = require("@/assets/sounds/" +
      this.config_battle["sound-background"]);
    store.state.disable_sound_for_browser = false;
  },
};
</script>

<style lang="scss">
@import "@/_basic.scss";
$backgroundMenu: rgba(0, 0, 0, 0.5);

@keyframes hitAnimation {
  0% {
    margin-right: 10px;
    margin-top: 10px;
  }
  50% {
    margin-right: 5px;
    margin-top: -10px;
  }
  100% {
    margin-right: 0px;
    margin-top: 0px;
  }
}
@keyframes girar {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes incrementar {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(2.5);
  }
}
.sound-icon-control {
  top: 45px;
}
.run-alert-content {
  width: 100%;
  min-width: 280px;
  text-align: center;

  @include flex(center, wrap, column);
  > h2 {
    padding: 20px;
    text-align: center;
  }

  > div > button {
    margin: 10px;
    padding: 10px;
    font-size: 17px;
    cursor: pointer;
    border: none;
    background: rgb(235, 235, 235);
    border-radius: 4px;
    &:hover {
      background: rgb(200, 200, 200);
    }
  }
}
.victory-battle {
  width: 40vw;
  min-width: 250px;
  max-width: 400px;
  @include flex(center, wrap);
  user-select: none;
  padding: 25px;

  .victory {
    width: 100%;
    @include flex(center, wrap);
    h1 {
      position: absolute;
      color: #000000;
      font-size: 1.7em !important;

      top: 150px;
      animation: incrementar 0.5s ease-in-out;
      animation-fill-mode: forwards;
      font-family: "Poppins";
    }
    > svg {
      color: #33f053;
    }
    button {
      background: #1576d1;
      color: white;
      font-size: 16px;
      height: 50px;
      width: 100%;
      cursor: pointer;
      border: none;
      margin-top: 50px;
      pointer-events: all;
      z-index: 99;
    }
    .pokemon-levels-up {
      width: 100%;
      @include flex(center, wrap);
      height: 60px;
      margin-top: 50px;
      list-style: none;
      h4 {
        font-size: 1.1em;
        color: #000000;
        font-family: "Poppins-light";
        width: 100%;
        text-align: center;
        margin-bottom: 5px;
      }
      li {
        @include flex(center);
        img {
          margin: 4px;
        }
      }
    }
  }
}
.evolving {
  h3 {
    text-align: center;
    width: 100%;
  }
  .buttons-evol {
    width: 100%;
    @include flex(space-around);
    button {
      padding: 10px;
    }
    .skip {
      background: #cc2626;
      color: white;
      font-size: 16px;
      height: 50px;
      width: 80px;
      cursor: pointer;
      border: none;
      margin-top: 30px;
      pointer-events: all;
      z-index: 99;
      border-radius: 6px;
    }
    .accept {
      background: #1576d1;
      color: white;
      font-size: 16px;
      height: 50px;
      width: 80px;
      cursor: pointer;
      margin-top: 30px;
      border: none;
      border-radius: 6px;
      pointer-events: all;
      z-index: 99;
    }
  }
}
.arrow-evolution {
  width: 50px;
  height: 35px;
  //rotar para que apunte hacia la derecha
  transform: rotate(90deg);
}
.container-evolving {
  width: 250px;
  height: auto;
  padding: 10px;
  @include flex(space-around);

  .pokemon-style {
    //@include flex(center, wrap);

    position: relative;
    .namepoke {
      width: auto;
      text-align: center;
      position: absolute;
      top: 100%;
    }
  }

  .container-before,
  .container-after {
    width: 100%;
    @include flex(center);
  }
}
.battle-field {
  .attack-hero {
    padding: 12px;
    height: 40px;
    text-align: center;
    display: flex;
    flex-wrap: wrap !important;
    font-size: 0.84em;
    .pp-atatck {
      width: 100%;
    }
    .name-attack {
      width: 100%;
    }
  }
  .layout-hidden {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: rgb(0, 0, 0);
    z-index: 10000000;
    @include flex(center);
    color: white;
    font-size: "nunito-bold";
    img {
      animation: girar 1s infinite;
    }
  }
  .death {
    opacity: 0;
  }
  .background-map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    pointer-events: none;
  }
  .hit {
    animation: hitAnimation 0.2s ease-in-out;
  }
  width: 100vw;
  height: 100vh;
  background-color: rgb(212, 212, 212);
  position: relative;
  @include flex(space-around, wrap);
  overflow: hidden;
  min-width: 310px;
  min-height: 600px;
  @keyframes deslizar-desde-la-derecha {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0%);
    }
  }
  .container-buttons-battle {
    .menu {
      width: 100%;
      height: 100%;
      //background: rgba(0, 0, 0, 0.596);
      position: absolute;
      color: white;
      @include flex(center);
      //deslizar desde la izquierda
      animation: deslizar-desde-la-derecha 0.4s ease-in-out;
      .close-menu {
        font-size: 20px;
        position: absolute;
        top: 10px;
        right: 50px;
        cursor: pointer;
        color: black;
        @include phones {
          top: 5px;
        }
      }
    }
    .fight-menu {
      > ul {
        list-style: none;
        @include flex(center, wrap);
        margin: 0 20px;
        > li {
          background: rgb(0, 0, 0);

          padding: 0 20px;
          @include flex(center);
          width: 100px;
          padding: 10px 0;
          margin: 2px;
          cursor: pointer;
          border-radius: 5px;
        }
      }
    }
    .team-menu {
      > ul {
        list-style: none;
        @include flex(center, wrap);
        background: rgba(0, 0, 0, 0.568);
        border-radius: 5px;
        > li {
          padding: 0 20px;
          @include flex(center);
          width: 100px;
          padding: 10px 0;
          margin: 2px;
          cursor: pointer;
        }
      }
    }
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding: 30px;
    //background: $backgroundMenu;
    @include flex(center, wrap);
    .btn-battle {
      box-shadow: 0px 2px 20px -6px rgba(0, 0, 0, 0.616);
      background: none;
      border: none;
      outline: none;
      padding: 10px;
      font-size: 19px;
      color: rgb(0, 0, 0);
      font-weight: 900;
      width: 20%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      margin: 5px;
      min-width: 140px;
      border-radius: 5px;

      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
      background: rgba(255, 255, 255, 0.5);
      font-family: "Poppins";
      height: 70px;
      @include flex(center, wrap, row, flex-start);
      @include phones {
        width: 40%;
        padding: 5px;
        font-size: 15px;
        @include flex(center, wrap);
        span {
          font-size: 10px;
        }
      }
      @media (max-width: 350px) {
        width: 25%;
      }

      span {
        width: 100%;
        font-size: 12px;
        color: rgb(0, 0, 0);
        font-weight: 900;
        margin-left: 10px;
        font-family: "Poppins-light";
        margin-top: 3px;
      }
      .title-button {
        @include flex(center);
      }
    }
  }
  .pokemon-container {
    @include flex(center);
    width: 100%;
    height: 150px;
    position: absolute;
    top: 45%;
    .info-pokemon {
      min-width: 190px;
      min-height: 150px;
    }
    #hero-stats,
    #enemy-stats {
      * {
        cursor: default;
      }
      margin-top: 7px;
      padding: 10px 15px;
      width: 17%;
      height: auto;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 200;
      top: -105%;
      color: white;
      display: flex;
      flex-direction: column;
      font-size: 11px;
      font-family: "nunito-bold";
      z-index: 1;
      position: absolute;
      max-width: 170px;
      @include flex(flex-start, wrap, column, flex-start);
      .container-name-level .types {
        @include flex(flex-start);
        margin-right: 2px;
        margin-bottom: 10px;

        img {
          width: 25px !important;
          margin-right: 2px;
          height: 12px !important;
        }
      }
      @include phones {
        width: 18%;
        top: -100%;
        height: auto;
        .container-name-level {
          .name {
            padding-right: 50% !important;
            height: 10px;
          }
        }
      }
    }
    #hero-stats {
      left: 20%;
      .username {
        position: absolute;
        bottom: -10px;
      }
      @include phones {
        left: 19%;
      }
    }
    #enemy-stats {
      right: 20%;
      @include phones {
        right: 19%;
      }
    }
  }
  .hero {
    position: absolute !important;
    left: 25%;
    transition: opacity 0.5s ease-in;
    .pokemon-information-tooltip {
      margin-left: 0px !important;
      transform: scale(0.8) !important;
    }
    @include phones {
      margin-left: 0px !important;
    }
    @media screen and (max-width: 400px) {
      left: 17%;
    }
  }
  .enemy {
    position: absolute !important;
    right: 25%;
    transition: opacity 0.5s ease-in;
    .pokemon-information-tooltip {
      margin-left: 0px !important;
      transform: scale(0.8) !important;
    }
    @media screen and (max-width: 400px) {
      right: 17%;
    }
    img {
      max-width: 160px !important;
    }
  }

  .hp-container,
  .xp-container {
    @include flex(center);
    position: relative;
    width: 100%;

    svg {
      font-size: 15px;
      margin-right: 5px;
    }
  }

  .contextualMenu {
    > li {
      padding: 3px;
      @include flex(flex-start, nowrap, row, center);
      width: 150px;
      margin-bottom: 0;
      &:hover {
        color: #e4e2e2;
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
//TRAIDO DE POKEMON V1
</style>
