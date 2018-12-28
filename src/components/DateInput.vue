<template>
  <div class="date-input">
    <input
      ref="input"
      v-model="displayValue"
      @focus="$emit('focus', $event)"
      @change="updateValue($event.target.value)"
    >
  </div>
</template>
<script>
import { formatDate, parseDate } from '../util/index.js'

export default {
  name: 'DateInput',
  props: {
    value: {
      type: Date,
      required: true
    }
  },
  data() {
    return {
      displayValue: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.displayValue = this.formatValue(value)
        if (this.$refs.input) {
          this.$refs.input.currentValue = this.displayValue
        }
      }
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus()
    },
    formatValue(value) {
      return formatDate(value, 'yyyy-M-d')
    },
    updateValue(value) {
      // parseDate will return null if invalid
      const newDate = parseDate(value)
      this.displayValue = this.formatValue(newDate || this.value)
      this.$refs.input.currentValue = this.displayValue
      this.$forceUpdate()

      if (newDate) {
        this.$emit('input', newDate)
        this.$refs.input.blur()
      }
    }
  }
}
</script>
