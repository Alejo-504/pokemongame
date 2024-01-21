<template>
  <div id="admin-app">
    <config-section title="INDEX BANNERS">
      <options-articles />
    </config-section>
  </div>
</template>
<script>
import configSection from "@/components/admin/config-section";
import optionsArticles from "@/components/admin/options-articles";

export default {
  components: {
    configSection,
    optionsArticles,
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
#admin-app {
  width: 100vw;
  min-height: 100vh;
  background: rgb(0, 0, 0);
  height: auto;
  color: white;
  @include flex(center);
  
}
</style>
