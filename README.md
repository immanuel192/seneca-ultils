## seneca-utils

[![Build Status](https://travis-ci.org/immanuel192/seneca-utils.png?branch=master)](https://travis-ci.org/immanuel192/seneca-utils/)
[![Code Climate](https://codeclimate.com/github/immanuel192/seneca-utils.png)](https://codeclimate.com/github/immanuel192/seneca-utils)
[![Test Coverage](https://codeclimate.com/github/immanuel192/seneca-utils/badges/coverage.svg)](https://codeclimate.com/github/immanuel192/seneca-utils/coverage)
[![Dependency Status](https://david-dm.org/immanuel192/seneca-utils.png)](https://david-dm.org/immanuel192/seneca-utils)
[![Download Status](https://img.shields.io/npm/immanuel192/seneca-utils.svg?style=flat-square)](https://www.npmjs.com/package/seneca-utils)

> Seneca Service Loader to help you easily buiild seneca service

## Change logs
### v1.0.3
- Add Dto support. Now when exporting your command, add dto type and subtype
```javascript
module.exports = {
    pin: 'cmd:test',
    Func: CommandTest,
    name: 'test',
    dtoType: '', // your dto main type
    dtoSubType: '' // your dto sub type
};
```