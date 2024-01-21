<template>
  <img
    :style="size ? 'width:' + size + '; height:' + size + ';' : ''"
    :src="require('@/assets/' + name)"
  />
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: "25px",
    },
  },
};
</script>
<style lang="scss" scoped></style>
