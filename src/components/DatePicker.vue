<template>
  <Popper
    trigger="click"
    class="date-picker"
  >
    <div>
      <DateRange v-model="currentValue" />
    </div>

    <div
      slot="reference"
      class="date-input"
    >
      <span class="date-input__icon">
        <img
          class="icon-calendar"
          src="../assets/calendar-icon.svg"
        >
      </span>

      <input
        ref="reference"
        :class="inputClass"
        :value="displayValue"
        readonly
        @change.native="$event.target.value = displayValue"
      >
    </div>
  </Popper>
</template>

<script>
import Vue from 'vue'
import DateRange from './DateRange.vue'
import popperMixin from '../util/popperMixin'
import tabbable from 'tabbable'
import { formatDate, validate } from '../util'
import Popper from 'vue-popperjs'
import 'vue-popperjs/dist/css/vue-popper.css';

const ANIMATION_DURATION = 300

export default {
  name: 'DatePicker',
  // mixins: [popperMixin],
  components: { Popper, DateRange },
  props: {
    value: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      pickerVisible: false,
      currentValue: '',
      panel: DateRange,
      inputClass: '' // appends date-picker-open when open
    }
  },

  computed: {
    reference() {
      return this.$refs.reference.$el
    },
    displayValue() {
      const [start, end] = this.currentValue
      return formatDate(start) + ' - ' + formatDate(end)
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
        this.currentValue = validate(val) ? new Date(val) : val
      }
    },
    displayValue(val) {
      this.$emit('change', val)
      this.dispatch('ElFormItem', 'el.form.change')
    }
  },

  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.hidePicker()
        event.stopPropagation()
      }
    },

    hidePicker() {
      if (!this.picker) {
        return
      }
      // this.dispatch('ElFormItem', 'el.form.blur')
      document.body.removeEventListener('click', this.handleBodyClick)
      document.body.removeEventListener('keydown', this.handleKeydown)
      this.destroyPopper()
      this.pickerVisible = this.picker.visible = false
      clearTimeout(this.inputClassTimeoutId)
      this.inputClassTimeoutId = setTimeout(() => {
        this.inputClass = ''
      }, ANIMATION_DURATION)
    },

    showPicker() {
      if (!this.picker) {
        this.mountPicker()
        return this.showPicker()
      }
      this.picker.value = this.currentValue
      this.picker.resetView()
      this.picker.visible = this.pickerVisible = true
      this.inputClass = 'date-picker-open'

      // this.updatePopper()

      this.$nextTick(() => {
        this.picker.ajustScrollTop && this.picker.ajustScrollTop()
      })
      document.body.addEventListener('click', this.handleBodyClick)
      document.body.addEventListener('keydown', this.handleKeydown)

      console.log(this.picker)
    },

    handleBodyClick({ target }) {
      if (
        !this.$refs.reference ||
        this.$refs.reference.contains(target) ||
        this.picker.$el.contains(target)
      ) {
        return
      }
      this.hidePicker()
    },

    mountPicker() {
      this.panel.defaultValue = this.currentValue
      this.picker = new Vue(this.panel).$mount()
      this.picker.$el.addEventListener('keydown', this.onPopperKeyDown)

      this.$el.appendChild(this.picker.$el)

      this.picker.$on('dodestroy', this.doDestroy)
      this.picker.$on('pick', (date = '') => {
        this.$emit('input', date)
        this.hidePicker()
      })

      let closeTimeoutId = null
      this.picker.$on('select-range', (start, end) => {
        if (!this.$refs.reference) {
          return
        }
        clearTimeout(closeTimeoutId)
        const refInput = this.$refs.reference.querySelector('input')
        refInput.setSelectionRange(start, end)
        refInput.focus()
      })

      this.picker.$on('close', () => {
        this.$nextTick(this.picker.resetView)
        this.hidePicker()
        clearTimeout(closeTimeoutId)
        closeTimeoutId = setTimeout(this.picker.resetView, ANIMATION_DURATION)
      })
    },

    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy()
        this.picker.$off()
        this.picker.$el.parentNode.removeChild(this.picker.$el)
      }
    },

    onPopperKeyDown(event) {
      if (event.key.toUpperCase() !== 'TAB') {
        return
      }

      const { target } = event
      const popperTabbable = tabbable(this.picker.$el)
      let nextIndexOperand

      if (event.shiftKey && target === popperTabbable[0]) {
        // shit+tab on first tabbable element of date-picker popup
        nextIndexOperand = -1
      } else if (
        !event.shiftKey &&
        target === popperTabbable[popperTabbable.length - 1]
      ) {
        // tab on last tabbable element of date-picker popup
        nextIndexOperand = 1
      } else {
        // tabbing through date-picker elemnets
        return
      }

      event.preventDefault()
      const tabbableElements = tabbable(document.body)
      let nextIndex =
        tabbableElements.indexOf(this.$refs.reference.children[0]) +
        nextIndexOperand

      if (nextIndex < 0) {
        nextIndex = tabbableElements.length - 1
      } else if (tabbableElements === tabbableElements.length) {
        nextIndex = 0
      }

      this.hidePicker()
      tabbableElements[nextIndex].focus()
    }
  }
}
</script>
