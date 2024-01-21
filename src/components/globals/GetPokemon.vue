<template>
  <div :id="'pokemon-' + uuid" class="pokemon-style">
    <ToolTip
      :css="{
        background: '#FAFAFA',
        padding: '0px',
      }"
      :arrow="false"
      rounded="10px"
      v-if="features"
      :on="'#pokemon-' + uuid"
      :await="infoAwait"
      :beforeShow="closeAllContextMenu"
      class="pokemon-information-tooltip"
      :trigger="infoTrigger"
      :modifiers="infoModifiers"
      :placement="infoPlacement"
    >
      <div
        :class="stats != 'base' ? 'info-pokemon battle' : 'info-pokemon base'"
      >
        <div class="backform"></div>
        <section class="header">
          <div class="pos-left">
            <div class="line-title">
              <h3 class="name">
                {{ features?.name }}
              </h3>
              <span v-if="stats != 'base'" class="nature-name"
                >({{ features?.nature?.name }})</span
              >
            </div>
            <ul class="types">
              <li v-for="type in features?.types" v-bind:key="type">
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
            <div :id="'level-pokemon-' + uuid" class="level">
              <div class="lv">Lv</div>
              {{ this.level }}
            </div>
          </div>
        </section>
        <section class="body">
          <div
            class="stats"
            v-if="
              hp &&
              speed &&
              specialAttack &&
              specialDefense &&
              attack &&
              defense
            "
          >
            <h2 class="statTitle">
              {{ this.stats == "base" ? "Base Stats" : "Battle Stats" }}
            </h2>
            <ProgressBar class="progressbar" :value="hp" color="#ff7979">
              <template v-slot:left>
                <CardsHeart />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat" v-if="hp">{{ hp }} </span
                  ><span v-if="stats != 'base'" class="value-iv">
                    <span class="iv-header" v-if="features.iv">IV</span
                    >{{ features?.iv.hp }}</span
                  >
                </div>
              </template>
              <template v-slot:center> Hp </template>
            </ProgressBar>
            <ProgressBar class="progressbar" :value="attack" color="#ffbe76">
              <template v-slot:left>
                <SwordCross />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat">{{ attack }} </span
                  ><span v-if="stats != 'base'" class="value-iv">{{
                    features?.iv.attack
                  }}</span>
                </div>
              </template>
              <template v-slot:center> Attack </template>
            </ProgressBar>

            <ProgressBar
              class="progressbar"
              :value="specialAttack"
              color="#f6e58d"
            >
              <template v-slot:left>
                <Sword />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat">{{ specialAttack }} </span
                  ><span v-if="stats != 'base'" class="value-iv">{{
                    features?.iv["special-attack"]
                  }}</span>
                </div>
              </template>
              <template v-slot:center> Special attack </template>
            </ProgressBar>

            <ProgressBar class="progressbar" :value="defense" color="#c7ecee">
              <template v-slot:left>
                <Shield />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat">{{ defense }} </span
                  ><span v-if="stats != 'base'" class="value-iv">{{
                    features?.iv.defense
                  }}</span>
                </div>
              </template>
              <template v-slot:center> Defense </template>
            </ProgressBar>
            <ProgressBar
              class="progressbar"
              :value="specialDefense"
              color="#D6A2E8"
            >
              <template v-slot:left>
                <ShieldHalfFull />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat">{{ specialDefense }} </span
                  ><span v-if="stats != 'base'" class="value-iv">{{
                    features?.iv["special-defense"]
                  }}</span>
                </div>
              </template>
              <template v-slot:center> Special defense </template>
            </ProgressBar>
            <ProgressBar class="progressbar" :value="speed" color="#badc58">
              <template v-slot:left>
                <WeatherWindy />
              </template>
              <template v-slot:right>
                <div class="values-right">
                  <span class="value-stat">{{ speed }} </span
                  ><span v-if="stats != 'base'" class="value-iv">{{
                    features?.iv.speed
                  }}</span>
                </div>
              </template>
              <template v-slot:center> Speed </template>
            </ProgressBar>
          </div>
        </section>
      </div>
    </ToolTip>
    <img
      draggable="false"
      :src="
        staticPokemon
          ? require('@/assets/pokemonStore/' + getSprite().toString() + '.webp')
          : require('@/assets/pokegif/' + getSprite().toString() + '.webp')
      "
      alt=""
      :style="'width:' + width + '; height:' + height + ';'"
    />
    <slot></slot>
  </div>
