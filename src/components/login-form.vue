<template>
  <div id="login-container">
    <div class="circle-dec"></div>
    <div class="msgSpace">
      <PushMsg
        :close="false"
        name="onLoginRegisterMsg"
        type="info"
        :startOn="true"
        >If you are not yet a user,
        <span class="registerBtn" @click="alertiw.open('formRegister')"
          >register here!</span
        >
      </PushMsg>
      <PushMsg :timeout="5000" name="errorLogin" type="danger"> </PushMsg>
    </div>
    <form id="loginUser" @submit.prevent="login(credentials)" novalidate>
      <img class="login-img" :src="charmander" />
      <div class="tab1-login">
        <ul>
          <li class="input-alert" id="usernameLogin">
            <input
              name="usernameLogin"
              v-model="credentials.username"
              type="text"
              placeholder="Username"
            />
          </li>
          <li class="input-alert" id="passwordLogin">
            <input
              name="passwordLogin"
              v-model="credentials.password"
              type="password"
              placeholder="Password"
            />
          </li>
        </ul>
        <button
          :style="loading_login ? 'pointer-events:none; opacity:0.6;' : ''"
          type="submit"
          class="login-btn"
        >
          <ShowLoader
            v-if="loading_login"
            border="4"
            size="10"
            :css="{ top: '-20px' }"
          >
          </ShowLoader
          >Sign In
        </button>
      </div>
    </form>
    <AlertIw
      name="formRegister"
      title="Formulario de Registro"
      :cssAlert="{
        backgroundImage: 'url(' + wall + ')',
        backgroundColor: '#d10000',
        backgroundSize: 'contain',
        backgroundPosition: 'bottom',
        backgroundRepeat: 'no-repeat',
      }"
      :cssTitle="{
        backgroundColor: '#ecf0f1',
        color: 'black',
      }"
      :icon="gifRegister"
    >
      <register-form @registered-user="alertiw.close('formRegister')" />
    </AlertIw>
  </div>
</template>
<script>
import wall from "@/assets/alertWallpaper-notshadow.png";
import gifRegister from "@/assets/userRegister.gif";
import lang from "@/assets/languages-template/index.json";
import store from "@/store/index.js";
import pokemonToStart from "@/config/toStart.json";
import check from "@/assets/check.png";
import cancel from "@/assets/cancel.png";
import charmander from "@/assets/charmander.gif";
import { alertiw } from "@/components/globals/scripts/AlertIw";
import registerForm from "@/components/register-form";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      wall,
      showMsgError: false,
      showRegisterEnd: false,
      pokemonToStart: pokemonToStart["pokemon-to-start"].list,
      amountPokemon: pokemonToStart["pokemon-to-start"].amount,
      pokemonsSelected: 0,
      charmander,
      alertiw,
      store,
      check,
      cancel,
      gifRegister,
      showRegisterForm: false,
      credentials: {
        password: "",
        username: "",
      },
      tabActive: 1,
    };
  },
  components: {
    registerForm,
  },
  methods: {
    ...mapActions(["login"]),
  },
  computed: {
    loading_login() {
      return store.state.loading;
    },
    text() {
      return lang[store.state.lang];
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/_basic.scss";

.registerBtn {
  font-weight: 900;
  background: rgb(235, 93, 93);
  border-radius: 10px;
  padding: 1px 3px;

  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre;
}
.circle-dec {
  position: absolute;
  top: 0%;
  width: 100%;
  border-radius: 10px 10px 50% 50%;
  //border: solid 3px black;
  height: 350px;
  background: rgb(255, 255, 255);
  left: 0%;
  z-index: -1;
}
.login-btn {
  font-family: "bangers";
  font-size: 18px;
  cursor: pointer;
  width: 70%;
  background: #3498db;
  color: rgb(253, 253, 253);
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 10px;
  box-shadow: -1px 10px 20px -10px rgba(0, 0, 0, 0.89);
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.2);
  }
}

.login-img {
  width: 180px;
  height: 140px;
  margin: 0 20px;
}
.msgSpace {
  width: 100%;
  @include flex(center, wrap);
  > div {
    margin: 2px;
  }
}
.tooltipError {
  display: inline-block;
  background: #ffffff;
  color: #ee1414;
  font-weight: bold;
  padding: 5px 10px;
  font-size: 13px;
  border-radius: 4px;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}

.tooltipError[data-popper-placement^="top"] > #arrow {
  bottom: -4px;
}

.tooltipError[data-popper-placement^="bottom"] > #arrow {
  top: -4px;
}

.tooltipError[data-popper-placement^="left"] > #arrow {
  right: -4px;
}

.tooltipError[data-popper-placement^="right"] > #arrow {
  left: -4px;
}
.tooltipError {
  background: white;
  border: solid 1px red;
  color: red;
}
.msg-succes {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  font-family: "Roboto-Black";
  font-size: 18px;
  height: 90px;
  width: 250px;
}
.gifRegister {
  background: pink;
  width: 60px;
  height: 55px;
}
.tab1-login {
  height: 200px;
  @include flex(center, wrap);
}
form {
  width: 100%;
  height: 80%;
  max-height: 350px;
  @include flex(center, wrap);
  overflow-x: hidden;
  overflow-y: auto;
  font-family: "Roboto-Regular";
  @include scrollbar();
}
.input-alert {
  width: 180px;
  background: transparent;
  border-radius: 20px;
  height: 35px;
  position: relative;
  .check-icon {
    width: 15px;
    height: 15px;
    position: absolute;
    right: -5px;
  }
  @include flex(flex-start);
  margin: 8px;
}
.input-alert input {
  background: #ffd6a8;
  box-shadow: 10px 10px 10px -15px rgba(0, 0, 0, 0.959);
  font-family: "Roboto-Regular";
  width: 180px;
  height: 20px;
  padding: 8px;
  border: none;
  outline: none;
  border-radius: 20px;
  font-size: 14px;
  color: rgb(0, 0, 0);
  &::placeholder {
    color: #c09266;
  }
}

#login-container {
  min-width: 280px;
  max-width: 400px;
  width: 35vw;
  padding: 10px 0px;
  @include flex(center, wrap);
}
</style>
