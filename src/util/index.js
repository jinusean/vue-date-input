import dateFnsFormatDate from 'date-fns/format'
import dateFnsToDate from 'date-fns/toDate'
import validate from 'date-fns/isValid'

const formatDate = value => dateFnsFormatDate(value, 'yyyy-M-d')

const parseDate = value => {
  const newDate = dateFnsToDate(value)
  return validate(newDate) ?
    newDate :
    null
}

export { validate, formatDate, parseDate }