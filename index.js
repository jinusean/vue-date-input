import DatePicker from './src/components/DatePicker'

/* istanbul ignore next */
DatePicker.install = function install(Vue) {
  Vue.component(DatePicker.name, DatePicker)
}

export default DatePicker
