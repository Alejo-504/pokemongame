<template>
  <div class="sound-icon-control">
    <input
      id="controlVol"
      type="range"
      value="35"
      min="0"
      max="100"
      autocomplete="off"
    />
    <VolumePlus id="volume-plus" />
    <VolumeMinus id="volume-minus" />
    <audio
      id="sound-audio-global"
      controls="none"
      preload="auto"
      style="display: none"
      src=""
    ></audio>
  </div>
</template>
<script>
import { VolumePlus, VolumeMinus } from "mdue";
import store from "@/store";
export default {
  props: {
    color: {
      type: String,
      default: "#000000",
    },
  },
  components: {
    VolumePlus,
    VolumeMinus,
  },
  computed: {
    globalSound() {
      return store.state.background_sound;
    },
    disable_sound_for_browser: {
      get() {
        return store.state.disable_sound_for_browser;
      },
      set(value) {
        store.state.disable_sound_for_browser = value;
      },
    },
  },
  methods: {
    playSound(val) {
      if (val != "off") {
        const audioElement = document.getElementById("sound-audio-global");
        audioElement.src = val;
        audioElement.loop = true;
        let promise = audioElement.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              console.log("play", val);
            })
            .catch((error) => {
              console.log(error);
              this.disable_sound_for_browser = true;
            });
        }
      }
    },
  },
  watch: {
    disable_sound_for_browser(val, old) {
      if (val != old) {
        store.state.disable_sound_for_browser = val;
        if (this.disable_sound_for_browser == false && this.globalSound) {
          this.playSound(this.globalSound);
        }
      }
    },

    globalSound(val) {
      if (val) {
        if (val == "off") {
          let audioElement = document.getElementById("sound-audio-global");
          audioElement.pause();
          console.log("pause");
        } else {
          this.playSound(val);
        }
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      let control = document.querySelector("#controlVol");
      const audioElement = document.getElementById("sound-audio-global");
      if (localStorage.getItem("volume")) {
        audioElement.volume = localStorage.getItem("volume") * 0.01;
        control.value = localStorage.getItem("volume");
      }

      control.addEventListener("change", function (evt) {
        audioElement.volume = evt.currentTarget.value * 0.01;
        localStorage.setItem("volume", evt.currentTarget.value);
        this.disable_sound_for_browser = false;
        audioElement.play();
      });
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
$primary-color: #2ecc71;
.sound-disable-for-browser {
  @include flex(center);
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 20px;
  right: 35px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}
.sound-icon-control {
  width: 170px;
  height: 20px;
  position: fixed;
  bottom: 20px;
  right: 35px;
  z-index: 101;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  @include flex(center);
  @include phones {
    bottom: 66px;
    width: 100px;
    transform: rotate(90deg);
    right: -25px;
    #volume-plus,
    #volume-minus {
      transform: rotate(-90deg);
    }
  }
}
#volume-minus {
  position: absolute;
  left: 6px;
  top: 2px;
  font-size: 17px;
  color: white;
}
#volume-plus {
  position: absolute;
  right: 6px;
  top: 2px;
  font-size: 17px;
  color: white;
}

input[type="range"] {
  display: flex;
  width: 60%;
  z-index: 1000;
}

input[type="range"]:focus {
  outline: none;
  background: pink;
}

input[type="range"],
input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  background-color: rgb(197, 197, 197);
  width: 20px;
  height: 20px;
  border: 3px solid rgb(0, 0, 0);
  border-radius: 50%;
  margin-top: -9px;
}

input[type="range"]::-moz-range-thumb {
  background-color: #777;
  width: 15px;
  height: 15px;
  border: 3px solid #333;
  border-radius: 50%;
}

input[type="range"]::-ms-thumb {
  background-color: #777;
  width: 20px;
  height: 20px;
  border: 3px solid #333;
  border-radius: 50%;
}

input[type="range"]::-webkit-slider-runnable-track {
  background-color: #777;
  height: 3px;
}

input[type="range"]:focus::-webkit-slider-runnable-track {
  outline: none;
}

input[type="range"]::-moz-range-track {
  background-color: #777;
  height: 3px;
}

input[type="range"]::-ms-track {
  background-color: #777;
  height: 3px;
}

input[type="range"]::-ms-fill-lower {
  background-color: HotPink;
}

input[type="range"]::-ms-fill-upper {
  background-color: black;
}
</style>
