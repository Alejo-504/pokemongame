<template>
  <section class="section-config" :style="'background:' + color + ';'">
    <h1>
      <Icons name="cog.png" size="40px" /> {{ title
      }}<Icons id="save-config" name="content-save.svg" size="35px" />
    </h1>
    <slot></slot>
  </section>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "rgb(233, 233, 233)",
    },
  },
};
</script>
<style lang="scss">
@import "@/_basic.scss";

.section-config {
  box-shadow: 7px 9px 30px -19px rgba(0, 0, 0, 0.75);
  .list-item-config {
    @include flex(space-evenly, wrap);
    padding: 20px;
  }
  .item-config {
    padding: 5px;
    border-radius: 15px;
    margin: 10px 20px;
  }
  #save-config {
    position: absolute;
    right: 0;
    cursor: pointer;
  }
  .textarea {
    resize: none;
    font-family: "nunito-light";
  }
  width: 80%;
  padding: 30px;
  border-radius: 5px;
  color: black;
  margin: 45px auto;
  min-width: 350px;

  h3 {
    text-align: center;
    width: 100%;
  }
  h1 {
    position: relative;
    margin-bottom: 30px;
    border-bottom: solid 3px rgb(0, 0, 0);
    @include flex(flex-start);
    text-align: center;
  }
}
ul {
  list-style: none;
  @include flex(center, nowrap, column);
}
li {
  width: auto;
  margin-bottom: 20px;
  @include flex(flex-start, nowrap, column, flex-start);
}
select {
  border: none;
  padding: 2px;
  background: rgb(218, 216, 216);
  border-radius: 5px;
  outline: none;
  margin-top: -10px;
  width: 100px;
  @include flex(flex-end, wrap);
}
.option-col {
  @include flex(flex-start, nowrap, column, flex-start);
  label {
    font-size: 12px;
    margin-bottom: -10px;
  }
}

.option {
  margin: 5px 10px;
}
label {
  display: block;
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
