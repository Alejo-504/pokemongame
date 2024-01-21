const $ = require("jquery");
const confetti = require("canvas-confetti");
import soundConfetti from "@/assets/sounds/confetti-pop.mp3";
import soundPeople from "@/assets/sounds/people-celebrate.mp3";

var time;

export const pushmsg = {
  open(id, text) {
    let el = $("#" + id);

    if (text) {
      el[0].children[1].innerHTML = text;
    }

    el.slideDown(function () {
      if (el[0].style.display == "none") {
        el.slideDown();
      }
    });
    if (el[0].options.confetti) {
      let myCanvas = document.querySelector(
        "#confetti-medals-notification-" + id
      );
      let globalSound = document.querySelector("#sound-effect-global");
      globalSound.src = soundConfetti;
      globalSound.play();
      let globalSound2 = document.querySelector("#sound-effect-global2");
      globalSound2.src = soundPeople;
      globalSound2.play();

      var myConfetti = confetti.create(myCanvas, {
        resize: false,
      });
      myConfetti({
        particleCount: 100,
        startVelocity: 20,
        spread: 360,
      });
    }
    if (el[0].options.timeout != 0) {
      clearTimeout(time);

      time = setTimeout(function () {
        el.slideUp();
      }, el[0].options.timeout);
    }
    if (el[0].options.close) {
      el[0].children[2].addEventListener("click", () => {
        el.slideUp();
        clearTimeout(time);
      });
    }
  },
  close(id) {
    let el = $("#" + id);
    el.slideUp();
  },
};
