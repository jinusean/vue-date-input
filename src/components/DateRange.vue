<template>
  <div class="date-range">
    <div class="date-range__content">
      <DateInputs
        ref="dateInputs"
        :dates="dates"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled-date="disabledDate"
        @pick="onPick"
      />

      <DateTables
        :date="date"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled-date="disabledDate"
        :range-state="rangeState"
        @date="date = $event"
        @range="onRange"
        @pick="onPick"
      />

      <div class="date-range__footer">
        <button
          class="btn-cancel"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          class="btn-confirm"
          @click="handleConfirm"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DateInputs from './DateInputs.vue'
import DateTables from './DateTables.vue'

export default {
  name: 'DateRange',
  components: { DateInputs, DateTables },
  model: {
    prop: 'dates',
    event: 'dates'
  },
  props: {
    dates: {
      type: Array,
      default() {
        return []
      }
    },
    disabledDate: {
      type: Function,
      default: () => false
    }
  },
  data() {
    return {
      date: null,
      minDate: null,
      maxDate: null,
      rangeState: {
        endDate: null,
        selecting: false,
        row: null,
        column: null
      }
    }
  },
  watch: {
    dates: {
      immediate: true,
      handler(newVal) {
        this.resetView(newVal)
      }
    }
  },

  methods: {
    resetView(newVal = this.dates) {
      this.minDate = new Date(newVal[0])
      this.maxDate = new Date(newVal[1])
      if (this.minDate) {
        this.date = new Date(this.minDate)
      }
    },
    onRange(val) {
      this.minDate = val.minDate
      this.maxDate = val.maxDate
      this.rangeState = val.rangeState
    },
    onPick(val) {
      if (this.maxDate === val.maxDate && this.minDate === val.minDate) {
        return
      }
      this.maxDate = val.maxDate
      this.minDate = val.minDate

      // workaround for https://github.com/ElemeFE/element/issues/7539, should remove this block when we don't have to care about Chromium 55 - 57
      setTimeout(() => {
        this.maxDate = val.maxDate
        this.minDate = val.minDate
      }, 10)
    },

    handleConfirm() {
      this.$emit('dates', [this.minDate, this.maxDate])
      this.$emit('close')
    }
  }
}
</script>
