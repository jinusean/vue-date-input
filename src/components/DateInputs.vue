<template>
  <div class="date-inputs">
    <div class="date-input-wrapper">
      <DateInput
        ref="minDate"
        v-model="start"
        size="small"
        @input="onStart"
      />
    </div>
    <div class="date-input-wrapper">
      <DateInput
        ref="maxDate"
        v-model="end"
        size="small"
        @input="onEnd"
      />
    </div>
  </div>
</template>
<script>
import DateInput from "./DateInput.vue";

export default {
  name: "DateInputs",
  components: { DateInput },
  props: {
    dates: {
      type: Array,
      required: true
    },
    disabledDate: {
      type: Function,
      required: true
    },
    minDate: {
      type: Date,
      required: true
    },
    maxDate: {
      type: Date,
      default: null
    }
  },
  data() {
    return {
      start: null,
      end: null
    };
  },
  watch: {
    minDate: {
      immediate: true,
      handler(val) {
        if (!val) {
          return;
        }
        this.start = new Date(val);
      }
    },
    maxDate: {
      immediate: true,
      handler(val) {
        if (!val) {
          return; // will be null while user is selecting in date-table
        }
        this.end = new Date(val);
      }
    }
  },
  methods: {
    focus(index = 0) {
      const inputs = ["minDate", "maxDate"];
      this.$refs[inputs[index]].focus();
    },
    onStart(value) {
      if (this.disabledDate(value) || value > this.end) {
        this.start = new Date(this.dates[0]);
      } else {
        this.$refs.maxDate.focus();
      }
      this.emitPick();
    },
    onEnd(value) {
      if (this.disabledDate(value) || value < this.start) {
        this.end = new Date(this.dates[1]);
      }
      this.emitPick();
    },
    emitPick() {
      this.$emit("pick", {
        minDate: this.start,
        maxDate: this.end
      });
    }
  }
};
</script>
