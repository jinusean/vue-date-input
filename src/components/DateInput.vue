<template>
  <el-input
    ref="input"
    :value="displayValue"
    :size="size"
    prefix-icon="icon-calendar"
    @change.native="updateValue($event.target.value)"
  />
</template>
<script>
import Locale from 'element-ui/lib/mixins/locale'
import { TYPE_VALUE_RESOLVER_MAP, DEFAULT_FORMATS } from '../util/display'
import { Input } from 'element-ui'

export default {
  name: 'DateInput',
  components: { ElInput: Input },
  mixins: [Locale],
  props: {
    value: {
      type: Date,
      required: true
    },
    size: {
      type: String,
      default: 'medium'
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
      const formatter = TYPE_VALUE_RESOLVER_MAP.date.formatter
      const format = DEFAULT_FORMATS.daterange

      return formatter(value, format)
    },
    updateValue(value) {
      const parser = TYPE_VALUE_RESOLVER_MAP.date.parser
      const parsedValue = parser(value, DEFAULT_FORMATS.date)

      this.$emit('input', parsedValue)
      this.displayValue = this.formatValue(parsedValue)
      this.$refs.input.currentValue = this.displayValue
      this.$refs.input.blur()
      this.$forceUpdate()
    }
  }
}
</script>
<style lang="scss">
.icon-date {
  font: normal normal normal 14px/1 FontAwesome !important;
  right: initial;
  &:before {
    content: '\f133';
  }
}
</style>
