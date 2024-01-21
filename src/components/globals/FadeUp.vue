<template>
  <span style="display: none" :id="'fadeUp-' + this.uuid" class="fadeUp">
    <slot></slot>
    <span class="text"></span>
  </span>
</template>
<script>
const $ = require("jquery");
let uuid = 0;
export default {
  props: {
    time: {
      type: Number,
      default: 900,
    },
    course: {
      type: String,
      default: "top",
    },
    color: {
      type: String,
      default: "red",
    },
    font: Object,
    position: String,
    parentCss: {
      type: Object,
      default() {
        return {
          position: "relative",
        };
      },
    },
  },
  data() {
    return {
      uuid,
      positionBase: null,
    };
  },
  methods: {
    fade(value = "+1", color = null) {
      let time = this.time;
      let course = this.course;
      let span = $("#fadeUp-" + this.uuid);
      let text = span.find(".text");
      let position =
        this.course == "left" || this.course == "right" ? "top" : "left";
      text.text(value);
      span.stop();
      //span.color = this.color;
      span.css({
        display: "flex",
        position: "absolute",
        [course]: "100%",
        opacity: 1,
        color: color ? color : this.color,
      });
      if (this.position) {
        span.css({
          [position]: this.position,
        });
      }

      span.animate(
        {
          opacity: 0,
          [course]: "-20%",
        },
        time
      );
    },
  },
  created() {
    uuid++;
  },
  mounted() {
    let dad = this.$el.parentNode;
    cssApply(dad, this.parentCss);
    if (this.font) {
      cssApply(this.$el, this.font);
    }
    this.$el.colorFade = this.color;
    this.$el.fade = this.fade;
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.fadeUp {
  position: "absolute";
  z-index: 10000;
  padding: 0;
  margin: 0;
  height: auto;
  font-family: "Roboto-Black";
  @include flex(center);
  .text {
    margin-bottom: -5px;
  }
}
</style>
