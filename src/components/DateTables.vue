<template>
  <div class="date-tables">
    <div class="date-tables__panel is-left">
      <div class="date-tables__panel__header">
        <div class="buttons-wrapper">
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
        </div>
        <div class="date_tables__month">
          {{ leftLabel }}
        </div>
      </div>
      <DateTable
        :date="date"
        :year="leftYear"
        :month="leftMonth"
        :min-date="minDate"
        :max-date="maxDate"
        :range-state="rangeState"
        :disabled-date="disabledDate"
        @range="$emit('range', $event)"
        @pick="$emit('pick', $event)"
      />
    </div>
    <div class="date-tables__panel is-right">
      <div class="date-tables__panel__header">
        <div class="date_tables__month">
          {{ rightLabel }}
        </div>
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
        @range="$emit('range', $event)"
        @pick="$emit('pick', $event)"
      />
    </div>
  </div>
</template>
<script>
import DateTable from "./DateTable.vue";
import locale from 'date-fns/locale/en-US'

export default {
  name: "DateTables",
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
    leftLabel() {
      return locale.localize.month(this.leftMonth) + " " + this.leftYear;
    },
    rightLabel() {
      return locale.localize.month(this.rightMonth) + " " + this.rightYear;
    },
    leftYear() {
      return this.date.getFullYear();
    },
    leftMonth() {
      return this.date.getMonth();
    },
    rightYear() {
      return this.rightDate.getFullYear();
    },
    rightMonth() {
      return this.rightDate.getMonth();
    },
    rightDate() {
      const newDate = new Date(this.date);
      const month = newDate.getMonth();
      newDate.setDate(1);

      if (month === 11) {
        newDate.setFullYear(newDate.getFullYear() + 1);
        newDate.setMonth(0);
      } else {
        newDate.setMonth(month + 1);
      }
      return newDate;
    }
  },
  methods: {
    getDayCountOfMonth(year, month) {
      if (month === 3 || month === 5 || month === 8 || month === 10) {
        return 30;
      }

      if (month === 1) {
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          return 29;
        } else {
          return 28;
        }
      }

      return 31;
    },
    prevMonth() {
      const src = this.date;
      const year = src.getFullYear();
      const month = src.getMonth();
      const date = src.getDate();

      const newYear = month === 0 ? year - 1 : year;
      const newMonth = month === 0 ? 11 : month - 1;

      const newMonthDayCount = this.getDayCountOfMonth(newYear, newMonth);
      if (newMonthDayCount < date) {
        src.setDate(newMonthDayCount);
      }

      src.setMonth(newMonth);
      src.setFullYear(newYear);

      const prevMonth = new Date(src.getTime());
      this.$emit("date", prevMonth);
    },
    nextMonth() {
      const src = this.date;
      const year = src.getFullYear();
      const month = src.getMonth();
      const date = src.getDate();

      const newYear = month === 11 ? year + 1 : year;
      const newMonth = month === 11 ? 0 : month + 1;

      const newMonthDayCount = this.getDayCountOfMonth(newYear, newMonth);
      if (newMonthDayCount < date) {
        src.setDate(newMonthDayCount);
      }

      src.setMonth(newMonth);
      src.setFullYear(newYear);

      const nextMonth = new Date(src.getTime());
      this.$emit("date", nextMonth);
    },

    nextYear() {
      const date = new Date(this.date);
      date.setFullYear(date.getFullYear() + 1);
      this.$emit("date", date);
    },

    prevYear() {
      const date = new Date(this.date);
      date.setFullYear(date.getFullYear() - 1);
      this.$emit("date", date);
    }
  }
};
</script>
