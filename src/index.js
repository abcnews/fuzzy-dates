const getDaysInMonth = require('date-fns/get_days_in_month');
const compareAsc = require('date-fns/compare_asc');
const isSameMonth = require('date-fns/is_same_month');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Parse a string to see if there is meaningful datetime
 * @param {string} possibleDatetime
 * @param {Date} helperDate used for guessing the year
 * @return {Date}
 */
function parse(possibleDatetime, helperDate) {
  let tokens = possibleDatetime.toLowerCase().split(' ');

  // Keep track of the meanings of the tokens
  let date;
  let d = {
    fuzzy: false,
    year: false,
    month: false,
    day: false,
    seconds: 0
  };

  if (tokens.length === 1 && possibleDatetime.indexOf('T') > -1) {
    // It's probably already a date parsable string
    date = new Date(possibleDatetime);
    d.year = date.getFullYear();
    d.month = date.getMonth();
    d.day = date.getDate();

    let time = possibleDatetime
      .replace(/^.*T/, '')
      .replace(/\+.*$/, '')
      .split(':');
    d.seconds =
      parseFloat(time[0]) * 60 * 60 + // hours
      parseFloat(time[1] || 0) * 60 + // minutes
      parseFloat(time[1] || 0); // seconds

    return date;
  }

  // We don't need the day name
  tokens = tokens.filter(token => !token.match(/(sun|mon|tue|wed|thu|fri|sat)/));

  // Guess what each token is
  tokens.forEach(token => {
    let matchingMonth = MONTHS.filter(m => token.indexOf(m) === 0)[0];

    if (token.match(/(early|mid|late)/)) {
      d.fuzzy = token;
    } else if (token.match(/\d{4}/)) {
      d.year = parseInt(token, 10);
    } else if (matchingMonth) {
      d.month = MONTHS.indexOf(matchingMonth);
    } else if (
      (token.indexOf(':') > -1 || token.indexOf('am') > -1 || token.indexOf('pm') > -1) &&
      token.match(/[0-9\:]+(am|pm)?/)
    ) {
      // Parse am and pm
      let addHours = token.indexOf('pm') > -1 ? 12 : 0;
      let time = token.replace(/(am|pm)/, '').split(':');

      d.seconds =
        (parseFloat(time[0]) + addHours) * 60 * 60 + // hours
        parseFloat(time[1] || 0) * 60 + // minutes
        parseFloat(time[1] || 0); // seconds
    } else if (token.match(/\d{1,2}(st|nd|rd|th)?/)) {
      d.day = parseInt(token, 10);
    }
  });

  // Add a year if it's missing
  if (!d.year) {
    if (helperDate) {
      d.year = helperDate.getFullYear();
    } else {
      d.year = new Date().getFullYear();
    }
  }

  // Set the day if it's missing
  if (!d.day) {
    d.day = 1;
    // fuzzy will either be false or a string
    if (!d.fuzzy) {
      d.fuzzy = true;
    }
  }

  // Reconstruct the date
  date = new Date(d.year, d.month, d.day);
  date.setSeconds(d.seconds);

  switch (d.fuzzy) {
    case 'early':
      d.day = 1;
      date.setDate(1);
      break;
    case 'mid':
      d.day = Math.round(getDaysInMonth(date) / 2);
      date.setDate(d.day);
      break;
    case 'late':
      d.day = getDaysInMonth(date);
      date.setDate(d.day);
      break;
    default:
    // Any other value does nothing to the actual date
  }

  date.fuzzy = d.fuzzy;
  date.original = possibleDatetime;

  return date;
}

/**
 * A sorting function that can be used to sort an array of fuzzy dates
 * @param {date} a
 * @param {date} b
 * @return {number}
 */
function compare(a, b) {
  // Their fuzziness is the same or they are in different months so just compare them normally
  if (!!a.fuzzy === !!b.fuzzy || !isSameMonth(a, b)) {
    return compareAsc(a, b);
  }

  // If one of them is fuzzy then check who wins
  /* 
    1st beats early, 
    early beats anything > 1st
    <= 15th beats mid
    mid beats >15th
    late beats last day
    last day is always last
  */
  if (a.fuzzy) {
    // 1st beats early
    if (b.getDate() === 1) return 1;
    if (a.fuzzy === 'early') return -1;

    const daysInMonth = getDaysInMonth(b);

    // mid beats anything after the middle of the month
    if (a.fuzzy === 'mid') {
      if (b.getDate() < Math.floor(daysInMonth / 2) - 1) {
        return 1;
      } else {
        return -1;
      }
    }

    // late only loses to the last day
    if (b.getDate() === daysInMonth) return -1;

    // Anything else means a.fuzzy was late
    return 1;
  } else {
    // 1st beats early
    if (a.getDate() === 1) return -1;
    if (b.fuzzy === 'early') return 1;

    const daysInMonth = getDaysInMonth(a);

    // mid beats anything after the middle of the month
    if (b.fuzzy === 'mid') {
      if (a.getDate() < Math.floor(daysInMonth / 2) - 1) {
        return -1;
      } else {
        return 1;
      }
    }

    // late only loses to the last day
    if (a.getDate() === daysInMonth) return 1;

    // Anything else means a.fuzzy was late
    return 1;
  }
}

/**
 * Output a date (optionally fuzzy) as something like February 10, 2017 or Mid February, 2017
 * @param {Date} date 
 * @return {string}
 */
function formatDate(date) {
  let tokens = [];

  // Early, Mid, or Late
  if (typeof date.fuzzy === 'string') {
    tokens.push(date.fuzzy.charAt(0).toUpperCase() + date.fuzzy.slice(1));
  }

  // Month
  tokens.push(FULL_MONTHS[date.getMonth()]);

  // Day number
  if (!date.fuzzy) {
    tokens.push(date.getDate());
  }

  return tokens.join(' ') + ', ' + date.getFullYear();
}

module.exports = { parse, compare, formatDate };
