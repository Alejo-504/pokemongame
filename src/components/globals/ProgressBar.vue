<template>
  <div class="progress">
    <div class="center"><slot name="center" /></div>
    <div class="load">
      <div class="left"><slot name="left" /></div>
    </div>
    <div class="right"><slot name="right" /></div>
  </div>
</template>

<script>
export default {
  props: {
    max: {
      type: Number,
      default: 250,
    },
    value: {
      type: Number,
      required: true,
    },
    width: String,
    color: String,
  },
  methods: {
    calProgress(val) {
      let a = this.max;
      let b = 100; //progress bar %
      let c = val;
      let x = (b * c) / a;
      return x > 100 ? 100 : x;
    },
  },
  watch: {
    value(val) {
      cssApply(this.$el.children[1], {
        width: this.calProgress(val) + "%",
        background: this.color,
      });
    },
  },
  mounted() {
    // obtener el valor del progressbar siendo el valor de la propiedad value el valor actual del progressbar y max el valor maximo obtener el porcentaje actual

    cssApply(this.$el, {
      width: this.width + "%",
    });
    cssApply(this.$el.children[1], {
      width: this.calProgress(this.value) + "%",
      background: this.color,
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.progress {
  background: rgba(231, 231, 231, 0.884);
  position: relative;
  border-radius: 10px;

  &:hover {
    background: rgba(231, 231, 231, 0.884);
  }
  .center {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: none;
    width: 100% !important;
    font-size: 8.3px;
    color: rgb(0, 0, 0);
    z-index: 100;
    font-family: "nunito-bold";
    color: rgb(0, 0, 0);
    margin-left: -10px;
    margin-top: 1px;
  }
  .right {
    width: auto;
    height: 100%;
    position: absolute;
    top: 0;
    right: -25px;
    font-size: 10px;
    font-family: "nunito-bold";
    display: flex;
    align-items: center;
    color: rgb(0, 0, 0);
  }
}
.load {
  height: 100%;
  border-radius: 10px;
  position: relative;
  transition: width 0.2s ease-in-out;
  .left {
    height: auto;
    width: auto;
    position: absolute;
    left: -18px;
    color: rgb(0, 0, 0);
    font-size: 10px;
  }
}
</style>
