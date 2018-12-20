import DatePicker from './DatePicker.vue'
import './styles/styles.scss'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

// configure language
locale.use(lang)

/* istanbul ignore next */
DatePicker.install = function install(Vue) {
  Vue.component(DatePicker.name, DatePicker)
}

export default DatePicker
