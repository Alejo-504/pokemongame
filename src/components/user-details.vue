<template>
  <div class="user-detail">
    <div class="personal-data">
      <div class="trainer-logo" v-if="DATA?.sex">
        <Icons v-if="DATA.sex == 'male'" name="trainer.svg" size="110px" />
        <Icons
          v-if="DATA.sex == 'female'"
          name="female-trainer.svg"
          size="110px"
        />
      </div>
      <div class="container-info-trainer" v-if="store.state.DATA_USER">
        <div class="info-user">
          <h4><AccountCircle />{{ DATA.username }}</h4>
          <div class="coins"><img :src="coins" />{{ DATA.trainer?.coins }}</div>
          <div class="email">
            <span><Email /> {{ DATA.email }}</span>
          </div>
          <div class="container-detail">
            <div class="battle">
              <span
                ><Icons name="glove.svg" size="19px" />
                {{ DATA.trainer?.winnerBattles }}</span
              >
              <ToolTip on=".user-detail .info-user .battle" :await="0">
                Number of battles
              </ToolTip>
            </div>
            <div class="pokemon-storage-detail">
              <span
                ><Icons name="pokeball-group.svg" size="19px" />
                {{ DATA?.storagePokemon?.length }}</span
              >
              <ToolTip
                on=".user-detail .info-user .pokemon-storage-detail"
                :await="0"
              >
                Pokemon in storage
              </ToolTip>
            </div>
          </div>
        </div>
        <div class="level-view level-view-detail">
          <div class="level-number">
            <span class="text">Lv.</span>{{ LEVEL }}
          </div>
          <circle-progress
            :border-bg-width="9"
            :border-width="7"
            :size="48"
            :percent="porcent"
            id="exp-progress"
            empty-color="#000000"
          >
          </circle-progress>
        </div>
        <ToolTip
          on=".level-view-detail"
          :await="200"
          style="width: auto; text-overflow: ellipsis; white-space: pre"
        >
          <span class="text-exp">
            <Icons name="star.svg" size="22px" />
            {{ DATA.trainer?.exp }}
            {{
              LEVEL != levels["trainer-levels"].length - 2
                ? " / " + levels["trainer-levels"][Number.parseInt(LEVEL) + 1]
                : ""
            }}
          </span>
        </ToolTip>
      </div>
    </div>
    <div
      class="selector-sprites"
      v-if="generalconfig['ui-trainer-info-select-sprite']"
    >
      <div
        class="container-sprites"
        v-if="typeof store.state.DATA_USER?.data?.sprite == 'number'"
      >
        <button
          @click="sprite > 0 ? sprite-- : (sprite = configSprite.length - 1)"
        >
          <ArrowLeft />
        </button>
        <GetSprite
          class="sprite sprite-selected"
          :number="
            store.state.DATA_USER.data.sprite
              ? store.state.DATA_USER.data.sprite
              : toStartConfig['default-user-sprite']
          "
        />
        <button>
          <ArrowRight
            @click="sprite < configSprite.length - 1 ? sprite++ : (sprite = 0)"
          />
        </button>
        <h4>Character</h4>
      </div>
    </div>
  </div>
</template>
<script>
import coins from "@/assets/coins.png";
import { AccountCircle, Email, ArrowLeft, ArrowRight } from "mdue";
import store from "@/store/index.js";
import configSprite from "@/config/sprites.json";
import toStart from "@/config/toStart.json";
import generalconfig from "@/config/general.json";
import toStartConfig from "@/config/toStart.json";
export default {
  data() {
    return {
      toStartConfig,
      configSprite,
      store,
      coins,
      spriteDefault: toStart["default-user-sprite"],
      sprite: toStart["default-user-sprite"],
      direction: "bottom",
      actionSprite: "stop",
      generalconfig,
    };
  },
  props: {
    LEVEL: {
      type: Number,
      required: true,
    },
    DATA: {
      type: Object,
      required: true,
    },
    porcent: {
      type: Number,
      required: true,
    },
    levels: {
      type: Object,
      required: true,
    },
  },
  watch: {
    sprite(newval) {
      this.store.state.DATA_USER.data.sprite = newval;
      this.store.dispatch("updateDataUser", {
        "data.sprite": newval,
      });
    },
  },
  components: {
    ArrowRight,
    ArrowLeft,
    AccountCircle,
    Email,
  },
};
</script>
<style scoped lang="scss">
@import "@/_basic.scss";

.selector-sprites {
  @include flex(center, wrap, row, flex-start);
  margin-left: 37px;
  width: 100px;
  @include phones {
    margin-left: 0;
    width: 100%;
  }
  .container-sprites {
    width: 100%;
    @include flex(center, wrap);
    button {
      background: #000000;
      color: rgb(209, 209, 209);
      border: none;
      outline: none;
      font-size: 15px;
      padding: 3px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 900;
      @include flex(center);
    }
    h4 {
      width: auto;
      @include phones {
        width: 100%;
        text-align: center;
      }
    }
  }
  .sprite-selected {
    position: relative !important;
    @include flex(center, center, center, center);
    width: 100%;
    height: 100%;
    @include phones {
      width: 100%;
      height: 100%;
    }
  }
}
.user-detail {
  width: 500px;
  height: 400px;
  min-width: 270px;
  @include flex(flex-start, wrap, column, flex-start);
  @include phones {
    padding: 10px;
    width: 100%;
  }
}
.personal-data {
  @include flex(space-evenly, wrap, row, center);
  width: 100%;
  .trainer-logo {
    @include phones {
      width: 100%;
      margin-bottom: 10px;
    }
    @include flex(center);
  }
  .container-info-trainer {
    @include flex(space-between, wrap, row, flex-start);
    width: auto;
    min-width: 200px;
    height: 120px;
    color: rgb(0, 0, 0);

    .email {
      border-top: 1px solid #b10909;
      font-size: 14px;
      width: 230px;
      padding: 2px;
      margin-top: 14px;
      @include flex(flex-start);
      margin-left: 10px;
      @include scrollbar();
      overflow: auto;
      @include phones {
        font-size: 10px;
        width: 80%;
      }
      span {
        @include flex(center);
      }
      svg {
        margin-right: 5px;
        font-size: 20px;
      }
    }
    .info-user {
      @include phones {
        width: 100%;
      }
      .container-detail {
        @include flex(flex-start, wrap, row, center);
      }
      h4 {
        svg {
          margin-right: 5px;
          font-size: 20px;
        }
        margin-bottom: 5px;
        @include flex(flex-start);
        font-family: "Roboto-Black";
        font-size: 16px;
        width: 100%;
      }
      .coins {
        font-family: "bangers";
        font-size: 15px;
        @include flex(flex-start);
        margin-top: 5px;

        img {
          margin: 0 7px 0 10px;
          width: 17px;
          height: 17px;
        }
      }

      .battle,
      .pokemon-storage-detail {
        @include flex(flex-start);
        margin-top: 5px;

        span {
          @include flex(center);
          font-family: "nunito-bold";
          font-size: 12px;
          margin-left: 10px;
          img {
            margin-right: 5px;
          }
        }
      }
    }
    .text-exp {
      padding: 2px;
      @include flex(center);
    }
    .level-view {
      width: auto;
      height: 50px;
      border-radius: 50%;
      @include flex(center);
      position: relative;
      @include phones {
        position: absolute;
        top: 70px;
      }
      .level-number {
        font-size: 17px;
        font-family: "bangers";
        color: #000000;
        height: auto;

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
</style>
