const FuzzyDates = require('..');

describe('#parse', () => {
  test('it can parse basic date formats', () => {
    let parsed = FuzzyDates.parse('January 10, 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Tue Jan 10 2017 00:00:00');

    parsed = FuzzyDates.parse('10 January, 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Tue Jan 10 2017 00:00:00');

    parsed = FuzzyDates.parse('10 January 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Tue Jan 10 2017 00:00:00');

    parsed = FuzzyDates.parse('Tuesday January 10th 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Tue Jan 10 2017 00:00:00');

    parsed = FuzzyDates.parse('Jan 10th 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Tue Jan 10 2017 00:00:00');
  });

  test('it can assume a day', () => {
    let parsed = FuzzyDates.parse('Jan 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeTruthy();
    expect(parsed.toString()).toContain('Sun Jan 01 2017 00:00:00');
  });

  test('it can assume a year', () => {
    let parsed = FuzzyDates.parse('February 2');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Fri Feb 02 2018 00:00:00');

    parsed = FuzzyDates.parse('February 2', new Date(2015, 0, 1));
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Mon Feb 02 2015 00:00:00');
  });

  test('it can handle times', () => {
    let parsed = FuzzyDates.parse('10am January 1, 2015');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Thu Jan 01 2015 10:00:00');

    parsed = FuzzyDates.parse('1pm January 1, 2015');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Thu Jan 01 2015 13:00:00');
  });

  test('it can handle T syntax', () => {
    let parsed = FuzzyDates.parse('2017-10-04T13:54:02');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeFalsy();
    expect(parsed.toString()).toContain('Wed Oct 04 2017 13:54:02');
  });

  test('it can parse early, mid, and late fuzzy date formats', () => {
    let parsed = FuzzyDates.parse('Early March, 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeTruthy();
    expect(parsed.toString()).toContain('Wed Mar 01 2017 00:00:00');

    parsed = FuzzyDates.parse('Mid January, 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeTruthy();
    expect(parsed.toString()).toContain('Mon Jan 16 2017 00:00:00');

    parsed = FuzzyDates.parse('Mid-August, 2018');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeTruthy();
    expect(parsed.toString()).toContain('Thu Aug 16 2018 00:00:00');

    parsed = FuzzyDates.parse('Late February, 2017');
    expect(parsed instanceof Date).toBeTruthy();
    expect(parsed.fuzzy).toBeTruthy();
    expect(parsed.toString()).toContain('Tue Feb 28 2017 00:00:00');
  });
});

describe('#compare', () => {
  test('it can compare fuzzy dates', () => {
    let feb1 = FuzzyDates.parse('1st Feb, 2017');
    let febEarly = FuzzyDates.parse('Early Feb, 2017');

    expect(FuzzyDates.compare(feb1, febEarly)).toBe(-1);
    expect(FuzzyDates.compare(febEarly, feb1)).toBe(1);

    let march12 = FuzzyDates.parse('March 12, 2017');
    let marchMid = FuzzyDates.parse('Mid March, 2017');
    let march16 = FuzzyDates.parse('16 March, 2017');

    let march = [march12, march16, marchMid].sort(FuzzyDates.compare);

    expect(march[0]).toBe(march12);
    expect(march[1]).toBe(marchMid);
    expect(march[2]).toBe(march16);

    let november8 = FuzzyDates.parse('November 8th', new Date(2016, 1, 1));
    let november30 = FuzzyDates.parse('November 30, 2018');
    let novemberLate = FuzzyDates.parse('Late November, 2018');
    let novemberLater = FuzzyDates.parse('Late November, 2019');

    let november = [november8, november30, novemberLate, novemberLater].sort(FuzzyDates.compare);

    expect(november[0]).toBe(november8);
    expect(november[1]).toBe(novemberLate);
    expect(november[2]).toBe(november30);
    expect(november[3]).toBe(novemberLater);

    // Sort everything
    let a = [feb1, febEarly, march12, march16, marchMid, november8, november30, novemberLate, novemberLater].sort(
      FuzzyDates.compare
    );
    expect(a[0]).toBe(november8);
    expect(a[1]).toBe(feb1);
    expect(a[2]).toBe(febEarly);
    expect(a[3]).toBe(march12);
    expect(a[4]).toBe(marchMid);
    expect(a[5]).toBe(march16);
    expect(a[6]).toBe(novemberLate);
    expect(a[7]).toBe(november30);
    expect(a[8]).toBe(novemberLater);
  });
});

describe('#formatDate', () => {
  test('It can format dates', () => {
    let date = FuzzyDates.parse('10 March 2015');
    expect(FuzzyDates.formatDate(date)).toBe('March 10, 2015');

    date = FuzzyDates.parse('2017, Late November');
    expect(FuzzyDates.formatDate(date)).toBe('Late November, 2017');

    date = FuzzyDates.parse('2017, Late November');
    expect(FuzzyDates.formatDate(date, true)).toBe('Late Nov, 2017');

    date = FuzzyDates.parse('Mid January, 2018');
    expect(FuzzyDates.formatDate(date)).toBe('Mid January, 2018');

    date = FuzzyDates.parse('Mid-January, 2018');
    expect(FuzzyDates.formatDate(date)).toBe('Mid-January, 2018');
  });
});
