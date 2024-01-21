<template>
  <div class="field-run">
    <img
      :id="'gif-pokemon-' + uuid"
      :src="src"
      :style="`
      width:${sizeGif.width}; 
      height:${sizeGif.height};
      ${runTo == 'left' ? 'left: 100%;' : ''}
      ${runTo == 'right' ? 'left: -' + sizeGif.width + ';' : ''}
      top:${top + '%;'}
      z-index: ${top};
    `"
    />
  </div>
</template>
<script>
var uuid = 0;
const $ = require("jquery");
export default {
  props: {
    inverted: {
      type: Boolean,
      default: false,
    },
    noloop: {
      type: Boolean,
      deafult() {
        return true;
      },
    },
    duration: {
      type: Number,
      default: 3000,
    },
    interval: {
      type: Number,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Object],
      default: "100px",
    },
    heightshow: {
      type: Object,
      default() {
        return {
          min: 10,
          max: 50,
        };
      },
    },
    "turnback-delay": {
      type: Number,
      default: 100,
    },
    turnback: {
      type: [Boolean, Number],
      default: false,
    },
    runTo: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      top: getRandomInt(this.heightshow.min, this.heightshow.max),
      uuid: uuid,
      sizeGif: {
        width: typeof this.size == "string" ? this.size : this.size.width,
        height: typeof this.size == "string" ? this.size : this.size.height,
      },
      runToActually: this.runTo,
      start:
        typeof this.size == "string" ? "-" + this.size : "-" + this.size.width,

      end: "100%",
      returnInverted: false,
    };
  },
  beforeCreate() {
    this.uuid = uuid.toString();
    uuid += 1;
  },
  methods: {
    getRandomInt,
    restartGif(el) {
      let newTop = this.getRandomInt(this.heightshow.min, this.heightshow.max);
      el.css({
        transition: "none",
        left: this.start,
        top: newTop + "%",
        "z-index": -newTop + 100,
      });
    },
    runAnimation(el, timeAnimation) {
      el = $("#gif-pokemon-" + this.uuid);

      if (this.returnInverted) {
        el.css("transform", this.inverted ? "scaleX(-1)" : "scaleX(1)");
        this.returnInverted = false;
      } else {
        if (this.inverted) {
          el.css("transform", "scaleX(-1)");
        }
      }
      el.animate(
        {
          left: this.end,
        },
        timeAnimation,
        "linear",
        () => {
          if (this.turnback) {
            this.returnInverted = true;
            el.css("transform", this.inverted ? "scaleX(1)" : "scaleX(-1)");
            setTimeout(() => {
              el.animate(
                {
                  left: this.start,
                },
                timeAnimation,
                "linear",
                () => {
                  this.restartGif(el);
                }
              );
            }, this.turnbackDelay);
          } else {
            this.restartGif(el);
          }
        }
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      let addTime = this.turnback ? this.duration : 0;
      addTime += this.turnbackDelay;
      if (this.runTo == "right") {
        let end = this.end;
        this.end = this.start;
        this.start = end;
      }
      this.$el.children[0].style.left = this.start;
      if (this.noloop == false) {
        let intervalRun = setInterval(() => {
          this.runAnimation(this.$el.children[0], this.duration);
        }, this.interval + this.duration + addTime);
      } else {
        let timeoutRun = setTimeout(() => {
          this.runAnimation(this.$el.children[0], this.duration);
        }, this.interval);
      }
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.field-run {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
  img {
    position: absolute;
    user-select: none;
    pointer-events: none;
  }
}
</style>
