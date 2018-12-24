<template>
  <div class="date-picker">
    <div class="date-input">
      <span class="date-input__icon">
        <!--<i class="icon-calendar" />-->
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
        @focus="showPicker"
        @change.native="$event.target.value = displayValue"
      >
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import DateRange from "./DateRange.vue";
import popperMixin from "../util/popperMixin";
import Clickoutside from "element-ui/lib/utils/clickoutside";
import { equalDate, isDate } from "../util/index";
import { TYPE_VALUE_RESOLVER_MAP, DEFAULT_FORMATS } from "../util/display";
import tabbable from "tabbable";
// only considers date-picker's value: Date or [Date, Date]

const ANIMATION_DURATION = 300;

export default {
  name: "DatePicker",
  directives: { Clickoutside },
  mixins: [popperMixin],
  props: {
    size: {
      type: String,
      default: ""
    },
    format: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    id: {
      type: String,
      default: ""
    },
    align: {
      type: String,
      default: "left"
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
      default: " - "
    },
    pickerOptions: {
      type: Object,
      default: undefined
    }
  },

  data() {
    return {
      pickerVisible: false,
      currentValue: "",
      unwatchPickerOptions: null,
      panel: DateRange,
      type: "daterange",
      inputClass: ""
    };
  },

  computed: {
    reference() {
      return this.$refs.reference.$el;
    },

    valueIsEmpty() {
      const val = this.currentValue;
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          if (val[i]) {
            return false;
          }
        }
      } else {
        if (val) {
          return false;
        }
      }
      return true;
    },

    displayValue: {
      get() {
        const value = this.currentValue;
        if (!value) return;
        const formatter = TYPE_VALUE_RESOLVER_MAP.daterange.formatter;
        const format = DEFAULT_FORMATS[this.type];

        return formatter(value, this.format || format, this.rangeSeparator);
      },

      set(value) {
        if (value) {
          const type = this.type;
          const parser = (
            TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP["default"]
          ).parser;
          const parsedValue = parser(
            value,
            this.format || DEFAULT_FORMATS[type],
            this.rangeSeparator
          );

          if (parsedValue && this.picker) {
            this.picker.value = parsedValue;
          }
        } else {
          this.$emit("input", value);
          this.picker.value = value;
        }
        this.$forceUpdate();
      }
    }
  },

  watch: {
    currentValue(val) {
      if (val) return;
      if (this.picker && typeof this.picker.handleClear === "function") {
        this.picker.handleClear();
      } else {
        this.$emit("input");
      }
    },
    value: {
      immediate: true,
      handler(val) {
        this.currentValue = isDate(val) ? new Date(val) : val;
      }
    },
    displayValue(val) {
      this.$emit("change", val);
      this.dispatch("ElFormItem", "el.form.change");
    }
  },

  created() {
    const PLACEMENT_MAP = {
      left: "bottom-start",
      center: "bottom",
      right: "bottom-end"
    };

    // vue-popper
    this.popperOptions = {
      boundariesPadding: 0,
      gpuAcceleration: false
    };
    this.placement = PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left;
  },

  methods: {
    dateChanged(dateA, dateB) {
      if (Array.isArray(dateA)) {
        let len = dateA.length;
        if (!dateB) return true;
        while (len--) {
          if (!equalDate(dateA[len], dateB[len])) return true;
        }
      } else {
        if (!equalDate(dateA, dateB)) return true;
      }

      return false;
    },

    handleKeydown(event) {
      if (event.key === "Escape") {
        this.hidePicker();
        event.stopPropagation();
      }
    },

    hidePicker() {
      if (!this.picker) {
        return;
      }
      // this.dispatch('ElFormItem', 'el.form.blur')
      document.body.removeEventListener("click", this.handleBodyClick);
      document.body.removeEventListener("keydown", this.handleKeydown);
      this.destroyPopper();
      this.pickerVisible = this.picker.visible = false;
      clearTimeout(this.inputClassTimeoutId);
      this.inputClassTimeoutId = setTimeout(() => {
        this.inputClass = "";
      }, ANIMATION_DURATION);
    },

    showPicker() {
      if (!this.picker) {
        this.mountPicker();
        return this.showPicker();
      }
      this.picker.value = this.currentValue;
      this.picker.resetView();
      this.picker.visible = this.pickerVisible = true;
      this.inputClass = "date-picker-open";

      this.updatePopper();

      this.$nextTick(() => {
        this.picker.ajustScrollTop && this.picker.ajustScrollTop();
      });
      document.body.addEventListener("click", this.handleBodyClick);
      document.body.addEventListener("keydown", this.handleKeydown);
    },

    handleBodyClick({ target }) {
      if (
        !this.$refs.reference ||
        this.$refs.reference.contains(target) ||
        this.picker.$el.contains(target)
      ) {
        return;
      }
      this.hidePicker();
    },

    mountPicker() {
      this.panel.defaultValue = this.defaultValue || this.currentValue;
      this.picker = new Vue(this.panel).$mount();
      this.picker.$el.addEventListener("keydown", this.onPopperKeyDown);
      if (this.format) {
        this.picker.format = this.format;
      }

      const updateOptions = () => {
        const options = this.pickerOptions;

        if (options && options.selectableRange) {
          let ranges = options.selectableRange;
          const parser = TYPE_VALUE_RESOLVER_MAP.datetimerange.parser;
          const format = DEFAULT_FORMATS.timerange;

          ranges = Array.isArray(ranges) ? ranges : [ranges];
          this.picker.selectableRange = ranges.map(range =>
            parser(range, format, this.rangeSeparator)
          );
        }

        for (const option in options) {
          if (
            options.hasOwnProperty(option) &&
            // 忽略 time-picker 的该配置项
            option !== "selectableRange"
          ) {
            this.picker[option] = options[option];
          }
        }
      };
      updateOptions();
      this.unwatchPickerOptions = this.$watch(
        "pickerOptions",
        () => updateOptions(),
        { deep: true }
      );

      this.$el.appendChild(this.picker.$el);

      this.picker.$on("dodestroy", this.doDestroy);
      this.picker.$on("pick", (date = "") => {
        const valueEquals = function(a, b) {
          const aIsArray = a instanceof Array;
          const bIsArray = b instanceof Array;
          if (aIsArray && bIsArray) {
            return (
              new Date(a[0]).getTime() === new Date(b[0]).getTime() &&
              new Date(a[1]).getTime() === new Date(b[1]).getTime()
            );
          }
          if (!aIsArray && !bIsArray) {
            return new Date(a).getTime() === new Date(b).getTime();
          }
          return false;
        };
        // do not emit if values are same
        if (!valueEquals(this.value, date)) {
          this.$emit("input", date);
        }
        this.hidePicker();
      });

      let closeTimeoutId = null;
      this.picker.$on("select-range", (start, end) => {
        if (!this.$refs.reference) {
          return;
        }
        clearTimeout(closeTimeoutId);
        const refInput = this.$refs.reference.querySelector("input");
        refInput.setSelectionRange(start, end);
        refInput.focus();
      });

      this.picker.$on("close", () => {
        this.$nextTick(this.picker.resetView);
        this.hidePicker();
        clearTimeout(closeTimeoutId);
        closeTimeoutId = setTimeout(this.picker.resetView, ANIMATION_DURATION);
      });
    },

    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy();
        this.picker.$off();
        if (typeof this.unwatchPickerOptions === "function") {
          this.unwatchPickerOptions();
        }
        this.picker.$el.parentNode.removeChild(this.picker.$el);
      }
    },

    onPopperKeyDown(event) {
      if (event.key.toUpperCase() !== "TAB") {
        return;
      }

      const { target } = event;
      const popperTabbable = tabbable(this.picker.$el);
      let nextIndexOperand;

      if (event.shiftKey && target === popperTabbable[0]) {
        // shit+tab on first tabbable element of date-picker popup
        nextIndexOperand = -1;
      } else if (
        !event.shiftKey &&
        target === popperTabbable[popperTabbable.length - 1]
      ) {
        // tab on last tabbable element of date-picker popup
        nextIndexOperand = 1;
      } else {
        // tabbing through date-picker elemnets
        return;
      }

      event.preventDefault();
      const tabbableElements = tabbable(document.body);
      let nextIndex =
        tabbableElements.indexOf(this.$refs.reference.children[0]) +
        nextIndexOperand;

      if (nextIndex < 0) {
        nextIndex = tabbableElements.length - 1;
      } else if (tabbableElements === tabbableElements.length) {
        nextIndex = 0;
      }

      this.hidePicker();
      tabbableElements[nextIndex].focus();
    }
  }
};
</script>
