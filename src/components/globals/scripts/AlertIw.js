const $ = require("jquery");
var alertsActive = [];
var overflow = null;
function getEffect(effect) {
  const props = {
    display: "block",
    opacity: 1,
    transition: "all .3s ease-in-out",
  };
  switch (effect) {
    default:
      return {
        init: props,
        start: { transform: "scale(0)" },
        end: { transform: "scale(1)" },
      };
    case "size":
      props.transform = "scale(0)";
      return {
        init: props,
        start: { transform: "scale(0)" },
        end: { transform: "scale(1)" },
      };
    case "size-rotate":
      props.transform = "scale(0) rotate(-10deg)";
      return {
        init: props,
        start: { transform: "scale(0) rotate(-10deg)" },
        end: { transform: "scale(1) rotate(0)" },
      };
    case "size-rotate-out":
      props.transform = "scale(1) rotate(0)";
      return {
        init: props,
        start: { transform: "scale(1) rotate(0)" },
        end: { transform: "scale(0) rotate(-10deg)" },
      };
  }
}
function onEasyClose(name, fn) {
  let container = $("#alertiw-" + name);

  document.body.addEventListener("keydown", (evt) => {
    const codigo = evt.which || evt.keyCode;

    if (codigo == 27 && name == alertsActive[alertsActive.length - 1]) {
      fn();
    }
  });
  container.on("click", (evt) => {
    if (evt.target.classList[0] == "container-alert") {
      fn();
    }
  });
}
function removeItemFromArr(arr, item) {
  var i = arr.indexOf(item);
  arr.splice(i, 1);
}

export const alertiw = {
  close(name, fn = null, effect = "size") {
    let container = $("#alertiw-" + name);
    let subAlertiw = $("#alertiw-" + name + " > .sub-alertiw");
    removeItemFromArr(alertsActive, name);
    removeEventListener("keydown", container);
    removeEventListener("click", container);

    const res = getEffect(effect);

    subAlertiw.css(Object.assign(res.init, res.end));
    subAlertiw.animate(
      {
        opacity: 1,
      },
      {
        step: function () {
          $(this).css(res.start);
        },
        complete: () => {
          container.animate(
            {
              opacity: 0,
            },
            300,
            () => {
              document.body.style.setProperty(
                "overflow",
                overflow ? overflow : "auto"
              );

              container.css("display", "none");
              if (fn) {
                fn();
              }
            }
          );
        },
      }
    );

    setTimeout(() => {
      if (container?.style) {
        container.style.display = "none";
      }
    }, 500);
  },
  open(name, fn = null) {
    let container = $("#alertiw-" + name);
    let subAlertiw = $("#alertiw-" + name + " > .sub-alertiw");
    alertsActive.push(name);
    let options = container[0].options;

    container.remove();
    overflow = document.body.style.overflow;
    document.body.insertAdjacentElement("beforeend", container[0]);
    document.body.style.setProperty("overflow", "hidden", "important");

    if (options.easyclose == true)
      onEasyClose(name, () => {
        this.close(name);
      });

    container.css({
      display: "flex",
      opacity: "1",
    });

    const res = getEffect(options.effect);
    subAlertiw.css(Object.assign(res.init, res.start));
    subAlertiw.animate(
      {
        opacity: 1,
      },
      {
        step: () => {
          subAlertiw.css(res.end);
        },
        complete() {
          if (fn) {
            fn();
          }
        },
      }
    );
  },
};
