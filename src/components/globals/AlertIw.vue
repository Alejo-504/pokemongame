<template>
  <div :id="'alertiw-' + name" class="container-alert">
    <div class="sub-alertiw">
      <div class="title">
        <h3 class="text-title">
          <img v-if="icon != false" class="pokeball" :src="icon" alt="" />
          {{ title }}
        </h3>
      </div>
      <div class="contenido">
        <div v-if="mod == 'success'" class="img-desc">
          <div class="success-checkmark">
            <div class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
              <div class="icon-circle"></div>
              <div class="icon-fix"></div>
            </div>
          </div>
        </div>
        <slot>
          <div style="width: 109px; height: 109px"></div>
        </slot>
      </div>
    </div>
  </div>
</template>
<script>
import store from "@/store/index.js";
import success from "@/assets/success.gif";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import close from "@/assets/close.png";
const $ = require("jquery");

export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    icon: {
      type: [Boolean, String],
      default: false,
    },
    closeIcon: {
      type: Boolean,
      default: true,
    },
    easyclose: {
      type: Boolean,
      default: true,
    },
    effect: {
      type: String,
      default: "size",
    },
    width: {
      type: String,
      default: "auto",
    },
    cssIconTitle: Object,
    mod: String,
    height: {
      type: String,
      default: "auto",
    },
    cssTitle: Object,
    cssAlert: Object,
    name: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      success,
      store,
    };
  },
  methods: {
    destroy() {
      let alertiw = $(`#alertiw-${this.name}`);
      if (alertiw.length > 0) {
        alertiw.remove();
      }
    },
    addButtonClose(title, fn) {
      if (this.closeIcon == true) {
        title.append('<i class="close-alert"><img src="' + close + '" /></i>');
        title.children(".close-alert").css({
          cursor: "pointer",
          display: "flex",
          "align-items": "center",
          "margin-right": "5px",
        });
        title.children(".close-alert")[0].addEventListener("click", () => {
          fn();
        });
      }
    },
  },
  created() {
    this.destroy();
  },
  mounted() {
    let options = {
      easyclose: this.easyclose,
    };
    this.$el.options = options;
    this.$nextTick(() => {
      if (this.mod == "success") {
        $(".check-icon").hide();
        setTimeout(function () {
          $(".check-icon").show();
        }, 10);
      }
      const idAlert = this.name;
      const idalertiw = "#alertiw-" + idAlert + " .sub-alertiw";
      const idTitle = "#alertiw-" + idAlert + " .title";

      if (this.cssTitle) {
        cssApply(document.querySelector(idTitle), this.cssTitle);
      }
      cssApply(document.querySelector(idalertiw), {
        width: this.width,
        height: this.height,
      });
      if (this.cssAlert) {
        cssApply(document.querySelector(idalertiw), this.cssAlert);
      }
      if (this.cssIconTitle) {
        cssApply(
          document.querySelector(idalertiw + " .text-title img"),
          this.cssIconTitle
        );
      }
      let title = $("#alertiw-" + this.name + " > .sub-alertiw > .title");
      if (this.mod != "success") {
        this.addButtonClose(title, () => {
          alertiw.close(this.name);
        });
      }
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.success-checkmark {
  width: 80px;
  height: 115px;
  margin: 0 auto;

  .check-icon {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 50%;
    box-sizing: content-box;
    border: 4px solid #4caf4f00;

    &::before {
      top: 3px;
      left: -2px;
      width: 30px;
      transform-origin: 100% 50%;
      border-radius: 100px 0 0 100px;
    }

    &::after {
      top: 0;
      left: 30px;
      width: 60px;
      transform-origin: 0 50%;
      border-radius: 0 100px 100px 0;
      animation: rotate-circle 4.25s ease-in;
    }

    &::before,
    &::after {
      content: "";
      height: 100px;
      position: absolute;
      background: #ffffff00;
      transform: rotate(-45deg);
    }

    .icon-line {
      height: 5px;
      background-color: #4caf50;
      display: block;
      border-radius: 2px;
      position: absolute;
      z-index: 10;

      &.line-tip {
        top: 46px;
        left: 14px;
        width: 25px;
        transform: rotate(45deg);
        animation: icon-line-tip 0.75s;
      }

      &.line-long {
        top: 38px;
        right: 8px;
        width: 47px;
        transform: rotate(-45deg);
        animation: icon-line-long 0.75s;
      }
    }

    .icon-circle {
      top: -4px;
      left: -4px;
      z-index: 10;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      position: absolute;
      box-sizing: content-box;
      border: 4px solid rgba(76, 175, 80, 0.5);
    }

    .icon-fix {
      top: 8px;
      width: 5px;
      left: 26px;
      z-index: 1;
      height: 85px;
      position: absolute;
      transform: rotate(-45deg);
      background-color: rgba(255, 255, 255, 0);
    }
  }
}

@keyframes rotate-circle {
  0% {
    transform: rotate(-45deg);
  }
  5% {
    transform: rotate(-45deg);
  }
  12% {
    transform: rotate(-405deg);
  }
  100% {
    transform: rotate(-405deg);
  }
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 45px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

//---------------
/* ESTILOS PARA EL ALERT GLOBAL */
.img-desc {
  width: 100%;
  @include flex(center);
}
#success {
  width: 100px;
  height: 100px;
}
.container-alert {
  position: fixed;
  width: 100%;
  height: 100%;
  min-height: 350px;
  background: rgba(114, 114, 114, 0.658);
  z-index: 1000;
  top: 0;
  @include flex(center);
  overflow: hidden;
  display: none;
  overflow: auto;

  .contenido {
    //border-top: solid 0.5px rgba(212, 212, 212, 0.911);
    padding: 15px 0px 6px 0;
    margin-bottom: 15px;
    font-family: "nunito-bold";
  }
  .title {
    font-family: "Roboto-Black";
    padding: 2px 5px;
    width: auto;
    height: 32px;
    border-radius: 10px 10px 0px 0;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgb(0, 0, 0);
    font-size: 17px;
    .close-alert {
      cursor: pointer;
      background: rgb(129, 128, 128);
    }
    .close-alert img {
      color: rgb(0, 0, 0);
      width: 15px !important;
      height: 15px !important;
      margin-right: 5px;
      cursor: pointer !important;
    }
    .text-title {
      margin-left: 5px;
      font-size: 15px;
      @include flex(center);
    }
  }
  .pokeball {
    width: 25px;
    height: 25px;
    margin-right: 5px;
  }
  .sub-alertiw {
    background-size: 100% 200px;
    background-repeat: no-repeat;
    background-position: bottom;
    background: rgba(255, 255, 255, 0.8);
    position: absolute;
    z-index: 1001;
    border-radius: 10px 10px 5px 5px;
    display: none;
    min-width: 150px;
    margin: 0 15px;
    padding: 0px;
    box-shadow: -1px 10px 20px -10px rgb(17, 17, 17);
    height: auto;
  }
}
/* ESTILOS PARA EL ALERT GLOBAL */
</style>
