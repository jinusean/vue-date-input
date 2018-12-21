<template>
  <Transition 
    name="zoom-in-top" 
    @after-leave="$emit('dodestroy')"
  >
    <div 
      v-show="visible" 
      class="date-range"
    >
      <div 
        v-if="value" 
        class="date-range__content"
      >
        <DateInputs
          ref="dateInputs"
          :dates="value"
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
          @date="onDate"
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
  </Transition>
</template>

<script type="text/babel">
import { toDate } from '../util/index'
import Locale from 'element-ui/lib/mixins/locale'
import DateInputs from './DateInputs.vue'
import DateTables from './DateTables.vue'

const calcDefaultValue = defaultValue => {
  if (Array.isArray(defaultValue)) {
    return defaultValue[0] ? new Date(defaultValue[0]) : new Date()
  } else {
    return new Date(defaultValue)
  }
}

export default {
  name: 'DateRange',
  components: { DateInputs, DateTables },
  mixins: [Locale],
  data() {
    return {
      minPickerWidth: 0,
      maxPickerWidth: 0,
      date: this.$options.defaultValue
        ? calcDefaultValue(this.$options.defaultValue)
        : new Date(),
      minDate: null,
      maxDate: null,
      rangeState: {
        endDate: null,
        selecting: false,
        row: null,
        column: null
      },
      value: null,
      visible: false,
      disabledDate: () => false
    }
  },
  watch: {
    visible(visible) {
      if (!visible) {
        return
      }
      // Delay to next tick because dateInputs is not yet visible, v-if
      this.$nextTick(() => {
        this.$refs.dateInputs.focus()
      })
    },
    value(newVal) {
      if (!newVal) {
        this.minDate = null
        this.maxDate = null
      } else if (Array.isArray(newVal)) {
        this.resetView(newVal)
      }
    }
  },

  methods: {
    resetView(newVal = this.value) {
      this.minDate = newVal[0] ? toDate(newVal[0]) : null
      this.maxDate = newVal[1] ? toDate(newVal[1]) : null
      if (this.minDate) this.date = new Date(this.minDate)
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
    onDate(date) {
      this.date = date
    },

    handleConfirm() {
      this.$emit('pick', [this.minDate, this.maxDate])
    }
  }
}
</script>
