<template>
  <table
    cellspacing="0"
    cellpadding="0"
    class="date-table"
    @click="handleClick"
    @mousemove="handleMouseMove"
  >
    <tbody>
      <tr>
        <th
          v-for="(day, index) in dayNames"
          :key="index"
        >
          {{ day }}
        </th>
      </tr>
      <tr
        v-for="(row, index) in rows"
        :key="index"
        class="el-date-table__row"
      >
        <td
          v-for="cell in row"
          :key="cell.text"
          :class="getCellClasses(cell)"
        >
          {{ cell.text }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import startOfMonth from 'date-fns/startOfMonth'
import getDaysInMonth from 'date-fns/getDaysInMonth'
import subMonths from 'date-fns/subMonths'
import subDays from 'date-fns/subDays'

const clearHours = function (time) {
  const cloneDate = new Date(time)
  cloneDate.setHours(0, 0, 0, 0)
  return cloneDate.getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

export default {
  name: 'DateTable',
  props: {
    date: {
      type: Date,
      default: undefined
    },

    year: {
      type: Number,
      default: undefined
    },

    month: {
      type: Number,
      default: undefined
    },

    week: {
      type: Number,
      default: undefined
    },

    disabledDate: {
      type: Function,
      default: undefined
    },

    minDate: {
      type: Date,
      default: undefined
    },

    maxDate: {
      type: Date,
      default: undefined
    },

    rangeState: {
      type: Object,
      default() {
        return {
          endDate: undefined,
          selecting: false,
          row: undefined,
          column: undefined
        }
      }
    }
  },

  data() {
    return {
      tableRows: [[], [], [], [], [], []],
      firstDayOfWeek: 7
    }
  },

  computed: {
    offsetDay() {
      const week = this.firstDayOfWeek
      return week > 3 ? 7 - week : -week
    },

    dayNames() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },

    startDate() {
      // Returns first monday of calendar
      const startDate = new Date(this.year, this.month, 1)
      const startDateDay = startOfMonth(startDate).getDay()
      return subDays(startDate, startDateDay)
    },

    rows() {
      const date = new Date(this.year, this.month, 1)
      let day = startOfMonth(date).getDay()
      const dateCountOfMonth = getDaysInMonth(date)
      const dateCountOfLastMonth = getDaysInMonth(subMonths(date, 1))

      day = day === 0 ? 7 : day

      const offset = this.offsetDay
      const rows = this.tableRows
      let count = 1
      let firstDayPosition

      const startDate = this.startDate
      const disabledDate = this.disabledDate
      const now = clearHours(new Date())

      for (let i = 0; i < 6; i++) {
        const row = rows[i]
        for (let j = 0; j < 7; j++) {
          let cell = row[j]
          if (!cell) {
            cell = {
              row: i,
              column: j,
              type: 'normal',
              inRange: false,
              start: false,
              end: false
            }
          }

          cell.type = 'normal'

          const index = i * 7 + j
          const time = startDate.getTime() + DAY_MS * (index - offset)
          cell.inRange =
            time >= clearHours(this.minDate) &&
            time <= clearHours(this.maxDate)
          cell.start = this.minDate && time === clearHours(this.minDate)
          cell.end = this.maxDate && time === clearHours(this.maxDate)
          const isToday = time === now

          if (isToday) {
            cell.type = 'today'
          }

          if (i >= 0 && i <= 1) {
            if (j + i * 7 >= day + offset) {
              cell.text = count++
              if (count === 2) {
                firstDayPosition = i * 7 + j
              }
            } else {
              cell.text =
                dateCountOfLastMonth - (day + offset - (j % 7)) + 1 + i * 7
              cell.type = 'prev-month'
            }
          } else {
            if (count <= dateCountOfMonth) {
              cell.text = count++
              if (count === 2) {
                firstDayPosition = i * 7 + j
              }
            } else {
              cell.text = count++ - dateCountOfMonth
              cell.type = 'next-month'
            }
          }

          cell.disabled =
            typeof disabledDate === 'function' && disabledDate(new Date(time))

          this.$set(row, j, cell)
        }
      }

      rows.firstDayPosition = firstDayPosition

      return rows
    }
  },

  watch: {
    'rangeState.endDate'(newVal) {
      this.markRange(newVal)
    },

    minDate(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.rangeState.selecting = true
        this.markRange(newVal)
      } else if (!newVal) {
        this.rangeState.selecting = false
        this.markRange(newVal)
      } else {
        this.markRange()
      }
    },

    maxDate(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.rangeState.selecting = false
        this.markRange(newVal)
        this.$emit('pick', {
          minDate: this.minDate,
          maxDate: this.maxDate
        })
      }
    }
  },

  methods: {
    getCellClasses(cell) {
      let classes = []
      if ((cell.type === 'normal' || cell.type === 'today') && !cell.disabled) {
        classes.push('available')
        if (cell.type === 'today') {
          classes.push('today')
        }
      } else {
        classes.push(cell.type)
      }

      if (cell.inRange && (cell.type === 'normal' || cell.type === 'today')) {
        classes.push('in-range')

        if (cell.start) {
          classes.push('start-date')
        }

        if (cell.end) {
          classes.push('end-date')
        }
      }

      if (cell.disabled) {
        classes.push('disabled')
      }

      return classes.join(' ')
    },

    getDateOfCell(row, column) {
      const startDate = this.startDate

      return new Date(
        startDate.getTime() + (row * 7 + column - this.offsetDay) * DAY_MS
      )
    },

    getCellByDate(date) {
      const startDate = this.startDate
      const rows = this.rows
      const index = (date - startDate) / DAY_MS
      const row = rows[Math.floor(index / 7)]

      return row[index % 7]
    },

    markRange(maxDate) {
      const startDate = this.startDate
      if (!maxDate) {
        maxDate = this.maxDate
      }

      const rows = this.rows
      const minDate = this.minDate
      for (var i = 0, k = rows.length; i < k; i++) {
        const row = rows[i]
        for (var j = 0, l = row.length; j < l; j++) {
          const cell = row[j]
          const index = i * 7 + j
          const time =
            startDate.getTime() + DAY_MS * (index - this.offsetDay)

          cell.inRange =
            minDate &&
            time >= clearHours(minDate) &&
            time <= clearHours(maxDate)
          cell.start = minDate && time === clearHours(minDate.getTime())
          cell.end = maxDate && time === clearHours(maxDate.getTime())
        }
      }
    },

    handleMouseMove(event) {
      if (!this.rangeState.selecting) return

      this.$emit('range', {
        minDate: this.minDate,
        maxDate: this.maxDate,
        rangeState: this.rangeState
      })

      const target = event.target
      if (target.tagName !== 'TD') return

      const column = target.cellIndex
      const row = target.parentNode.rowIndex - 1
      const { row: oldRow, column: oldColumn } = this.rangeState

      if (oldRow !== row || oldColumn !== column) {
        this.rangeState.row = row
        this.rangeState.column = column

        this.rangeState.endDate = this.getDateOfCell(row, column)
      }
    },

    handleClick(event) {
      let target = event.target

      if (target.tagName !== 'TD') return
      if (
        target.classList.contains('disabled') ||
        target.classList.contains('weeks')
      )
        return

      let year = Number(this.year)
      let month = Number(this.month)

      const cellIndex = target.cellIndex
      const rowIndex = target.parentNode.rowIndex

      const cell = this.rows[rowIndex - 1][cellIndex]
      const text = cell.text
      const className = target.className

      const newDate = new Date(year, month, 1)

      if (className.indexOf('prev') !== -1) {
        if (month === 0) {
          year = year - 1
          month = 11
        } else {
          month = month - 1
        }
        newDate.setFullYear(year)
        newDate.setMonth(month)
      } else if (className.indexOf('next') !== -1) {
        if (month === 11) {
          year = year + 1
          month = 0
        } else {
          month = month + 1
        }
        newDate.setFullYear(year)
        newDate.setMonth(month)
      }

      newDate.setDate(parseInt(text, 10))

      if (this.minDate && this.maxDate) {
        const minDate = new Date(newDate.getTime())
        const maxDate = null

        this.$emit('pick', { minDate, maxDate }, false)
        this.rangeState.selecting = true
        this.markRange(this.minDate)
      } else if (this.minDate && !this.maxDate) {
        if (newDate >= this.minDate) {
          const maxDate = new Date(newDate.getTime())
          this.rangeState.selecting = false

          this.$emit('pick', {
            minDate: this.minDate,
            maxDate
          })
        } else {
          const minDate = new Date(newDate.getTime())

          this.$emit('pick', { minDate, maxDate: this.maxDate }, false)
        }
      } else if (!this.minDate) {
        const minDate = new Date(newDate.getTime())

        this.$emit('pick', { minDate, maxDate: this.maxDate }, false)
        this.rangeState.selecting = true
        this.markRange(this.minDate)
      }
    }
  }
}
</script>
