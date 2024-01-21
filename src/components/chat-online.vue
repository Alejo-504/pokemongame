<template>
  <div class="chat-online" v-if="dataConnect">
    <AlertIw
      name="userDuplicate"
      title="Faild to Login"
      :icon="warning4"
      :cssTitle="{
        'background-color': 'white',
        color: 'red',
      }"
      :cssAlert="{
        'background-color': '#ffffff',
      }"
      :cssIconTitle="{
        width: '20px',
        height: '20px',
      }"
      :closeIcon="false"
      :easyclose="false"
    >
      <div class="duplicate-user-alert">
        <h3>¡Session Duplicate!</h3>
        <Icons name="duplicate.png" style="width: 115px; height: 95px" />
        <p>
          You are already logged in. Please logout from your current session.
        </p>
        <button class="logout" @click="logout">
          <Logout />
          Logout
        </button>
      </div>
    </AlertIw>
    <div class="chat-description" v-if="typeof mapSelected == 'number'">
      {{ maps[mapSelected].location }}
    </div>
    <transition-group name="list" class="list-msg" tag="ul">
      <li
        v-for="msg in listMsg"
        v-bind:key="msg"
        :id="msg.username == 'SYSTEM' ? 'system' : ''"
        :class="
          store.state.DATA_USER?.username == msg.username
            ? 'user'
            : 'other-users'
        "
        :style="'color:' + msg.color + ';'"
      >
        <span
          v-if="store.state.DATA_USER?.username != msg.username"
          class="text-username"
          :style="'color:' + msg.color + ';'"
          >{{ msg.username }}</span
        >
        <span v-else class="text-username" :style="'color:' + msg.color + ';'">
          Me
        </span>
        {{ msg.text }}
      </li>
    </transition-group>

    <div class="bottom-controls">
      <div class="chat-list">
        <div class="menu-desp" @click="openMenu = !openMenu">
          <span> To: {{ chatSelect }} </span>
          <ul :style="openMenu ? 'display:flex;' : 'display:none;'">
            <li @click="chatSelect = 'Global'"><Earth />Global</li>
            <li @click="chatSelect = 'User'"><SendOutline />User</li>
          </ul>
        </div>
      </div>
      <div class="write-user">
        <input
          type="text"
          placeholder="write a message..."
          v-model="writingChat"
          @keyup.enter="sendToServer"
        />

        <button id="send-msg">
          <SendCircle @click="sendToServer" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { SendCircle, Earth, SendOutline, Logout } from "mdue";
import store from "@/store";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import warning4 from "@/assets/error.png";
import maps from "@/config/maps/maps.json";
import generalconfig from "@/config/general.json";