</template>
<script>
import pokedex from "@/config/pokemon_data/pokedex.json";
import natures from "@/config/pokemon_data/natures.json";
import moves from "@/config//pokemon_data/moves.json";

let uuid = 0;
import {
  CardsHeart,
  SwordCross,
  Shield,
  WeatherWindy,
  Sword,
  ShieldHalfFull,
} from "mdue";
import levelup_config from "@/config/levelup.json";

const toHex = require("colornames");
export default {
  data() {
    return {
      levelup_config,
      features: null,
      pokedex,
      el: this.$el,
      uuid,
      loadFeatures: false,
      currentToken: this.token ? this.token : null,
    };
  },
  components: {
    CardsHeart,
    SwordCross,
    Shield,
    Sword,
    WeatherWindy,
    ShieldHalfFull,
  },
  props: {
    infoCss: {
      type: Object,
      required: false,
    },
    infoTrigger: {
      type: Array,
      default() {
        return [["click", "click:out"]];
      },
    },
    token: {
      type: String,
      required: false,
    },
    infoAwait: {
      type: Number,
      default: 100,
    },
    call: {
      type: [Array, Number, String, Object],
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    moves: {
      type: Array,
      required: false,
    },
    stats: {
      type: [String, Object],
      default: "base",
    },
    infoModifiers: {
      type: Object,
      required: false,
    },
    infoPlacement: {
      type: String,
      default: "auto",
    },
    width: { type: String, default: "80%" },
    height: { type: String, default: "80%" },

    staticPokemon: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    attack() {
      return this.getStat("attack");
    },
    defense() {
      return this.getStat("defense");
    },
    specialAttack() {
      return this.getStat("special-attack");
    },
    specialDefense() {
      return this.getStat("special-defense");
    },
    hp() {
      return this.getStat("hp");
    },
    speed() {
      return this.getStat("speed");
    },
  },
  methods: {
    validateHeroEvolution(hero) {
      if (!hero.evolution_preference || hero.evolution_preference == "accept") {
        let level_evolution = this.pokedex[hero.key].evolution;

        if (level_evolution) {
          if (level_evolution.trigger == "level") {
            let evo_level = level_evolution.detail;
            let evo_id = level_evolution.id;
            if (hero.level >= evo_level) {
              return evo_id - 1; //key del pokemon en el pokedex
            }
          }
        }
      }
      return false;
    },
    getExpForLevel(lv) {
      return this.levelup_config["pokemon-levels"][lv - 1];
    },
    closeAllContextMenu() {
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
    async getPokeApiData(id, link = "") {
      let countRequest = 0;
      id = id;
      let retorno;
      while (countRequest < 3) {
        try {
          retorno = await fetch(
            "https://pokeapi.co/api/v2" + link + "/" + id
          ).then(async (response) => {
            if (response.ok) {
              countRequest = 3;
              return await response.json();
            } else {
              if (countRequest == 3) {
                return null;
              }
              countRequest++;
              throw (
                "No se puedo traer informacion de " +
                id +
                " de pokeApi" +
                countRequest
              );
            }
          });
        } catch (error) {
          countRequest++;
          console.log(error);
        }
      }
      return retorno;
    },
    getSprite() {
      return this.getKey() + 1;
    },
    getKey(call = null) {
      call = call == null ? this.call : call;
      let key = this.call;
      function fromNameAKey(key) {
        let name =
          key.charAt(0).toUpperCase() +
          key.substring(1, key.length).toLowerCase();
        key = pokedex.findIndex((x) => {
          let nameX =
            x.name.charAt(0).toUpperCase() +
            x.name.substring(1, x.name.length).toLowerCase();

          if (nameX == name) {
            return x;
          }
        });
        return key;
      }
      if (typeof key == "string") {
        return fromNameAKey(key);
      } else if (typeof key == "object" && !Array.isArray(key)) {
        key =
          typeof key.pokemon == "string"
            ? fromNameAKey(key.pokemon)
            : key.pokemon - 1;
        return key;
      } else if (Array.isArray(key)) {
        if (typeof key[0] == "string") {
          return fromNameAKey(key[0]);
        } else {
          return key[0] - 1;
        }
      } else if (typeof key == "number") {
        key = key - 1;
        return key;
      }
    },
    getMoves(id) {
      let c2 = 0;
      let c = 0;
      let movesArray = [];
      let movesArray2 = [];

      let movesAssigned = this.moves;
      for (let move of moves) {
        if (!movesAssigned) {
          move.type = move.type.charAt(0).toUpperCase() + move.type.slice(1);
          if (
            pokedex[id].type[0] == move.type ||
            pokedex[id].type[1] == move.type
          ) {
            movesArray[c] = move;
            c++;
          }
        } else {
          for (let i in movesAssigned) {
            if (movesAssigned[i] == move.name) {
              movesArray[c] = move;
              c++;
            }
          }
        }
      }
      while (c2 < 4) {
        movesArray2[c2] = movesArray[c2];
        c2++;
      }
      return movesArray2;
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    firstLetterMay(string) {
      return (
        string.charAt(0).toUpperCase() + string.substring(1, string.length)
      );
    },
    shadeColor(color, percent) {
      var f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff;
      return (
        "#" +
        (
          0x1000000 +
          (Math.round((t - R) * p) + R) * 0x10000 +
          (Math.round((t - G) * p) + G) * 0x100 +
          (Math.round((t - B) * p) + B)
        )
          .toString(16)
          .slice(1)
      );
    },
    whiteAndBlack(text) {
      // Convirtiendo String Hexadecimal a RGB
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(text);
      var rgb = result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
      //Formula que determinara el color blanco o negro de las letras
      return this.contrast(rgb);
    },
    contrast(rgb) {
      let C = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

      for (var i = 0; i < C.length; ++i) {
        if (C[i] <= 0.03928) {
          C[i] = C[i] / 12.92;
        } else {
          C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4);
        }
      }
      let L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];

      if (L > 0.179) {
        return "black";
      } else {
        return "white";
      }
    },
    getStat(stat) {
      return this.stats == "base"
        ? this.features.base[stat]
        : this.features[stat];
    },
    setStat(stat, hero, calculateMaxLevel = false) {
      let iv = hero.iv ? hero.iv[stat] : 1;
      let base = hero.base[stat];
      let level = calculateMaxLevel == true ? 100 : hero.level;
      let effect = 1;
      let ev = hero.effort[stat.toLowerCase()];
      if (hero.nature.increased && hero.nature.decreased) {
        if (hero.nature.increased.name == stat) {
          effect = 1.1;
        } else if (hero.nature.decreased.name == stat) {
          effect = 0.9;
        }
      }

      let res = (((2 * base + iv + ev / 4) * level) / 100 + 5) * effect;
      return Math.round(res);
    },
    getHP(base, ev, level, iv, calculateMaxLevel = false) {
      level = calculateMaxLevel == true ? 100 : level;
      return Math.floor(((2 * base + iv + ev / 4) * level) / 100 + level + 10);
    },
    createBaseStats(
      data_pokedex,
      data_pokeapi,
      key,
      baseStats = [
        "key",
        "name",
        "id",
        "base",
        "moves",
        "types",
        "specie",
        "color",
        "level",
        "colorText",
        "attackPP",
      ]
    ) {
      let moves = this.getMoves(key);

      let data = {};
      for (let i = 0; i < baseStats.length; i++) {
        switch (baseStats[i]) {
          case "key":
            data.key = key;
            break;
          case "name":
            data.name = data_pokedex[key].name;
            break;
          case "id":
            data.id = data_pokedex[key].id;
            break;
          case "base":
            data.base = data_pokedex[key].base;
            data.base.Experience = data_pokeapi.base_experience;
            break;
          case "moves":
            data.moves = moves;
            break;
          case "types":
            data.types = data_pokedex[key].type;
            break;
          case "specie":
            data.specie = data_pokeapi.species.name;
            break;
          case "color":
            data.color = data_pokedex[key].color;
            break;
          case "level":
            data.level = this.level;
            break;
          case "colorText":
            data.colorText = data_pokedex[key].color;
            break;
          case "attackPP":
            data.attackPP = {
              max: [moves[0].pp, moves[1].pp, moves[2].pp, moves[3].pp],
              current: [moves[0].pp, moves[1].pp, moves[2].pp, moves[3].pp],
            };
            break;
        }
      }
      return data;
    },
    createBattleStats(
      pokemon,
      data_pokeapi,
      battleStat = [
        "experience",
        "nature",
        "iv",
        "effort",
        "attack",
        "defense",
        "special-attack",
        "special-defense",
        "speed",
        "hp",
      ]
    ) {
      for (let stat = 0; stat < battleStat.length; stat++) {
        switch (battleStat[stat]) {
          case "nature":
            let data_nature = natures[this.getRandomInt(1, 25)];
            pokemon.nature = {
              increased: data_nature.increased_stat,
              decreased: data_nature.decreased_stat,
              name: data_nature.name,
            };
            break;
          case "iv":
            pokemon.iv = {
              hp: this.getRandomInt(1, 32),
              attack: this.getRandomInt(1, 32),
              defense: this.getRandomInt(1, 32),
              "special-attack": this.getRandomInt(1, 32),
              "special-defense": this.getRandomInt(1, 32),
              speed: this.getRandomInt(1, 32),
            };

            break;
          case "effort":
            pokemon.effort = {
              hp: data_pokeapi.stats[0].effort,
              attack: data_pokeapi.stats[1].effort,
              defense: data_pokeapi.stats[2].effort,
              "special-attack": data_pokeapi.stats[3].effort,
              "special-defense": data_pokeapi.stats[4].effort,
              speed: data_pokeapi.stats[5].effort,
            };
          case "experience":
            pokemon.experience = this.getExpForLevel(this.level);
            break;
          case "attack":
            pokemon.attack = this.setStat("attack", pokemon);
            break;
          case "defense":
            pokemon.defense = this.setStat("defense", pokemon);
            break;
          case "special-attack":
            pokemon["special-attack"] = this.setStat("special-attack", pokemon);
            break;
          case "special-defense":
            pokemon["special-defense"] = this.setStat(
              "special-defense",
              pokemon
            );
            break;
          case "speed":
            pokemon.speed = this.setStat("speed", pokemon);
            break;
          case "hp":
            pokemon.hp = this.setStat("hp", pokemon);
            break;
        }
      }
      return pokemon;
    },
    async createPokemon(features) {
      let key = this.getKey();
      let dataPokeApi = await this.getPokeApiData(key + 1, "/pokemon");
      let base = this.createBaseStats(pokedex, dataPokeApi, key);

      if (typeof features == "string") {
        switch (features) {
          case "base":
            return base;
          case "battle":
            let battle = this.createBattleStats(base, dataPokeApi);
            return battle;
        }
      } else if (typeof features == "object") {
        if (!features.attack) {
          //no estan creadas las stat de batalla
          features = this.createBattleStats(base, dataPokeApi);
          return features;
        } else {
          // let update = this.updateFeatures(features);
          //return { ...features, ...update };
          return features;
        }
      }
    },
    applyStyleToPokemonInfo(circle, minicircle) {
      this.features.color = toHex(pokedex[this.features.key].color);
      let background = this.shadeColor(this.features.color, -0.05);
      let color = this.whiteAndBlack(this.features.color);
      circle.style.borderTop = color + " solid 3px";
      circle.style.borderRight = color + " solid 3px";
      circle.style.background = background;
      minicircle.style.background = background;
      minicircle.style.color = color;
    },
    loadFeaturesDone() {
      let id = "#pokemon-" + this.uuid;
      this.loadFeatures = true;
      let circle = document.querySelector(id + " .backform");
      let minicircle = document.querySelector(id + " .lv");
      let infopokemon = document.querySelector(id + " .info-pokemon");
      if (this.infoCss) {
        cssApply(infopokemon, this.infoCss);
      }
      if (circle && minicircle) {
        this.applyStyleToPokemonInfo(circle, minicircle);
      }
      this.$emit("loaded", {
        id: id.substring(1, id.length),
        features: this.features,
      });
    },
    getEvolution(evo) {
      return new Promise(async (res, rej) => {
        let resp = await this.getPokeApiData(evo + 1, "/pokemon");
        let base = this.createBaseStats(pokedex, resp, evo);
        base.nature = this.features.nature;
        base.iv = this.features.iv;
        let battle = this.createBattleStats(base, resp, [
          "effort",
          "attack",
          "defense",
          "special-attack",
          "special-defense",
          "speed",
          "hp",
        ]);
        battle.currentHp = battle.hp;
        return res({ ...base, ...battle });
      });
    },
    dataPokemonLoad() {
      new Promise(async (res, rej) => {
        this.features = await this.createPokemon(this.stats);
        if (this.features) {
          res();
        }
      }).then(() => {
        this.loadFeaturesDone();
      });
    },
    isLevelUp() {
      this.features.level = this.level;
      let update = this.updateFeatures(this.features);
      this.features = {
        ...this.features,
        ...update,
      };
      this.$emit("levelup", this.features);
      let evo = this.validateHeroEvolution(this.features);
      if (typeof evo == "number") {
        evo = this.getEvolution(evo);
        this.$emit("isEvolving", evo);
      }
    },
    updateFeatures(features) {
      return {
        attack: this.setStat("attack", features),
        defense: this.setStat("defense", features),
        "special-defense": this.setStat("special-defense", features),
        "special-attack": this.setStat("special-attack", features),
        speed: this.setStat("speed", features),
        hp: this.setStat("hp", features),
      };
    },
  },
  watch: {
    token() {
      this.dataPokemonLoad();
      this.currentToken = this.token;
    },
    level(newval, oldval) {
      if (this.token == this.currentToken) {
        this.isLevelUp();
      }
    },
  },
  async created() {
    uuid++;
  },
  async mounted() {
    this.dataPokemonLoad();
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.pokemon-style {
  @include flex(center);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
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
  image-rendering: crisp-edges;
}
.info-pokemon {
  position: relative;
  width: 210px;
  height: auto;
  z-index: 999;
  box-shadow: 0px 2px 20px -6px rgba(0, 0, 0, 0.616);
  background: #34495e;
  border-radius: 10px;
  padding: 10px;
  padding-top: 5px;
  color: rgb(255, 255, 255);
  font-size: 9px;
  transform: scale(1);
  @include flex(flex-start, wrap);

  .progressbar .values-right {
    width: 30% !important;
    @include flex(flex-start);
    position: relative;
    text-align: center;
    .iv-header {
      position: absolute;
      top: -20px;
      font-size: 1em;
      // background: #fdfdfd;
      color: rgb(85, 82, 255);
      font-weight: 900;
      text-align: center;
      width: 1em;
      height: 1em;
      background: #272727;
      padding: 0.5em;
      border-radius: 50%;
      font-family: "Roboto-Black";
    }
    .value-iv {
      width: auto;
      height: auto;
      @include flex(center);
      position: absolute;
      right: -2em;
      font-size: 0.85em;

      border-radius: 50%;
      margin-right: -5px;
      color: rgb(38, 57, 230);
      text-align: center;
    }
    .value-stat {
      font-size: 0.85em;
      width: 20px;
    }
  }
  .nature-name {
    margin-left: 10px;
    font-size: 1.1em;
  }
  .line-title {
    @include flex(flex-start);
  }
  .header {
    height: 30%;
    width: 100%;

    @include flex(space-between);

    .pos-left {
      width: 50%;
    }
    .pos-left .name {
      font-size: 1.6em;
      font-family: "nunito-bold";
    }
    .pos-right {
      height: 100%;
      margin-top: 10px;
      margin-right: 5px;
      width: 10%;
      .level {
        width: 100%;
        height: 45%;
        border-radius: 0px 200px 200px 200px;
        border: 1px inset #000000;
        @include flex(center);
        font-size: 1.6em;
        font-family: "Roboto-Black";
        position: relative;
        background: #34495e;
        color: white;
        padding: 2px;
        .lv {
          position: absolute;
          top: -20%;
          left: -55%;
          padding: 8%;
          border-radius: 50%;
          font-size: 0.8em;
          @include flex(center);
          font-family: "Roboto-Black";
        }
      }
    }
  }

  .body {
    @include flex(space-around);
    width: 100%;
    height: auto;
    margin: 5% 0;
    .stats {
      width: 90%;
      height: auto;
      padding: 5px 0;
      height: 86%;
      background: rgb(255, 255, 255);
      box-shadow: 0px 2px 10px -6px rgb(0, 0, 0);
      border-radius: 8px;
      @include flex(center, wrap);
      position: relative;
      margin-bottom: 2px;
      .statTitle {
        font-size: 1em;
        font-family: "nunito-bold";
        position: absolute;
        top: -13%;
        color: rgb(255, 255, 255);
      }
      .progressbar {
        width: 60%;
        box-shadow: 0px 0px 5px -6px rgb(0, 0, 0);
        height: 13px;
        margin-left: -18px;
        margin-bottom: 2px;
      }
    }
  }
  .types {
    height: 10%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-left: -3px;
    list-style: none;
    flex-direction: row !important;
    li {
      width: auto;
      height: 10%;
      margin-right: -11px;
      &:hover {
        background: transparent;
      }
      img {
        width: 70%;
        height: 53%;
      }
    }
  }
}
.pokemon-information-tooltip {
  z-index: 10000;
}
</style>
