# Fuzzy Dates

Parse/compare fuzzy dates

## Usage

When you `parse` a string you will get back a `Date` object with a `fuzzy` boolean property attached.

```javascript
const FuzzyDates = require('@abcnews/fuzzy-dates');

// Basic date formats (.fuzzy is false)
FuzzyDates.parse('January 10, 2017');
FuzzyDates.parse('10 January, 2017');
FuzzyDates.parse('10 January 2017');
FuzzyDates.parse('Tuesday January 10th 2017');
FuzzyDates.parse('Jan 10th 2017');

// Assume the 1st of the month (.fuzzy is true)
FuzzyDates.parse('Jan 2017');

// Assume a year (.fuzzy is false). Will either use the year from the second parameter or just the current year
FuzzyDates.parse('February 2'); // will use current year
FuzzyDates.parse('February 2', new Date(2015, 1, 1)); // will use 2015

// You can give a time
FuzzyDates.parse('10am January 1, 2015');
FuzzyDates.parse('1pm January 1, 2015');

// Will handle Early, Mid, and Late prefixes in lieu of an actual date
// The date you get back will have a guessed date number and .fuzzy will be true
FuzzyDates.parse('Early March, 2017');
FuzzyDates.parse('Mid January, 2017');
FuzzyDates.parse('Late February, 2017');
```

You can use `compare` to sort fuzzy dates (along with normal dates):

```javascript
const FuzzyDates = require('@abcnews/fuzzy-dates');

[
  FuzzyDates.parse('1st Feb, 2017'),
  FuzzyDates.parse('Early Feb, 2017'),
  FuzzyDates.parse('March 12, 2017');
  FuzzyDates.parse('16 March, 2017'),
  FuzzyDates.parse('Mid March, 2017'),
  FuzzyDates.parse('November 8th', new Date(2016, 1, 1)),
  FuzzyDates.parse('November 30, 2018'),
  FuzzyDates.parse('Late November, 2018'),
  FuzzyDates.parse('Late November, 2019')
].sort(FuzzyDates.compare);

// November 8, 2016
// February 1, 2017
// Early February, 2017
// March 12, 2017
// Mid March, 2017
// March 16, 2017
// Late November 2018
// November 30, 2018
// Late November, 2019
```

## Authors

- Nathan Hoad ([nathan@nathanhoad.net](mailto:nathan@nathanhoad.net))