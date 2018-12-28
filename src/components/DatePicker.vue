<template>
  <div class="date-picker" :class="{'date-picker-open': isDateRangeOpen}">
    <div class="date-input">
      <span class="date-input__icon">
        <img
          class="icon-calendar"
          src="../assets/calendar-icon.svg"
        >
      </span>

      <input
        ref="reference"
        :value="displayValue"
        readonly
        class="date-picker__input"
        @focus="toggleDateRange(true)"
        @change.native="$event.target.value = displayValue"
      >
    </div>
    <Transition name="expand">
      <DateRange
        v-if="isDateRangeOpen"
        ref="dateRange"
        v-model="dateValues"
        @close="toggleDateRange(false)"
        @keydown.native="handlePopperKeyDown"
      />
    </Transition>
  </div>
</template>
<script>
import DateRange from './DateRange.vue'
import tabbable from 'tabbable'
import { formatDate, validate } from '../util/index.js'

export default {
  name: 'DatePicker',
  components: { DateRange },
  model: {
    prop: 'dates',
    event: 'dates'
  },
  props: {
    dates: {
      type: Array,
      required: true,
      validator([start, end]) {
        if (!validate(start) || !validate(end)) return false
        return start.getTime() <= end.getTime()
      }
    }
  },

  data() {
    return {
      isDateRangeOpen: false
    }
  },

  computed: {
    reference() {
      return this.$refs.reference.$el
    },
    displayValue() {
      const [start, end] = this.dates
      return formatDate(start) + ' - ' + formatDate(end)
    },
    dateValues: {
      get() {
        return this.dates
      },
      set(dates) {
        this.$emit('dates', dates)
      }
    }
  },
  beforeDestroy() {
    this.toggleDateRange(false)
  },

  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.toggleDateRange(false)
        event.stopPropagation()
      }
    },

    toggleDateRange(toggle) {
      const method = toggle ? 'addEventListener' : 'removeEventListener'
      document.body[method]('click', this.handleBodyClick)
      document.body[method]('keydown', this.handleKeydown)
      this.isDateRangeOpen = toggle
      if (!toggle && this.$refs.reference) {
        this.$refs.reference.blur()
      }
    },

    handleBodyClick({ target }) {
      if (this.$el.contains(target)) {
        return
      }
      this.toggleDateRange(false)
    },

    handlePopperKeyDown(event) {
      if (event.key.toUpperCase() !== 'TAB') {
        return
      }

      const { target } = event
      const popperTabbable = tabbable(this.$refs.dateRange.$el)
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

      this.toggleDateRange(false)
      tabbableElements[nextIndex].focus()
    }
  }
}
</script>
