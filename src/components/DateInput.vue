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
import { TYPE_VALUE_RESOLVER_MAP, DEFAULT_FORMATS } from "../util/display";

export default {
  name: "DateInput",
  props: {
    value: {
      type: Date,
      required: true
    }
  },
  data() {
    return {
      displayValue: ""
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.displayValue = this.formatValue(value);
        if (this.$refs.input) {
          this.$refs.input.currentValue = this.displayValue;
        }
      }
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    formatValue(value) {
      const formatter = TYPE_VALUE_RESOLVER_MAP.date.formatter;
      const format = DEFAULT_FORMATS.daterange;

      return formatter(value, format);
    },
    updateValue(value) {
      const parser = TYPE_VALUE_RESOLVER_MAP.date.parser;
      const parsedValue = parser(value, DEFAULT_FORMATS.date);

      this.$emit("input", parsedValue);
      this.displayValue = this.formatValue(parsedValue);
      this.$refs.input.currentValue = this.displayValue;
      this.$refs.input.blur();
      this.$forceUpdate();
    }
  }
};
</script>