export default {
  props: {
    userLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      generalconfig,
      maps,
      warning4,
      alertiw,
      writingChat: "",
      chatSelect: "Global",
      openMenu: false,
      store,
      socket: store.state.socket,
      listMsg: [],
      counterCloseTab: 4,
      users_in_this_room: [],
    };
  },
  methods: {
    logout() {
      this.alertiw.close("userDuplicate");
      store.dispatch("logout");
    },
    pushMessage(msg) {
      if (msg.color == undefined) msg.color = "#ffffff";
      this.listMsg.push(msg);
      let listMessageDOM = document.querySelector(".list-msg");
      this.store.state.users_connected[msg.socket].talk = msg.text;
      setTimeout(() => {
        listMessageDOM.scrollTop = listMessageDOM.scrollHeight;
      }, 100);
    },
    sendMessage(message) {
      if (this.store.state.ID_USER != null) {
        this.socket.emit("chat:message", {
          text: message,
          username: this.store.state.DATA_USER.username,
          room: this.dataConnect.room,
          map: this.dataConnect.map,
          socket: this.socket.id,
        });
      }
    },
    onGetMessages() {
      this.socket.on("chat:message", (data) => {
        this.pushMessage({
          username: data.username,
          text: data.text,
          color: "black",
          socket: data.socket,
        });
      });
    },
    clearChat() {
      this.listMsg = [];
    },
    sendToServer() {
      if (this.writingChat.length > 0) {
        this.sendMessage(this.writingChat);
        this.writingChat = "";
      }
    },
    onUserDuplicated() {
      this.socket.on("user:duplicate", (username) => {
        this.alertiw.close("romSelection");
        this.alertiw.open("userDuplicate");
        this.store.state.DATA_USER = [];
        this.store.state.ID_USER = null;
      });
    },
    onRoomsDetail() {
      this.socket.on("rooms:detail", (data) => {
        let myroom = this.dataConnect.room.title + "-" + this.dataConnect.map;

        var socket_in_this_room = data.filter((item) => {
          return item.ROOM == myroom;
        });

        this.users_in_this_room = socket_in_this_room.map((item) => {
          return {
            username: item.username,
            socket: item.id,
            position: item.position ? item.position : null,
            sprite: item.sprite,
            status: item.status,
          };
        });

        this.$emit("roomDetail", data);
      });
    },
    onJoinUser() {
      this.socket.on("join:user", (data) => {
        this.listMsg.push({
          text: '"' + data + '" has connected',
          username: "SYSTEM",
          color: "#27ae60",
        });
      });
    },
    onServer() {
      if (generalconfig["show-connection-message"]) {
        this.onJoinUser();
      }
      if (generalconfig["show-disconnection-message"]) {
        this.onDisconnect();
      }
      //this.onLeaveUser();
      this.onUserDuplicated();
      this.onRoomsDetail();
      this.onGetMessages();
    },
    /*onLeaveUser() {
      this.socket.on("leave:user", (data) => {
        this.listMsg.push({
          text: '"' + data + '" has disconnected',
          username: "SYSTEM",
          color: "#7f8c8d",
        });
      });
    },*/
    onDisconnect() {
      this.socket.on("disconnect:user", (data) => {
        this.listMsg.push({
          text: '"' + data.username + '" has disconnected',
          username: "SYSTEM",
          color: "#7f8c8d",
        });
      });
    },
  },
  components: {
    Logout,
    SendCircle,
    Earth,
    SendOutline,
  },
  computed: {
    mapSelected() {
      return this.store.state.mapSelected;
    },
    dataConnect() {
      this.clearChat();
      return {
        username: this.store.state.DATA_USER?.username,
        room: this.store.state.ROOM,
        map: this.store.state.mapSelected,
      };
    },
  },
  watch: {
    users_in_this_room(newVal) {
      let users = {};
      for (let i in newVal) {
        users[newVal[i].socket] = {
          position: newVal[i].position ? newVal[i].position : {},
          username: newVal[i].username,
          sprite: newVal[i].sprite,
          status: newVal[i].status,
        };
      }
      this.store.state.users_connected = users;
    },
    dataConnect(value) {
      if (value.username && value.room && typeof value.map == "number") {
        this.store.state.socket.emit("join:room", {
          username: value.username,
          room: value.room,
          id: this.store.state.socket.id,
          token: this.store.state.token,
          ID_USER: this.store.state.ID_USER,
          map: value.map,
          sprite: this.store.state.DATA_USER.data.sprite,
        });
      }
    },
    userLoad(value) {
      if (value) {
        this.onServer();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
$other-users-burble: rgb(99, 216, 105);
$user-burble: rgba(169, 214, 247, 0.884);
$notification-chat: rgba(240, 240, 240, 0.616);
.chat-description {
  padding: 3px;
  @include flex(center);
  text-align: center;
  background: #bbbbbb65;
  border-bottom: 1px solid #bbbbbb;
  border-top: 1px solid #bbbbbb;
  margin-bottom: 5px;
  font-size: 12px;
  color: rgb(0, 0, 0);
}
.duplicate-user-alert {
  width: 280px;
  height: 270px;
  @include flex(center, wrap, row, flex-start);
  padding: 0px 25px;

  * {
    margin: 10px 5px;
  }
  p {
    text-align: justify;
  }
  img {
    pointer-events: none;
    user-select: none;
  }
  .logout {
    @include flex(center);
    width: 60%;
    margin-bottom: 20px;
    height: 30px;
    border-radius: 5px;
    background-color: rgb(240, 0, 0);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    border: none;
    outline: none;
  }
}
.chat-online {
  #system {
    background: $notification-chat;
    font-size: 11px;
    font-style: italic;
    padding: 5px;
    margin: 4px 0;
    z-index: 12;
    max-width: 100%;
    width: calc(100% - 10px) !important;
    border-radius: 5px;
    border: none;
    text-align: center;

    span {
      display: none;
    }
    &::before {
      display: none;
    }
  }

  position: relative;
  height: 80%;
  padding: 5px 0px;
  padding-top: 0;
  animation: slide-in-left 0.5s ease-in-out;
  animation-fill-mode: forwards;

  @keyframes slide-in-left {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .list-msg {
    height: 75%;
    margin: 0px 5px;
    display: block;
    border-radius: 20px;
    min-height: 300px;

    text-align: left;
    list-style: none;
    @include scrollbar("y", #bbbbbb);
    padding: 0 5px;
    font-family: "Roboto-Regular";
    font-size: 12px;

    .other-users,
    .user {
      position: relative;
      padding: 8px;
      margin: 5px 0;
      z-index: 12;
      width: auto;
      min-width: 120px;
      max-width: 80%;
      border-radius: 12px;
      display: inline-block;
      margin-right: 10px;
      word-wrap: break-word;
      padding-bottom: 25px;
      user-select: all;
      &:after {
        content: "";
        position: absolute;
        bottom: -4px;
        display: block;
        width: 0;
        z-index: 11;
      }
      &:before {
        z-index: 10;
        content: "";
        position: absolute;
        border-style: solid;
        display: block;
        width: 0;
        top: 10px;
        bottom: auto;
      }
    }
    .user {
      background: $user-burble;
      float: left;
      margin-left: 5px;
      &:after {
        left: 46px;
      }
      &:before {
        border-color: $user-burble transparent;
        bottom: auto;
        left: -10px;
        border-width: 5px 15px 7px 0;
        border-color: transparent $user-burble;
      }
    }
    .other-users {
      background: $other-users-burble;
      float: right;
      padding: 8px;

      text-align: right;
      &:after {
        left: 46px;
      }
      &:before {
        border-color: $other-users-burble transparent;
        right: auto;
        right: -10px;
        border-width: 5px 0 7px 15px;
        border-color: transparent $other-users-burble;
      }
    }
    .other-users,
    .user {
      padding-bottom: 20px;

      .text-username {
        position: absolute;
        bottom: 3px;
        right: 10px;
        font-family: "nunito-bold";
        font-style: italic;
        color: rgb(42, 14, 202);
      }
    }
  }
  .bottom-controls {
    width: 100%;
    height: 15%;
    @include flex(flex-start, nowrap, column);
  }
  .chat-list {
    margin: 0;
    height: 20px;
    width: 100% !important;
    border-bottom: solid 0px rgb(219, 219, 219);
    z-index: 10px;
    div {
      @include flex(center);
      svg {
        font-size: 12px;
        margin-right: 5px;
      }
      padding: 0px 5px;
      border-radius: 10px;
      width: auto;
      font-size: 11px;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
    width: 100%;
    @include flex(space-evenly);
    .menu-desp {
      width: 100%;
      position: relative;
      margin-top: 30%;
      border-top: 1px solid rgb(214, 214, 214);
      border-radius: 0px !important;
      > span {
        width: 25%;
        margin-bottom: 5px;
      }
      > ul {
        position: absolute;
        width: 20%;
        top: -35px;
        list-style: none;
        display: none;
        flex-wrap: wrap;
        z-index: 100;

        > li {
          width: auto;
          margin-bottom: 5px;
          @include flex(center);
          &:hover {
            color: rgb(4, 9, 250);
          }
        }
      }
    }
  }
}
.write-user {
  width: 100%;
  height: auto;
  @include flex(space-around);
  position: absolute;
  padding: 10px 0px;
  bottom: 0;
  input {
    height: 20px;
    border: none;
    font-size: 13px;
    padding: 5px;
    width: 70%;
    border-radius: 20px;
    outline: none;
    &:focus {
      border: solid 1px rgb(107, 107, 107);
    }
  }
  button {
    @include flex(center);
    cursor: pointer;
    background: none;
    outline: none;
    border: none;
    font-size: 30px;
    color: rgba(106, 157, 190, 0.884);
  }
}
.list-enter-from {
  opacity: 0;
  transform: scale(0);
}
.list-enter-to {
  opacity: 1;
  transform: scale(1);
}
.list-enter-active {
  transition: opacity 0.2s ease-in;
}
</style>
