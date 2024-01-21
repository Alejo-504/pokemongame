<template>
  <div class="list-medals" v-if="store.state.DATA_USER">
    <div
      v-for="(medal, index) in medals"
      v-bind:key="medal"
      class="medal"
      :id="'medal-' + medal.name.replaceAll(' ', '-') + uuid.toString() + index"
    >
      <img
        draggable="false"
        :src="
          medal.src
            ? require('@/assets/medals/' + medal.src)
            : require('@/assets/medals/default.png')
        "
        :style="
          (checkIfAllRequirementsAreMet(medal.required) == false
            ? 'filter: grayscale(100%);'
            : '') +
          'width:' +
          (medal.width ? medal.width : width) +
          '; height:' +
          (medal.height ? medal.height : height) +
          ';'
        "
        alt="medalla pokemon"
      />

      <ToolTip
        :await="200"
        :on="
          '#medal-' + medal.name.replaceAll(' ', '-') + uuid.toString() + index
        "
        theme="light"
        :css="{
          boxShadow: '0 0 20px -5px black',
        }"
      >
        <ul class="tooltip-medal">
          To obtain this medal you must complete the following actions:
          <li v-for="req in getRequeriments(medal.required)" v-bind:key="req">
            {{ req }}
          </li>
        </ul>
      </ToolTip>

      <h3>{{ medal.name }}</h3>
    </div>
  </div>
</template>
<script>
import medals from "@/config/medals";
import store from "@/store/index";

import { pushmsg } from "@/components/globals/scripts/PushMsg.js";
let uuid = 0;

export default {
  props: {
    width: { type: String, default: "75px" },
    height: { type: String, default: "85px" },
  },
  methods: {
    checkIfAllRequirementsAreMet(required) {
      let keys = Object.keys(required);
      for (let i in keys) {
        if (required[keys[i]] > this[keys[i]]) {
          return false;
        }
      }
      return true;
    },

    getRequeriments(required) {
      let requeriments = [];
      if (required.win) {
        requeriments.push(
          "- Win " +
            required.win +
            " battle" +
            (required.win > 1 ? "s" : "") +
            (required.win > this.win ? " /" + this.win : "")
        );
      }
      if (required.win_in_a_row) {
        requeriments.push(
          "- Win " +
            required.win_in_a_row +
            " battles in a row " +
            (required.win_in_a_row > this.win_in_a_row
              ? " /" + this.win_in_a_row
              : "")
        );
      }
      return requeriments;
    },
    scanMedalRequeriments() {
      let getMedals = [];
      for (let i in medals) {
        if (this.checkIfAllRequirementsAreMet(medals[i].required) == true) {
          getMedals.push(medals[i]);
        }
      }
      return getMedals;
    },
    pushNewMedalsNotification(earn) {
      if (earn.length > 0) {
        let i = earn.length - 1;

        let openNotification = (name) => {
          let medallas_notificadas = this.store.state.DATA_USER.medals.earns;
          let notificacion_done = false;
          for (let i in medallas_notificadas) {
            if (medallas_notificadas[i] == name) {
              notificacion_done = true;
              break;
            }
          }
          if (!notificacion_done) {
            this.pushmsg.open(
              "newMedals",
              "Congratulations! has won the medal: " + name
            );

            this.store.state.DATA_USER.medals.earns.push(name);
            this.store.dispatch("updateDataUser", {
              "medals.earns": this.store.state.DATA_USER.medals.earns,
            });
          }
        };
        openNotification(earn[i].name);
        let interval = setInterval(() => {
          i--;
          if (i < 0) {
            clearInterval(interval);
          } else {
            openNotification(earn[i].name);
          }
        }, 6000);
      }
    },
    restartNotifications() {
      this.store.state.DATA_USER.medals.earns = [];
      this.store.dispatch("updateDataUser", {
        "medals.earns": this.store.state.DATA_USER.medals.earns,
      });
    },
  },
  watch: {
    win() {
      let earn = this.scanMedalRequeriments();
      this.pushNewMedalsNotification(earn);
    },
    win_in_a_row() {
      let earn = this.scanMedalRequeriments();
      this.pushNewMedalsNotification(earn);
    },
  },
  computed: {
    win() {
      return store.state.DATA_USER?.medals?.triggers?.win;
    },
    win_in_a_row() {
      return store.state.DATA_USER?.medals?.triggers?.win_in_a_row;
    },
  },
  data() {
    return {
      pushmsg,
      requeriments: [],
      uuid,
      medals,
      store,
    };
  },
  created() {
    uuid++;
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.tooltip-medal {
  list-style: none;
  width: 190px;
  li {
    font-weight: 900;
    margin-left: 10px;
    margin-top: 5px;
  }
}
.list-medals {
  padding: 10px 10px 35px 10px;
  height: auto;
  width: auto;
  min-height: 200px;

  max-width: 600px;
  @include scrollbar("y", #888888, rgba(255, 21, 21, 0.801), #888888);
  @include flex(center, wrap);
  overflow: auto;
  @include phones {
    padding: 5px;
  }
}
.medal {
  &:hover {
    img {
      transition: all ease-in-out 0.2s;
      transform: scale(1.05);
    }
  }

  /*background: rgba(232, 232, 232, 0);
  background: linear-gradient(
    0deg,
    rgba(232, 232, 232, 1) 0%,
    rgba(245, 245, 245, 1) 45%,
    rgba(255, 255, 255, 1) 65%,
    rgba(223, 223, 223, 1) 100%
  );
  transition: all ease-in-out 0.2s;
  &:hover {
    box-shadow: 0px 0px 30px 0px rgb(167, 167, 167);
    img {
      transition: all ease-in-out 0.2s;
      transform: scale(1.05);
    }
  }
  box-shadow: 0px 0px 10px 0px rgb(167, 167, 167); */

  margin: 15px;
  @include phones {
    margin: 5px;
  }
  border-radius: 5px;
  @include flex(center, wrap);

  width: 100px;
  min-width: 100px;
  min-height: 100px;
  img {
    user-select: none;
    pointer-events: none;
  }
  h3 {
    color: rgb(48, 47, 47);
    font-size: 10px;
    font-family: "Roboto-Black";
    width: 100%;
    text-align: center;
  }
}
</style>
