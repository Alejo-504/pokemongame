<template>
  <div :id="name" :class="type + ' msg ' + 'msg-' + uuid" style="display: none">
    <InformationOutline v-if="type == 'info' && !icon" />
    <AlertOctagonOutline
      v-if="type == 'warning' || (type == 'danger' && !icon)"
    />
    <img v-if="icon" :src="icon" />
    <div class="output"><slot></slot></div>

    <button class="close-pushmsg" v-if="close"><Close /></button>
  </div>
</template>
<script>
import { AlertOctagonOutline, InformationOutline, Close } from "mdue";
import { pushmsg } from "@/components/globals/scripts/PushMsg.js";

let uuid = 0;

export default {
  data() {
    return {
      uuid: uuid,
      pushmsg,
    };
  },
  props: {
    iconCss: Object,
    icon: String,
    type: {
      type: String,
      default: "info",
    },
    effect: {
      type: String,
      deafult: "fade",
    },
    close: {
      type: Boolean,
      default: true,
    },
    timeout: {
      type: Number,
      default: 0,
    },
    startOn: {
      type: [Boolean, String, Number],
      default: "off",
    },
    confetti: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
  },
  components: {
    Close,
    AlertOctagonOutline,
    InformationOutline,
  },
  watch: {
    startOn(val) {
      if (val !== "off") {
        if (val) {
          this.pushmsg.open(this.name);
        } else {
          this.pushmsg.close(this.name);
        }
      }
    },
  },
  beforeCreate() {
    uuid++;
    this.uuid = uuid;
  },
  mounted() {
    if (this.confetti) {
      let canvas = document.createElement("canvas");
      canvas.setAttribute("id", "confetti-medals-notification-" + this.name);
      canvas.classList.add("confetti-canvas-pushmsg");
      this.$el.appendChild(canvas);
    }

    this.$el.options = {
      confetti: this.confetti,
      timeout: this.timeout,
      close: this.close,
      effect: this.effect,
    };

    cssApply(this.$el.children[0], this.iconCss);
    this.$nextTick().then(() => {
      if (this.startOn != "off") {
        if (this.startOn && this.startOn != 0) {
          this.pushmsg.open(this.name);
        } else {
          this.pushmsg.close(this.name);
        }
      }
    });
  },
};
</script>
<style lang="scss" scoped>
.confetti-canvas-pushmsg {
  position: absolute;
  top: -20px;
  width: 100%;
  height: 100%;
}
.msg {
  position: relative;
  width: 80%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  border-radius: 5px;
  padding: 2px 7px;
  font-family: "nunito-light";
  &:hover button svg {
    visibility: visible;
  }
  .output {
    width: 90%;
  }
  svg,
  img {
    width: 24px;
    height: 24px;
    margin-right: 6px;
  }
  button {
    height: 100%;
    background: none;
    cursor: pointer;
    outline: none;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 15px;
      height: 15px;
      visibility: hidden;
    }
  }
}
.info {
  border: solid 2px #54a0ff;
  color: white;
  svg {
    color: rgb(0, 56, 141);
  }
  background: #54a0ff;
  box-shadow: 1px 0px 6px -2px rgba(25, 60, 173, 0.815);
}
.warning {
  border: solid 2px #fece30;
  color: rgb(0, 0, 0);
  background: #fece30;
  svg {
    color: rgb(218, 80, 0);
  }
  box-shadow: 1px 0px 6px -2px rgba(194, 145, 11, 0.815);
}
.danger {
  border: solid 2px #e82618;
  color: rgb(255, 255, 255);
  background: #e82618;
  svg {
    color: rgb(117, 18, 18);
  }
  box-shadow: 1px 0px 6px -2px rgba(209, 15, 15, 0.75);
}
</style>
