import DatePicker from './components/DatePicker.vue'
import 'element-ui/lib/theme-chalk/icon.css'
import './styles/styles.scss'

/* istanbul ignore next */
DatePicker.install = function install(Vue) {
  Vue.component(DatePicker.name, DatePicker)
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(DatePicker)
}

export default DatePicker
