<template>
  <div class="date-tables">
    <div class="date-tables__panel is-left">
      <div class="date-tables__panel__header">
        <button
          type="button"
          class="date-tables__icon-btn el-icon-d-arrow-left"
          @click="prevYear"
        />
        <button
          type="button"
          class="date-tables__icon-btn el-icon-arrow-left"
          @click="prevMonth"
        />
        <div>{{ leftLabel }}</div>
      </div>
      <DateTable
        :date="date"
        :year="leftYear"
        :month="leftMonth"
        :min-date="minDate"
        :max-date="maxDate"
        :range-state="rangeState"
        :disabled-date="disabledDate"
        selection-mode="range"
        @range="$emit('range', $event)"
        @pick="$emit('pick', $event)"
      />
    </div>
    <div class="date-tables__panel is-right">
      <div class="date-tables__panel__header">
        <div>{{ rightLabel }}</div>
        <div class="buttons-wrapper">
          <button
            type="button"
            class="date-tables__icon-btn el-icon-arrow-right"
            @click="nextMonth"
          />
          <button
            type="button"
            class="date-tables__icon-btn el-icon-d-arrow-right"
            @click="nextYear"
          />
        </div>
      </div>
      <DateTable
        :date="rightDate"
        :year="rightYear"
        :month="rightMonth"
        :min-date="minDate"
        :max-date="maxDate"
        :range-state="rangeState"
        :disabled-date="disabledDate"
        selection-mode="range"
        @range="$emit('range', $event)"
        @pick="$emit('pick', $event)"
      />
    </div>
  </div>
</template>
<script>
import { t } from 'element-ui/lib/locale'
import { nextMonth, prevMonth } from '../util/index'
import DateTable from './DateTable.vue'

export default {
  name: 'DateTables',
  components: { DateTable },
  props: {
    disabledDate: {
      type: Function,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    minDate: {
      type: Date,
      required: true
    },
    maxDate: {
      type: Date,
      default: null
    },
    rangeState: {
      type: Object,
      default: null
    }
  },
  computed: {
    btnDisabled() {
      return !(this.minDate && this.maxDate && !this.selecting)
    },
    leftLabel() {
      return (
        this.date.getFullYear() +
        ' ' +
        t('el.datepicker.year') +
        ' ' +
        t(`el.datepicker.month${this.date.getMonth() + 1}`)
      )
    },
    rightLabel() {
      return (
        this.rightDate.getFullYear() +
        ' ' +
        t('el.datepicker.year') +
        ' ' +
        t(`el.datepicker.month${this.rightDate.getMonth() + 1}`)
      )
    },
    leftYear() {
      return this.date.getFullYear()
    },
    leftMonth() {
      return this.date.getMonth()
    },
    rightYear() {
      return this.rightDate.getFullYear()
    },
    rightMonth() {
      return this.rightDate.getMonth()
    },
    rightDate() {
      const newDate = new Date(this.date)
      const month = newDate.getMonth()
      newDate.setDate(1)

      if (month === 11) {
        newDate.setFullYear(newDate.getFullYear() + 1)
        newDate.setMonth(0)
      } else {
        newDate.setMonth(month + 1)
      }
      return newDate
    }
  },
  methods: {
    prevMonth() {
      this.$emit('date', prevMonth(this.date))
    },

    nextMonth() {
      this.$emit('date', nextMonth(this.date))
    },

    nextYear() {
      const date = new Date(this.date)
      date.setFullYear(date.getFullYear() + 1)
      this.$emit('date', date)
    },

    prevYear() {
      const date = new Date(this.date)
      date.setFullYear(date.getFullYear() - 1)
      this.$emit('date', date)
    }
  }
}
</script>
