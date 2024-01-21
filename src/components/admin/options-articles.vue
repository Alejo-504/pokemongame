<template>
  <ul class="list-item-config">
    <li
      class="item-config"
      v-for="art in Object.keys(articles)"
      v-bind:key="art"
    >
      <h3>Banner #{{ art }}</h3>

      <ul>
        <li class="option-col">
          <label for="title">title</label>
          <input
            type="text"
            name="title"
            id="title"
            :value="articles[art].text.title"
          />
        </li>
        <li class="option">
          <textarea
            v-model="articles[art].text.description"
            placeholder="description"
            id="description"
            name="description"
          >
          </textarea>
        </li>
        <li class="option-col">
          <label for="src">Image(name, web-src)</label>
          <input
            type="text"
            name="src"
            id="src"
            :value="articles[art].background.src"
          />
        </li>

        <li class="option">
          <label for="attachment">attachment</label>
          <select id="attachment" name="attachment">
            <option>fixed</option>
            <option>scroll</option>
          </select>
        </li>
        <li class="option">
          <label for="size">size</label>
          <select id="size" name="size">
            <option>cover</option>
            <option>contain</option>
            <option>auto</option>
          </select>
        </li>
        <li class="option">
          <label for="align">Align</label>
          <select id="align" name="align">
            <option>center</option>
            <option>end</option>
            <option>start</option>
          </select>
        </li>
        <li class="option">
          <label for="theme">Theme</label>
          <select id="theme" name="theme">
            <option>ligth</option>
            <option>dark</option>
          </select>
        </li>
        <li class="option">
          <label for="theme">Effect</label>
          <select id="theme" name="theme">
            <option>zoom-out</option>
            <option>zoom-in</option>
          </select>
        </li>
      </ul>
    </li>

    <button id="new-item" @click="addItem">+</button>
  </ul>
</template>
<script>
import config_articles from "@/config/articles.json";

export default {
  data() {
    return { articles: config_articles };
  },
  methods: {
    addItem() {
      let new_item = {
        background: {
          src: "",
          attachment: "fixed",
          size: "cover",
          align: "center",
          theme: "ligth",
        },
        text: {
          title: "",
          description: "",
        },
      };
      this.articles.push(new_item);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.list-item-config {
  position: relative;
}
#new-item {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  background: rgb(22, 125, 173);
  color: white;
  font-family: "Roboto-Black";
  font-size: 30px;
  border: none;
  @include flex(center);
  padding: 5px;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 0;
}
input {
  border: none;
  padding: 5px;
  border-radius: 3px;
  font-family: "nunito-bold";
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
}

#description {
  border: none;
  height: 100px;

  padding: 8px;
}
</style>
