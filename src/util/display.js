import { formatDate, parseDate, getWeekNumber } from "./index";

const DATE_FORMATTER = function(value, format) {
  return formatDate(value, format);
};
const DATE_PARSER = function(text, format) {
  return parseDate(text, format);
};
/**
 * @return {string}
 */
const RANGE_FORMATTER = function(value, format, separator) {
  if (Array.isArray(value) && value.length === 2) {
    const start = value[0];
    const end = value[1];

    if (start && end) {
      return formatDate(start, format) + separator + formatDate(end, format);
    }
  }
  return "";
};
const RANGE_PARSER = function(text, format, separator) {
  const array = text.split(separator);
  if (array.length === 2) {
    const range1 = array[0];
    const range2 = array[1];

    return [parseDate(range1, format), parseDate(range2, format)];
  }
  return [];
};

export const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {
      if (!value) return "";
      return "" + value;
    },
    parser(text) {
      if (text === undefined || text === "") return null;
      return text;
    }
  },
  week: {
    formatter(value, format) {
      let date = formatDate(value, format);
      const week = getWeekNumber(value);

      date = /WW/.test(date)
        ? date.replace(/WW/, week < 10 ? "0" + week : week)
        : date.replace(/W/, week);
      return date;
    },
    parser(text) {
      const array = (text || "").split("w");
      if (array.length === 2) {
        const year = Number(array[0]);
        const month = Number(array[1]);

        if (!isNaN(year) && !isNaN(month) && month < 54) {
          return text;
        }
      }
      return null;
    }
  },
  date: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  datetime: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  daterange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  datetimerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  timerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  time: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  month: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  year: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  number: {
    formatter(value) {
      if (!value) return "";
      return "" + value;
    },
    parser(text) {
      let result = Number(text);

      if (!isNaN(text)) {
        return result;
      } else {
        return null;
      }
    }
  }
};

export const DEFAULT_FORMATS = {
  date: "yyyy-MM-dd",
  month: "yyyy-MM",
  datetime: "yyyy-MM-dd HH:mm:ss",
  time: "HH:mm:ss",
  week: "yyyywWW",
  timerange: "HH:mm:ss",
  daterange: "yyyy-MM-dd",
  datetimerange: "yyyy-MM-dd HH:mm:ss",
  year: "yyyy"
};
