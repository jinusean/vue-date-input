<template>
  <div class="container">
    <DatePicker v-model="dates" />
  </div>
</template>

<script>
import DatePicker from "../src";

export default {
  components: { DatePicker },
  data() {
    return {
      dates: [new Date(), new Date()]
    };
  }
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}

.container {
  display: flex;
  justify-content: center;
  height: 100%;
  padding-top: 20%;
}
</style>
