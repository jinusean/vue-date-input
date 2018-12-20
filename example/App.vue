<template>
  <div class="container">
    <DatePicker v-model="dates"/>
  </div>
</template>

<script>
import DatePicker from '../src'

export default {
  components: { DatePicker },
  data() {
    return {
      dates: [new Date(), new Date()]
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>