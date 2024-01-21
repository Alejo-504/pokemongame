<template>
  <div class="tooltip">
    <slot></slot>
    <div :id="arrow == true ? 'arrow' : ''" data-popper-arrow></div>
  </div>
</template>

<script>
import { createPopper } from "@popperjs/core";

const $ = require("jquery");
export default {
  props: {
    theme: {
      type: String,
      default: "black",
    },
    beforeShow: Function,
    trigger: {
      type: Array,
      default() {
        return [
          ["touchstart", "touchend"],
          ["mouseenter", "mouseleave"],
        ];
      },
    },
    on: {
      type: [String, HTMLDivElement],
      required: true,
    },
    await: {
      type: Number,
      default: 2000,
    },
    "z-index": Number,
    placement: {
      type: String,
      default: "auto",
    },
    modifiers: {
      type: Array,
      default() {
        return [
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ];
      },
    },
    arrow: {
      type: Boolean,
      default: true,
    },
    rounded: {
      type: [Boolean, String],
      default: true,
    },
    animation: {
      type: String,
      default: "fade",
    },
    css: Object,
  },
  data() {
    return {
      createPopper,
      actuator: null,
    };
  },
  methods: {
    activeProps(tooltip, actuator) {
      tooltip.classList.add(this.theme);
      if (this.zIndex) {
        tooltip.style.zIndex = this.zIndex;
      }
    },
    showAnimation() {
      if (this.animation) {
        switch (this.animation) {
          case "fade":
            cssApply(this.$el, {
              display: "flex",
              opacity: 0,
            });
            $(".tooltip").animate(
              {
                opacity: 1,
              },
              100
            );
            break;
        }
      }
    },
    hideAnimation() {
      if (this.animation) {
        switch (this.animation) {
          case "fade":
            $(this.$el).animate(
              {
                opacity: 0,
              },
              100,
              function () {
                this.style.display = "none";
              }
            );
            break;
        }
      }
    },
    activeTooltip(actuator) {
      const tooltip = this.$el;
      if (this.css) cssApply(tooltip, this.css);
      if (typeof (this.rounded == "string")) {
        tooltip.style.setProperty("border-radius", this.rounded, "important");
      } else if (this.rounded == false) {
        tooltip.style.borderRadius = "0px";
      }
      this.activeProps(tooltip, actuator);
      const popperInstance = this.createPopper(actuator, tooltip, {
        placement: this.placement,
        modifiers: this.modifiers,
      });
      let timeout;
      let show = async (evt) => {
        if (this.beforeShow) {
          await this.beforeShow();
        }
        if (this.await != 0) {
          timeout = setTimeout(() => {
            popperInstance.update();
            this.showAnimation();
          }, this.await);
        } else {
          tooltip.style.display = "none";
          this.showAnimation(tooltip);
          popperInstance.update();
        }
      };
      const hide = async () => {
        if (timeout) {
          clearTimeout(timeout);
        }

        this.hideAnimation(tooltip);
        tooltip.removeAttribute("data-show");
      };
      var showEvents = [];
      var hideEvents = [];
      var showPrevents = [];
      for (let i in this.trigger) {
        showEvents.push(this.trigger[i][0]);
        hideEvents.push(this.trigger[i][1]);
        showPrevents.push(this.trigger[i][2]);
      }
      for (let i in showEvents) {
        actuator.addEventListener(showEvents[i], (evt) => {
          if (showPrevents[i] == true) {
            evt.preventDefault();
          }
          show(evt);
        });
      }
      hideEvents.forEach((event) => {
        if (event) {
          if (event.indexOf(":out") != -1) {
            document.addEventListener(
              event.substring(0, event.indexOf(":out")),

              (evt) => {
                if (document.querySelector(this.on)) {
                  var hideEnd = false;

                  let on = document.querySelector(this.on);

                  on.childNodes.forEach((el) => {
                    if (el == evt.target) {
                      hideEnd = true;
                    }
                  });

                  if (on != evt.target && hideEnd != true) {
                    hide();
                  }
                }
              }
            );
          } else {
            actuator.addEventListener(event, hide);
          }
        }
      });
    },
  },
  watch: {
    actuator(val) {
      if (val) {
        this.activeTooltip(val);
      }
    },
  },
  mounted() {
    this.actuator =
      typeof this.on == "string" ? document.querySelector(this.on) : this.on;
  },
};
</script>

<style lang="scss" scoped>
.tooltip {
  padding: 8px;
  font-family: "Roboto-Regular";
  font-size: 13px;
  z-index: 100000;
}
.black {
  background: rgb(37, 37, 37);
  color: white;
  border-radius: 10px;
}
.light {
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  border-radius: 10px;
}
.error {
  background: rgb(219, 3, 3);
  color: rgb(255, 255, 255);
  border-radius: 10px;
}
.null {
  background: rgba(0, 153, 0, 0);
  color: rgb(0, 0, 0);
  border-radius: 10px;
}
#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  z-index: 9000;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}
.tooltip[data-popper-placement^="top"] > #arrow {
  bottom: -4px;
}

.tooltip[data-popper-placement^="bottom"] > #arrow {
  top: -4px;
}

.tooltip[data-popper-placement^="left"] > #arrow {
  right: -4px;
}

.tooltip[data-popper-placement^="right"] > #arrow {
  left: -4px;
}
.tooltip {
  /* ... */
  display: none;
}

.tooltip[data-show] {
  display: block;
}
</style>
