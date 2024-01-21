<template>
  <div
    v-if="typeof store?.state?.DATA_USER?.data?.sprite == 'number' && this.MAP"
    class="map"
    :style="`
        opacity:${mapOpacity};
        width:${map.size.width}px; 
        height:${map.size.height}px;
    `"
    @touchstart="
      (evt) => {
        external_controller_sprite = { touch: evt };
      }
    "
    @touchend="
      (evt) => {
        external_controller_sprite = {
          stop: true,
        };
      }
    "
  >
    <AlertIw
      name="emptyTeam"
      title="Empty Team!"
      :closeIcon="false"
      :cssTitle="{
        'font-size': '1.5em',
        'font-weight': 'bold',
        background: '#e74c3c',
      }"
      :cssAlert="{
        'font-weight': 'bold',
        background: '#e74c3c',
        'box-shadow': 'none',
        border: '2px black solid',
      }"
      ><div class="emptyTeam-alert">
        <h2>your team is empty!</h2>
        <p>please add pokemon to your team</p>
        <div>
          <button @click="alertiw.close('emptyTeam')" class="no-battle">
            Close
          </button>
        </div>
      </div>
    </AlertIw>
    <img v-show="map_load >= 2" class="background-map" src="" />
    <div
      class="map-field-absolute"
      :style="`
            visibility: ${grid_view == false ? 'hidden' : 'visible'};
            grid-template-columns: repeat(${tiles.column}, ${tile_size}px);
            grid-template-rows: repeat(${tiles.row}, ${tile_size}px);
        `"
    >
      <div
        :title="`${generalconfig['grid-view'] ? i : ''}`"
        :class="`cell cell-${i}`"
        v-for="i in tiles.column * tiles.row"
        v-bind:key="i"
        :style="`
            width:${tile_size}px;
            height:${tile_size}px;
          `"
      >
        <span class="cell-number">{{ i }}</span>
      </div>
    </div>

    <GetSprite
      id="mysprite"
      :color-status="setColorStatus(status)"
      :number="
        store.state.DATA_USER.data.sprite
          ? store.state.DATA_USER.data.sprite
          : toStartConfig['default-user-sprite']
      "
      :control="true"
      :name="store.state.DATA_USER.username"
      :speed="spriteSpeed"
      :external_motion_evt="external_controller_sprite"
      :initial-position="initialPositionCell"
      :cells_collisions="cells_collisions"
      :talk="store.state.users_connected[this.socket.id]?.talk"
      :tiles="{
        column: tiles.column,
        row: tiles.row,
        size: tile_size,
      }"
      @update="
        if ($event.top || $event.left) {
          positionSprite = {
            top: $event.top ? $event.top : positionSprite.top,
            left: $event.left ? $event.left : positionSprite.left,
          };
        }

        upToServer('update:sprite', {
          action: $event.action,
          direction: $event.direction,
          position: {
            top: $event.top,
            left: $event.left,
            map: this.store.state.mapSelected,
          },
          status: this.store.state.status,
          sprite: this.store.state.DATA_USER.data.sprite,
        });
      "
    >
    </GetSprite>

    <GetSprite
      v-for="user in Object.keys(onlineUsers)"
      v-bind:key="user"
      :id="'online-user-sprite-' + user"
      :name="onlineUsers[user].username"
      :number="onlineUsers[user]?.sprite"
      :speed="spriteSpeed"
      :color-status="setColorStatus(onlineUsers[user]?.status)"
      :initial-position="
        onlineUsers[user].position
          ? onlineUsers[user].position
          : this.MAP['first_position_cell']
      "
      :external_motion_evt="onlineUsers[user]"
      :talk="onlineUsers[user]?.talk"
      :tiles="{
        column: tiles.column,
        row: tiles.row,
        size: tile_size,
      }"
    />
  </div>
</template>
<script>
import store from "@/store";
import generalconfig from "@/config/general";
import includesConfig from "@/config/maps/includes";
import toStartConfig from "@/config/toStart";
import { alertiw } from "@/components/globals/scripts/AlertIw";
const $ = require("jquery");
export default {
  props: {
    tile_size: {
      type: Number,
      default: generalconfig["grid-view-tile-size"],
    },
    map: {
      type: [Object, null],
      required: true,
    },
  },
  data() {
    return {
      alertiw,
      toStartConfig,
      mapOpacity: "0",
      socket: store.state.socket,
      opacity: 0,
      myevents: {},
      generalconfig,
      includesConfig,
      spriteSpeed: generalconfig["sprite-speed"],
      store,
      external_controller_sprite: { stop: false },
      grid_view: generalconfig["grid-view-in-map"],
      cell_on: null,
      map_load: 0,
      cells_next: [],
      levels_scroll: null,
      onLevelsScroll: {
        top: null,
        left: null,
      },
      cells_full: {}, //celdas que estan ocupadas por un include que ocupa mas espacio de su celda original
      cells_collisions: [],
      positionSprite: this.initialPositionCell,
      timeoutMenuContext: null,
    };
  },
  computed: {
    status_socket() {
      return this.store.state.socket.connected();
    },
    status() {
      return this.store.state.status;
    },
    initialPositionCell() {
      return this.MAP["first_position_cell"];
    },
    includesMap() {
      return this.MAP["includes"];
    },
    mysprite() {
      return document.querySelector(`#mysprite`);
    },
    onlineUsers() {
      let users = Object.keys(this.store.state.users_connected);
      let copia_sin_mi_usuario = {};
      for (let i = 0; i < users.length; i++) {
        if (
          users[i] != this.socket.id &&
          this.store.state.users_connected[users[i]].sprite
        ) {
          copia_sin_mi_usuario[users[i]] =
            this.store.state.users_connected[users[i]];
        }
      }
      return copia_sin_mi_usuario;
    },
    tiles() {
      return {
        column: Math.floor(this.map["size"].width / this.tile_size),
        row: Math.floor(this.map["size"].height / this.tile_size),
      };
    },
    MAP() {
      return this.map;
    },
  },
  methods: {
    backgroundMap() {
      let img = new Image();
      img.src = require("@/assets/maps/" + this.map.src);
      let backgroundMap = document.querySelector(`.background-map`);
      //cargar imagen en .background-map
      img.onload = () => {
        backgroundMap.src = img.src;
        this.map_load++;
        this.mapOpacity = "1";
      };
    },
    setColorStatus(status) {
      if (status == "online") {
        return "rgb(55, 230, 55)";
      }
      if (status == "offline") {
        return "#fece30";
      } else {
        return "rgb(199, 199, 199)";
      }
    },
    createLevelsScroll(new_position) {
      let screen = document.querySelector(".maps");
      let map = this.$el;
      this.levels_scroll = {
        top: Math.floor(map.clientHeight / screen.clientHeight),
        left: Math.floor(map.clientWidth / screen.clientWidth),
      };
      let topLevel;
      let LeftLevel;
      for (let i = this.levels_scroll.top; i > 0; i--) {
        if (
          new_position.top >= i * screen.clientHeight + 50 ||
          new_position.top >= i * screen.clientHeight - 50
        ) {
          topLevel = i;
          break;
        }
      }
      for (let i = this.levels_scroll.left; i > 0; i--) {
        if (
          new_position.left >= i * screen.clientWidth + 50 ||
          new_position.left >= i * screen.clientWidth - 50
        ) {
          LeftLevel = i;
          break;
        }
      }
      this.onLevelsScroll = {
        top: topLevel,
        left: LeftLevel,
      };
    },
    increaseSizeCell(nr_cell, cell_size, collision) {
      cell_size = cell_size.split("x");

      let cell_width = cell_size[0] - 1;
      let cell_height = cell_size[1] - 1;

      let tabla = {
        row: this.tiles.row,
        column: this.tiles.column,
      };

      let cell_inicio = nr_cell;
      let cell_fin = nr_cell + tabla.column * cell_width + cell_height;

      return this.getGroupCell(cell_inicio, cell_fin, (cell2, nr_cell2) => {
        this.cells_full[cell_fin] = cell_inicio;
        if (collision) {
          this.cells_collisions.push(nr_cell2);
        }
        cell2.classList.add("cell-include");
      });
    },
    getCell(position, output_row_col = false) {
      let pos = position;
      let sprite = this.mysprite;
      if (sprite == null) return;

      pos.left += sprite.clientWidth;
      pos.top += sprite.clientHeight;

      let col = Math.floor(pos.left / this.tile_size);
      let row = Math.floor(pos.top / this.tile_size);
      if (output_row_col) return { row, col };

      return row * this.tiles.column + col;
    },
    setCellOn(new_value) {
      this.cell_on = new_value.row * this.tiles.column + new_value.col;
      this.cells_next = [
        this.cell_on + 1, // right
        this.cell_on - 1, // left
        this.cell_on + this.tiles.column, // down
        this.cell_on - this.tiles.column, // up
      ];
      let cell_dom = document.querySelector(`.cell-${this.cell_on}`);

      if (this.grid_view == false) return;
      let cells = document.querySelectorAll(".cell");
      for (let i = 0; i < cells.length; i++) {
        cells[i].style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      }
      for (let i in this.cells_next) {
        let cell = document.querySelector(`.cell-${this.cells_next[i]}`);
        if (cell) {
          cell.style.backgroundColor = "rgb(143, 231, 149)";
        }
      }
      if (cell_dom) {
        cell_dom.style.backgroundColor = "green";
      }
    },
    getGroupCell(nr_cell1, nr_cell2, fn) {
      let tabla = {
        column: this.tiles.column,
        row: this.tiles.row,
      };
      let col_start = Math.floor(nr_cell1 / tabla.column);
      let col_end = Math.floor(nr_cell2 / tabla.column);
      let row_start = Math.floor(nr_cell1 % tabla.column);
      let row_end = Math.floor(nr_cell2 % tabla.column);

      let cells = [];

      for (let i = col_start; i <= col_end; i++) {
        for (let j = row_start; j <= row_end; j++) {
          let actual_cell = i * tabla.column + j;

          let cell = document.querySelector(`.cell-${actual_cell}`);
          cells.push(actual_cell);
          if (fn) {
            fn(cell, actual_cell);
          }
        }
      }

      return cells;
    },
    setCollision(nr_cell1, nr_cell2) {
      let collisions = this.getGroupCell(nr_cell1, nr_cell2);

      for (let i in collisions) {
        this.cells_collisions.push(collisions[i]);
      }
    },
    getIncludes(includesMap) {
      return includesMap.map((include) => {
        let config = Object.assign(include, this.includesConfig[include.name]);
        config.collision =
          config.collision == null || config.collision == undefined
            ? true
            : config.collision;
        config.size = config.size
          ? config.size
          : { width: this.tile_size, height: this.tile_size };
        config.cell = config.cell ? config.cell : "1x1";

        let src = config.src ? require("@/assets/" + config.src) : null;

        let cells = [];
        let name = config.name;
        let events = config.events ? config.events : {};
        let speed = config["speed-sprite"]
          ? config["speed-sprite"]
          : this.spriteSpeed;
        let above = config["show_above_sprite"]
          ? config["cell-on-top-sprite"]
          : ["left", "right"];
        let style = `
          position: absolute;
          ${src && src != "" ? "background-image: url(" + src + ");" : ""}
          background-repeat: no-repeat;
          background-size: ${config.size.width}px ${config.size.height}px;
          width:${config.size.width}px;
          height:${config.size.height}px;
          visibility: hidden;

        `;

        function createInclude(cell, name) {
          cell.classList.add(`cell-include`);

          let div = document.createElement("div");
          div.classList.add(`include-${name}`, "include");

          div.style = style;
          cell.appendChild(div);
        }
        for (let i in config.cells) {
          this.getGroupCell(
            config.cells[i][0],
            config.cells[i][1],
            (cell, nr_cell) => {
              if (config.cell != "1x1") {
                this.increaseSizeCell(nr_cell, config.cell, config.collision);
              }

              cells.push(nr_cell);
              createInclude(cell, name);
              if (config.collision) {
                this.cells_collisions.push(nr_cell);
              }
            }
          );
        }
        return {
          speed,
          name,
          events,
          cells,
          style,
          above,
        };
      });
    },
    enter(mapSelected) {
      this.store.commit("setMapSelected", mapSelected);
    },
    sound(src) {
      let sound = require("@/assets/sounds/" + src);
      let audio = new Audio(sound);
      audio.play();
    },
    talk(text, nr_cell) {
      let include = document.querySelector(`.cell-${nr_cell} .include`);
      //verificar si existe ya el div .include-talk
      let talk = document.querySelector(`.include-talk`);
      if (talk) {
        talk.remove();
      }
      let div = document.createElement("div");
      div.classList.add("include-talk");
      div.innerHTML = text;
      include.appendChild(div);
      setTimeout(() => {
        div.remove();
      }, 4000);
    },
    contextmenu(options, nr_cell) {
      let include = document.querySelector(`.cell-${nr_cell} .include`);
      //verificar si existe ya el div .include-talk
      let contextMenu = document.querySelector(`.include-context-menu`);

      if (contextMenu) {
        contextMenu.remove();
      }
      let div = document.createElement("div");
      div.classList.add("include-context-menu");
      for (let i in options) {
        let option = document.createElement("div");
        option.classList.add("include-context-menu-option");
        option.innerHTML = i;
        div.appendChild(option);

        option.addEventListener("click", () => {
          let contextMenu_in_this_cell = document.querySelector(
            `.cell-${nr_cell} .include-context-menu`
          );
          this.exeAction(i, options[i], nr_cell);
          if (contextMenu_in_this_cell) {
            contextMenu_in_this_cell.remove();
          }
        });
      }
      include.appendChild(div);
      this.timeoutMenuContext = setTimeout(() => {
        let contextMenu_in_this_cell = document.querySelector(
          `.cell-${nr_cell} .include-context-menu`
        );
        if (contextMenu_in_this_cell) {
          contextMenu_in_this_cell.remove();
        }
      }, 4000);
    },
    battle(param) {
      let teamEnemy = param[1];
      let enemy;
      if (teamEnemy && teamEnemy.length > 0) {
        enemy = teamEnemy;
      } else {
        enemy = "wild";
      }
      let battle = {
        map: this.store.state.mapSelected,
        team: this.store.state.DATA_USER.storagePokemon.filter(
          (item) => item.team == true
        ),
        enemy,
      };
      this.store.dispatch("updateDataUser", {
        "data.onbattle": battle,
      });

      let random = Math.random();
      if (random < param[0]) {
        if (battle.team.length == 0) {
          this.alertiw.open("emptyTeam");
          return;
        } else {
          this.autoDisconnect();
          this.$router.push("/battle");
        }
      }
    },
    autoDisconnect() {
      delete this.store.state.users_connected[this.store.state.socket.id];
      this.store.state.socket.disconnect();
    },
    downToServer(evt, fn) {
      this.socket.on(evt, (data) => {
        fn(data);
      });
    },
    upToServer(evt, data) {
      let data_send = {
        socket: this.socket.id,
        username: this.store.state.DATA_USER.username,
        room: this.store.state.ROOM,
      };
      data_send = Object.assign(data_send, data);

      this.socket.emit(evt, data_send);
    },
    detectSpriteAround(direction, include, nr_cell) {
      let cell = {
        right: nr_cell + 1,
        left: nr_cell - 1,
        top: nr_cell - this.tiles.column,
        bottom: nr_cell + this.tiles.column,
        center: nr_cell,
      };

      let incluido_ = false;

      let _cell_ = this.cells_full[cell[direction]];
      _cell_ = _cell_ ? _cell_ : cell[direction];
      let includeDom = document.querySelector(`.cell-${_cell_} .include`);
      if (include.cells.indexOf(_cell_) != -1) incluido_ = true;
      if (
        direction == "right" ||
        direction == "left" ||
        direction == "top" ||
        direction == "bottom"
      ) {
        if (includeDom && incluido_) {
          this.activeMyEvents("spritearound", include, _cell_);
        }
      }
    },
    onInclude(new_cell, old_cell, speedChange = true) {
      let includes = this.includes_config;
      let brk = false;
      //this.enviarTodoIncludeAtras(includes);

      for (let i in includes) {
        let include = includes[i];
        let _cel_ = this.cells_full[new_cell];

        if (include.cells.indexOf(_cel_ ? _cel_ : new_cell) != -1) {
          this.activeMyEvents("spriteenter", include, _cel_ ? _cel_ : new_cell);
          brk = true;
          if (speedChange) this.spriteSpeed = include.speed;
        } else {
          let _oldcell_ = this.cells_full[old_cell];
          let events = this.myevents[_oldcell_ ? _oldcell_ : old_cell];
          if (include.cells.indexOf(_oldcell_ ? _oldcell_ : old_cell) != -1) {
            if (events) {
              //verificar si events tiene spriteenter
              if (events.length > 0 && events.find((e) => e.spriteenter)) {
                this.activeMyEvents(
                  "spriteout",
                  include,
                  _oldcell_ ? _oldcell_ : old_cell
                );
              }
            }
            brk = true;
          }
          if (speedChange) this.spriteSpeed = generalconfig["sprite-speed"];
        }
        this.detectSpriteAround("right", include, _cel_ ? _cel_ : new_cell);
        this.detectSpriteAround("left", include, _cel_ ? _cel_ : new_cell);
        this.detectSpriteAround("top", include, _cel_ ? _cel_ : new_cell);
        this.detectSpriteAround("bottom", include, _cel_ ? _cel_ : new_cell);

        if (brk) break;
      }
    },
    exeAction(fn, action, nr_cell) {
      fn = fn.toLowerCase();
      if (typeof this[fn] == "function") {
        this[fn](action, nr_cell);
      } else {
        for (let i in action) {
          let fn2 = i.toLowerCase();

          if (typeof this[fn2] == "function") {
            this[fn2](action[i], nr_cell);
          }
        }
      }
    },
    activeMyEvents(name, include, nr_cell) {
      let events;

      if (include.events.length > 0) {
        events = include.events.find((evt) => evt.name == name);
      }

      let activeEvents = (actions) => {
        for (let i in actions) {
          this.exeAction(i, actions[i], nr_cell);
        }
      };

      let searchEvent = (search) => {
        let event = this.myevents[nr_cell].find((evt) => {
          for (let i in evt) {
            return i == search;
          }
        });
        return event;
      };
      let removeEvent = (event, nr_cell) => {
        event = this.myevents[nr_cell].find((evt) => evt.name == event);
        this.myevents[nr_cell].splice(this.myevents[nr_cell].indexOf(event), 1);
      };
      let addEvent = (event) => {
        if (this.myevents[nr_cell]) {
          this.myevents[nr_cell].push({ [name]: event });
        } else {
          this.myevents[nr_cell] = [{ [name]: event }];
        }
      };
      let deleteAllSpriteenter = () => {
        for (let i in this.myevents) {
          let event = this.myevents[i].find((evt) => {
            for (let i in evt) {
              return i == "spriteenter";
            }
          });
          if (event) {
            removeEvent(event.name, i);
          }
        }
      };

      let getToTrigger = () => {
        let events_to_trigger = [];
        if (name == "spriteenter") {
          if (this.myevents[nr_cell]) {
            deleteAllSpriteenter();
            let event = searchEvent("spriteenter");

            if (!event) {
              events_to_trigger.push(events.actions);
              addEvent(events.actions);
            }
          } else {
            deleteAllSpriteenter();
            events_to_trigger.push(events.actions);
            addEvent(events.actions);
          }
        } else if (name == "spriteout") {
          if (this.myevents[nr_cell]) {
            let event = searchEvent("spriteenter");

            if (event) {
              events_to_trigger.push(events.actions);
              removeEvent("spriteenter", nr_cell);
            }
          } else {
            events_to_trigger.push(events.actions);
          }
        } else if (name == "spritearound") {
          if (this.myevents[nr_cell]) {
            let event = searchEvent("spriteenter");
            if (!event) {
              events_to_trigger.push(events.actions);
            }
          } else {
            events_to_trigger.push(events.actions);
          }
        }

        return events_to_trigger;
      };

      if (events) {
        let events_to_trigger = getToTrigger();
        if (events_to_trigger.length > 0) {
          for (let i in events_to_trigger) {
            activeEvents(events_to_trigger[i]);
          }
        }
      }
    },
    deleteAllCollision() {
      this.cells_collisions = [];
      let cells = document.querySelectorAll(".cell-collision");
      cells.forEach((cell) => {
        cell.classList.remove("cell-collision");
      });
    },
    deleteIncludes() {
      let includes = document.querySelectorAll(".cell-include");

      for (let i = 0; i < includes.length; i++) {
        let include = includes[i];
        let children = include.children;
        for (let j = 0; j < children.length; j++) {
          let child = children[j];
          if (!child.classList.contains("cell-number")) {
            child.remove();
          } else {
          }
        }

        include.classList.remove("cell-include");
      }
    },
  },
  watch: {
    cells_collisions: {
      handler(new_value) {
        for (let i in new_value) {
          let cell = document.querySelector(`.cell-${new_value[i]}`);
          cell?.classList.add("cell-collision");
        }
      },
      deep: true,
    },
    positionSprite: function (new_position, old_position) {
      //verificar que el cambio sea en top o left

      if (new_position?.top && new_position?.left) {
        if (
          !old_position ||
          new_position.top != old_position.top ||
          new_position.left != old_position.left
        ) {
          this.createLevelsScroll(new_position);
          let cell = this.getCell(this.positionSprite, true);
          this.setCellOn(cell);
        }
      }
    },
    onLevelsScroll: function (new_level_scroll, old_level_scroll) {
      let screen = document.querySelector(".maps");

      if (
        new_level_scroll.top == old_level_scroll.top &&
        new_level_scroll.left == old_level_scroll.left
      )
        return;
      else {
        screen.scroll({
          top: new_level_scroll.top * screen.clientHeight,
          left: new_level_scroll.left * screen.clientWidth,
          behavior: "smooth",
        });
        this.external_controller_sprite = { stop: true };
      }
    },
    cell_on: function (new_cell, old_cell) {
      if (new_cell == old_cell) return;
      if (!this.map_load) {
        this.map_load++;
      }
      this.onInclude(new_cell, old_cell);
    },
    map_load: function (newval) {
      if (newval == 1) {
        for (let i in this.MAP.collisions) {
          this.setCollision(
            this.MAP.collisions[i][0],
            this.MAP.collisions[i][1]
          );
        }
        this.includes_config = this.getIncludes(this.includesMap);
        this.map_load++;
      }
      if (newval == 2) {
        let includes = document.querySelectorAll(".include");
        includes.forEach((include) => {
          include.style.visibility = "visible";
        });
        // this.mapOpacity = 1;
        this.$emit("mapLoaded");
      }
    },
    MAP() {
      this.mapOpacity = 0;
      this.map_load = 0;
      this.deleteAllCollision();
      this.deleteIncludes();
      this.cells_collisions = [];
      this.cells_full = {};
      this.map_laod++;
      this.backgroundMap();
    },
  },
  mounted() {
    this.backgroundMap();

    this.downToServer("update:sprite", (data) => {
      if (store.state.users_connected[data.socket]) {
        store.state.users_connected[data.socket] = {
          ...data,
        };
      }
    });
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";

.emptyTeam-alert {
  width: 100%;
  min-width: 280px;
  text-align: center;

  @include flex(center, wrap, column);
  > h2 {
    padding: 20px;
    text-align: center;
  }

  > div > button {
    margin: 10px;
    padding: 10px;
    font-size: 17px;
    cursor: pointer;
    border: none;
    background: rgb(235, 235, 235);
  }
}

#mysprite {
  z-index: 25;
}
.background-map {
  width: 100%;
  height: 100%;
  position: absolute;
}
.map {
  top: 0;
  left: 0;
  transition: all 0.3s linear;
  position: absolute;
  z-index: 19;
  //animar deslizar desde la derecha

  .cell {
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 10px;
    color: rgb(255, 255, 255);
    @include flex(center);
    border-left: solid 1px rgba(211, 211, 211, 0.658);
    border-top: solid 1px rgba(197, 197, 197, 0.801);
    pointer-events: all;
  }
  .cell-collision {
    background-color: rgba(255, 0, 0, 0.562) !important;
  }
  .cell-include {
    background-color: rgba(66, 91, 231, 0.562) !important;
    @include flex(flex-start, nowrap, row, flex-start);
    .include {
      @include flex(center, nowrap, row, center);
    }
  }
  .map-field-absolute {
    width: 100%;
    height: 100%;
    display: grid;
    pointer-events: none;
    position: absolute;
  }
}
</style>
