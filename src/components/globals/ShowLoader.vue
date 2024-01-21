<template>
  <div class="preloader"></div>
</template>
<script>
export default {
  props: {
    size: {
      type: [Number, String],
      default: 70,
    },
    css: Object,
    cssParent: Object,
    border: {
      type: [String, Number],
      default: "10",
    },
    color_bar: {
      type: String,
      default: "#dfe6e9",
    },
    color_load: {
      type: String,
      default: "#3498db",
    },
  },
  mounted() {
    cssApply(this.$el, {
      width: this.size + "px",
      height: this.size + "px",
      border: this.border + "px solid " + this.color_bar,
      borderTop: this.border + "px solid" + this.color_load,
    });
    if (this.css) {
      this.$el.style.position = "absolute";
      cssApply(this.$el, this.css);
    }
    if (this.cssParent) {
      cssApply(this.$el.parentNode, this.cssParent);
    }
    cssApply(this.$el.parentNode, {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
  },
};
</script>
<style lang="scss" scoped>
.preloader {
  border-radius: 50%;
  animation-name: girar;
  animation-duration: 2s;
  animation-iteration-count: infinite;
}
@keyframes girar {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
