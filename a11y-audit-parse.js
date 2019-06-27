const a11yReport = require('./test-reports/a11y-audit.json');

console.log('*************************');
console.log('a11y score: ', `${a11yReport.categories.accessibility.score * 100}%`);
console.log('*************************');