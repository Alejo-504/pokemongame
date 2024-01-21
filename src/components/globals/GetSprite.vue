<template>
  <div
    class="sprite"
    :id="'sprite' + uuid"
    :style="`
      background-image: url(${image});
      width:${size}px;
      height:${size}px;
      background-position: ${topPositionInImage}px ${leftPositionInImage}px;
      top: ${position.top}px;
      left: ${position.left}px;
      display: ${view == 'battle' ? 'none' : 'flex'};
      `"
    v-if="number != undefined"
  >
    <div
      class="username"
      style="z-index: 300"
      name="sprite"
      :for="'sprite' + uuid"
      v-if="name"
    >
      <label :style="'background:' + colorStatus" class="status"></label>
      <span>{{ name }}</span>
    </div>
    <label
      class="chat"
      v-if="generalconfig['show-cloud-messages'] && talk && showTalk"
    >
      <div class="text-talk">{{ talk }}</div>
    </label>

    <slot></slot>
  </div>
</template>
<script>
import configSprite from "@/config/sprites.json";
import store from "@/store";
import generalconfig from "@/config/general.json";
let uuid = 0;
export default {
  props: {
    number: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: false,
      default: 55,
    },
    control: {
      type: Boolean,
      default: false,
    },
    colorStatus: {
      type: String,
      required: false,
      default: "",
    },
    cells_collisions: {
      type: Array,
      default: function () {
        return [];
      },
    },
    talk: {
      type: String,
      required: false,
    },
    speed: {
      type: Number,
      default: 100,
    },
    initialPosition: [Number, Array, Object],
    walkSize: {
      type: Number,
      default: 10,
    },
    name: {
      type: String,
      required: false,
    },
    tiles: {
      type: Object,
      required: false,
    },
    positionController: {
      type: Object,
      required: false,
    },
    external_motion_evt: { type: Object },
  },
  data() {
    return {
      showTalk: false,
      generalconfig,
      store,
      transitionSpeed: 0.3,
      uuid,
      configSprite,
      stepImageHorizontal: 4,
      step: 1,
      intervalAnimation: null,
      walkinterval: null,
      direction: "bottom",
      action: "stop",
      forzeStop: false,
      position: {
        top: "inherit",
        left: "inherit",
      },
      actionsON: { top: false, bottom: false, left: false, right: false },
      readyUpdateListenerStop: false,
      isTabActive: "visible",
    };
  },
  created() {
    uuid++;
  },

  mounted() {
    this.$nextTick(() => {
      if (this.name) {
        this.comprobeAction();

        if (this.control) {
          this.onSpriteMove();
        }
        this.initialPositioning("mounted");
        this.stop();
      }
      document.addEventListener("visibilitychange", () => {
        this.isTabActive = document.visibilityState;
      });
    });
  },
  watch: {
    isTabActive(newValue) {
      if (newValue == "hidden") {
        this.stopAllMove();
      }
    },
    number(sprite) {
      this.$emit("update", {
        action: "stop",
        direction: this.direction,
        top: this.position.top,
        left: this.position.left,
        sprite: sprite,
      });
    },
    talk(newValue) {
      if (newValue) {
        this.showTalk = true;
        setTimeout(() => {
          this.showTalk = false;
        }, generalconfig["cloud-messages-time"] * 1000);
      }
    },
    action() {
      this.comprobeAction();
    },

    actionsON: {
      handler(newVal, oldVal) {
        let allFalse = Object.values(newVal).every((val) => val == false);
        if (!allFalse) {
          this.action = "walk";
        } else {
          this.action = "stop";
        }
      },
      deep: true,
    },
    position: {
      handler(newVal, oldVal) {
        let diff = {
          top: Math.abs(newVal.left - oldVal.left),
          left: Math.abs(newVal.top - oldVal.top),
        };
        if (diff.top > this.tiles_size * 2 || diff.left > this.tiles_size * 2) {
          this.$el.style.transition = "none";
        }

        newVal.action = this.action;
        newVal.direction = this.direction;

        this.$emit("update", newVal);

        this.readyUpdateListenerStop = true;
      },
      deep: true,
    },
    external_motion_evt: {
      handler(newVal, oldVal) {
        if (newVal) {
          if (newVal.stop == true) {
            this.stopAllMove(true);
          }

          if (newVal.touch) {
            this.comprobeDirectionMove(newVal);
          }
          if (newVal.position && newVal.direction && newVal.action) {
            this.position = newVal.position;
            this.direction = newVal.direction;
            this.action = newVal.action;
          }
        }
      },
      deep: true,
    },
    speed() {
      if (this.control) {
        this.stop();
        this.walk();
        this.move();
      }

      //this.actionsON[actionOn] = true;
    },
    mapSelected(value) {
      if (this.name) {
        this.initialPositioning("mapSelected");
        this.deletePositionOld();
        this.stopAllMove(true);
      }
    },
  },
  methods: {
    deletePositionOld() {
      this.store.dispatch("updateDataUser", {
        "data.position": {},
      });

      if (this.store.state.DATA_USER.data) {
        this.store.state.DATA_USER.data.position = {};
      } else {
        this.store.state.DATA_USER.data = { position: {} };
      }
    },
    initialPositioning(ref) {
      let storagePosition = this.store.state.DATA_USER?.data?.position;

      if (
        storagePosition &&
        this.control &&
        this.generalconfig["memory-position"] &&
        storagePosition?.map == this.mapSelected
      ) {
        //opcion 1
        //out("opcion 1");
        this.position = {
          top: storagePosition.top,
          left: storagePosition.left,
        };
      } else if (this.control == false && this.initialPosition) {
        //opcion 2
        //out("opcion 2");
        this.position = this.initialPosition;
      } else if (
        this.initialPosition &&
        typeof this.initialPosition === "number"
      ) {
        //opcion 3
        //out("opcion 3");
        this.moveSpriteToCell(this.initialPosition);
      }
    },
    moveSpriteToCell(i) {
      let cells = document.querySelectorAll(".cell");
      cells[i].childNodes[0].style.position = "absolute";

      let top = cells[i].offsetTop;
      let left = cells[i].offsetLeft;

      top = top - this.$el.clientHeight / 2;
      left = left - this.$el.clientWidth / 2;
      left = left - cells[i].clientWidth / 2;

      this.position.top = top;
      this.position.left = left;
    },
    walk(speed) {
      let direction = this.direction;
      this.$el.style.transition = ` top ${this.transitionSpeed}s, left ${this.transitionSpeed}s linear`;
      //si position.top es texto obtener  pocision del sprite y establecerla
      if (typeof this.position.top == "string") {
        this.position.top = this.$el.offsetTop;
      }
      //si position.left es texto obtener  pocision del sprite y establecerla
      if (typeof this.position.left == "string") {
        this.position.left = this.$el.offsetLeft;
      }
      if (!this.walkinterval) {
        this.walkinterval = setInterval(() => {
          if (this.validateWalk(direction)) {
            if (direction == "left") {
              this.position.left -= this.walkSize;
            }
            if (direction == "top") {
              this.position.top -= this.walkSize;
            }
            if (direction == "right") {
              this.position.left += this.walkSize;
            }
            if (direction == "bottom") {
              this.position.top += this.walkSize;
            }
          } else {
            this.stopAllMove();
          }
        }, this.speed);
      }
    },
    move() {
      if (!this.control) {
        this.$el.style.transition = ` top ${this.transitionSpeed}s, left ${this.transitionSpeed}s linear`;
      }

      this.intervalAnimation = setInterval(() => {
        this.step++;
        if (this.step > this.stepImageHorizontal) {
          this.step = 1;
        }
      }, this.speed);
    },
    stop() {
      this.step = 1;
      clearInterval(this.intervalAnimation);
      clearInterval(this.walkinterval);
      this.walkinterval = null;

      if (this.readyUpdateListenerStop) {
        this.$emit("update", {
          action: "stop",
          direction: this.direction,
          top: this.position.top,
          left: this.position.left,
        });
      }
    },
    comprobeAction() {
      if (this.action == "move") {
        this.move();
      }
      if (this.action == "walk") {
        if (this.control) {
          this.walk(this.speed);
        }
        this.move();
      }
      if (this.action == "stop") {
        this.stop();
      }
    },
    onSpriteMove() {
      document.addEventListener("keydown", (event) => {
        if (this.forzeStop) {
          return;
        }
        if (event.key == "ArrowUp") {
          this.top();
        }
        if (event.key == "ArrowDown") {
          this.bottom();
        }
        if (event.key == "ArrowLeft") {
          this.left();
        }
        if (event.key == "ArrowRight") {
          this.right();
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.key == "ArrowLeft") {
          this.left("stop");
        }
        if (e.key == "ArrowUp") {
          this.top("stop");
        }
        if (e.key == "ArrowRight") {
          this.right("stop");
        }
        if (e.key == "ArrowDown") {
          this.bottom("stop");
        }
      });
    },
    top(mode = "run") {
      if (mode == "run") {
        if (this.action == "stop") {
          this.actionsON.top = true;
          this.direction = "top";
        }
      } else if (mode == "stop") {
        this.actionsON.top = false;
      }
    },
    bottom(mode = "run") {
      if (mode == "run") {
        if (this.action == "stop") {
          this.actionsON.bottom = true;
          this.direction = "bottom";
        }
      } else if (mode == "stop") {
        this.actionsON.bottom = false;
      }
    },
    left(mode = "run") {
      if (mode == "run") {
        if (this.action == "stop") {
          this.actionsON.left = true;
          this.direction = "left";
        }
      } else if (mode == "stop") {
        this.actionsON.left = false;
      }
    },
    right(mode = "run") {
      if (mode == "run") {
        if (this.action == "stop") {
          this.actionsON.right = true;
          this.direction = "right";
        }
      } else if (mode == "stop") {
        this.actionsON.right = false;
      }
    },
    getDistanceFromSpriteTo(cell_touch) {
      let cells = document.querySelectorAll(".cell");

      let top = cells[cell_touch].offsetTop - this.$el.offsetTop;
      let left = cells[cell_touch].offsetLeft - this.$el.offsetLeft;
      top += cells[cell].clientHeight;
      left += cells[cell].clientWidth;

      return {
        top,
        left,
      };
    },
    comprobeDirectionMove(evt) {
      evt = evt.touch;
      let toque = { X: evt.touches[0].clientX, Y: evt.touches[0].clientY };
      let spritePos = this.$el.getBoundingClientRect();
      spritePos = { X: spritePos.x, Y: spritePos.y };

      let distance = {
        X: toque.X - spritePos.X,
        Y: toque.Y - spritePos.Y,
      };

      if (Math.abs(distance.X) > Math.abs(distance.Y)) {
        if (distance.X > 0) {
          this.right();
        } else {
          this.left();
        }
      } else {
        if (distance.Y > 0) {
          this.bottom();
        } else {
          this.top();
        }
      }
    },
    stopAllMove(forze = false) {
      this.action = "stop";
      this.actionsON.top = false;
      this.actionsON.bottom = false;
      this.actionsON.left = false;
      this.actionsON.right = false;

      if (forze) {
        this.forzeStop = true;
        setTimeout(() => {
          this.forzeStop = false;
        }, 800);
      }
    },
    getCellSprite(position, output_row_col = false) {
      let pos = position;
      let sprite = document.querySelector("#mysprite");
      if (sprite == null) return null;

      let spriteSize = {
        width: sprite.clientWidth,
        height: sprite.clientHeight,
      };

      let posleft = pos.left + spriteSize.width;
      let postop = pos.top + spriteSize.height;

      let col = Math.floor(posleft / this.tiles.size);
      let row = Math.floor(postop / this.tiles.size);

      if (output_row_col) return { row, col };

      return row * this.tiles.column + col;
    },
    validateWalk(directionMove) {
      let cell = this.getCellSprite(this.position);

      let next_tile;
      if (directionMove == "top") {
        next_tile = cell - this.tiles.column;
      } else if (directionMove == "bottom") {
        next_tile = cell + this.tiles.column;
      } else if (directionMove == "left") {
        next_tile = cell - 1;
      } else if (directionMove == "right") {
        next_tile = cell + 1;
      }

      if (this.cells_collisions.indexOf(next_tile) == -1) {
        return true;
      } else {
        return false;
      }
    },
  },
  computed: {
    view() {
      return this.store.state.view;
    },
    mapSelected() {
      return this.store.state.mapSelected;
    },
    leftPositionInImage() {
      if (this.direction == "bottom") {
        return 0;
      } else if (this.direction == "right") {
        return -this.size;
      } else if (this.direction == "top") {
        return -this.size * 2;
      } else if (this.direction == "left") {
        return -this.size * 3;
      } else {
        return null;
      }
    },
    topPositionInImage() {
      if (this.step == 1) {
        return 0;
      } else if (this.step == 2) {
        return -this.size;
      } else if (this.step == 3) {
        return -this.size * 2;
      } else if (this.step == 4) {
        return -this.size * 3;
      } else {
        return null;
      }
    },
    image() {
      return require("@/assets/sprites/" + this.configSprite[this.number].name);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.sprite {
  background-size: 400%;
  background-repeat: no-repeat;
  image-rendering: crisp-edges;
  position: absolute !important;
  @include flex(center);
  z-index: 25;
}
.sprite .username {
  position: absolute;
  top: -13px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 10px;
  padding: 3px;
  border-radius: 5px;
  font-family: "nunito-light";
  user-select: none;
  z-index: 300;
  height: 8px;
  display: flex;
  span {
    margin-top: -1px;
  }
  .status {
    border-radius: 50%;
    width: 7px;
    height: 7px;

    margin-right: 2px;
  }
}
.chat {
  padding: 4px;
  transition: all 5s ease-in;
  width: auto;
  height: auto;
  min-width: 70px;
  max-width: 120px;
  max-height: 60px;
  background-color: rgba(20, 20, 20, 0.685);
  box-shadow: 10px 10px 33px -17px rgba(0, 0, 0, 0.75);
  position: absolute;
  z-index: 30;
  bottom: calc(100% + 15px);
  font-size: 11px;
  border-radius: 7px;
  font-family: "Roboto-Regular";
  text-align: center;
  overflow: hidden;
  margin-bottom: 0;
  margin: 0;

  &::-webkit-scrollbar {
    width: 1.5px !important;
    height: 1.5px !important;
    margin-left: -19px !important;
  }
  > div {
    @include scrollbar("y", rgba(212, 212, 212, 0.897));
    max-width: 110px;
    max-height: 50px;
    width: 100%;
    height: 100%;
    margin-bottom: 0;
  }
}
</style>
