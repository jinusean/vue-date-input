<template>
  <el-input
    v-clickoutside="hidePicker"
    ref="reference"
    :class="inputClass"
    :readonly="true"
    :size="size"
    :id="id"
    :placeholder="placeholder"
    :name="name"
    :value="displayValue"
    :validate-event="false"
    class="date-picker"
    prefix-icon="icon-calendar"
    @focus="showPicker"
    @keydown.native="handleKeydown"
    @change.native="displayValue = $event.target.value"
  />
</template>

<script>
import Vue from 'vue'
import DateRange from './DateRange'
import popperMixin from './popperMixin'
import Clickoutside from 'element-ui/lib/utils/clickoutside'
import { equalDate, isDate } from '../util/index'
import { TYPE_VALUE_RESOLVER_MAP, DEFAULT_FORMATS } from '../util/display'
import Emitter from 'element-ui/lib/mixins/emitter'
import { Input } from 'element-ui'

// only considers date-picker's value: Date or [Date, Date]

export default {
  name: 'DatePicker',
  components: { ElInput: Input, DateRange },
  directives: { Clickoutside },
  mixins: [Emitter, popperMixin],
  props: {
    size: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    align: {
      type: String,
      default: 'left'
    },
    value: {
      type: Array,
      required: true
    },
    defaultValue: {
      type: Array,
      default: undefined
    },
    rangeSeparator: {
      type: String,
      default: ' - '
    },
    pickerOptions: {
      type: Object,
      default: undefined
    }
  },

  data() {
    return {
      pickerVisible: false,
      currentValue: '',
      unwatchPickerOptions: null,
      panel: DateRange,
      type: 'daterange'
    }
  },

  computed: {
    reference() {
      return this.$refs.reference.$el
    },
    inputClass() {
      let inputClass = 'el-date-editor--daterange'
      if (this.pickerVisible) {
        inputClass += ' date-picker-open date-picker-mobile'
      }

      return inputClass
    },

    valueIsEmpty() {
      const val = this.currentValue
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          if (val[i]) {
            return false
          }
        }
      } else {
        if (val) {
          return false
        }
      }
      return true
    },

    displayValue: {
      get() {
        const value = this.currentValue
        if (!value) return
        const formatter = TYPE_VALUE_RESOLVER_MAP.daterange.formatter
        const format = DEFAULT_FORMATS[this.type]

        return formatter(value, this.format || format, this.rangeSeparator)
      },

      set(value) {
        if (value) {
          const type = this.type
          const parser = (
            TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP['default']
          ).parser
          const parsedValue = parser(
            value,
            this.format || DEFAULT_FORMATS[type],
            this.rangeSeparator
          )

          if (parsedValue && this.picker) {
            this.picker.value = parsedValue
          }
        } else {
          this.$emit('input', value)
          this.picker.value = value
        }
        this.$forceUpdate()
      }
    }
  },

  watch: {
    currentValue(val) {
      if (val) return
      if (this.picker && typeof this.picker.handleClear === 'function') {
        this.picker.handleClear()
      } else {
        this.$emit('input')
      }
    },
    value: {
      immediate: true,
      handler(val) {
        this.currentValue = isDate(val) ? new Date(val) : val
      }
    },
    displayValue(val) {
      this.$emit('change', val)
      this.dispatch('ElFormItem', 'el.form.change')
    }
  },

  created() {
    const PLACEMENT_MAP = {
      left: 'bottom-start',
      center: 'bottom',
      right: 'bottom-end'
    }

    // vue-popper
    this.popperOptions = {
      boundariesPadding: 0,
      gpuAcceleration: false
    }
    this.placement = PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left
  },

  methods: {
    dateChanged(dateA, dateB) {
      if (Array.isArray(dateA)) {
        let len = dateA.length
        if (!dateB) return true
        while (len--) {
          if (!equalDate(dateA[len], dateB[len])) return true
        }
      } else {
        if (!equalDate(dateA, dateB)) return true
      }

      return false
    },

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.hidePicker()
        event.stopPropagation()
      }
    },

    hidePicker() {
      if (this.picker) {
        this.dispatch('ElFormItem', 'el.form.blur')
        this.pickerVisible = this.picker.visible = false
        this.$refs.reference.blur()
        document.body.removeEventListener('keydown', this.handleKeydown)
        this.destroyPopper()
      }
    },

    showPicker() {
      if (!this.picker) {
        this.mountPicker()
        return this.showPicker()
      }
      this.picker.value = this.currentValue
      this.picker.resetView()
      this.picker.visible = true
      this.pickerVisible = true
      setTimeout(() => {}, 2000)
      this.updatePopper()

      this.$nextTick(() => {
        this.picker.ajustScrollTop && this.picker.ajustScrollTop()
      })

      document.body.addEventListener('keydown', this.handleKeydown)
    },

    mountPicker() {
      this.panel.defaultValue = this.defaultValue || this.currentValue
      this.picker = new Vue(this.panel).$mount()
      this.popperElm = this.picker.$el
      if (this.format) {
        this.picker.format = this.format
      }

      const updateOptions = () => {
        const options = this.pickerOptions

        if (options && options.selectableRange) {
          let ranges = options.selectableRange
          const parser = TYPE_VALUE_RESOLVER_MAP.datetimerange.parser
          const format = DEFAULT_FORMATS.timerange

          ranges = Array.isArray(ranges) ? ranges : [ranges]
          this.picker.selectableRange = ranges.map(range =>
            parser(range, format, this.rangeSeparator)
          )
        }

        for (const option in options) {
          if (
            options.hasOwnProperty(option) &&
            // 忽略 time-picker 的该配置项
            option !== 'selectableRange'
          ) {
            this.picker[option] = options[option]
          }
        }
      }
      updateOptions()
      this.unwatchPickerOptions = this.$watch(
        'pickerOptions',
        () => updateOptions(),
        { deep: true }
      )

      this.$el.appendChild(this.picker.$el)

      this.picker.$on('dodestroy', this.doDestroy)
      this.picker.$on('pick', (date = '') => {
        const valueEquals = function(a, b) {
          const aIsArray = a instanceof Array
          const bIsArray = b instanceof Array
          if (aIsArray && bIsArray) {
            return (
              new Date(a[0]).getTime() === new Date(b[0]).getTime() &&
              new Date(a[1]).getTime() === new Date(b[1]).getTime()
            )
          }
          if (!aIsArray && !bIsArray) {
            return new Date(a).getTime() === new Date(b).getTime()
          }
          return false
        }
        // do not emit if values are same
        if (!valueEquals(this.value, date)) {
          this.$emit('input', date)
        }
        this.hidePicker()
      })

      let closeTimeoutId = null
      this.picker.$on('select-range', (start, end) => {
        if (!this.reference) {
          return
        }
        clearTimeout(closeTimeoutId)
        const refInput = this.reference.querySelector('input')
        refInput.setSelectionRange(start, end)
        refInput.focus()
      })

      this.picker.$on('close', () => {
        this.hidePicker()
        this.$nextTick(this.picker.resetView)
        const animationDuration = 300
        this.hidePicker()
        clearTimeout(closeTimeoutId)
        closeTimeoutId = setTimeout(this.picker.resetView, animationDuration)
      })
    },

    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy()
        this.picker.$off()
        if (typeof this.unwatchPickerOptions === 'function') {
          this.unwatchPickerOptions()
        }
        this.picker.$el.parentNode.removeChild(this.picker.$el)
      }
    }
  }
}
</script>
<style src="../styles/date-picker.scss" lang="scss" />
