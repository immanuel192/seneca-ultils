## seneca-utils

[![Build Status](https://travis-ci.org/immanuel192/seneca-utils.png?branch=master)](https://travis-ci.org/immanuel192/seneca-utils/)
[![Code Climate](https://codeclimate.com/github/immanuel192/seneca-utils.png)](https://codeclimate.com/github/immanuel192/seneca-utils)
[![Test Coverage](https://codeclimate.com/github/immanuel192/seneca-utils/badges/coverage.svg)](https://codeclimate.com/github/immanuel192/seneca-utils/coverage)
[![Dependency Status](https://david-dm.org/immanuel192/seneca-utils.png)](https://david-dm.org/immanuel192/seneca-utils)

> Seneca Service Loader to help you easily buiild seneca service

## Change logs
### v1.1.7
- Fix bug SenecaLoaderService throw exception because load fire-and-forget 2 times
### v1.1.5
- Fix bug: get clientAsync got no response because the seneca queue still full
### v1.1.1
- Fix bug: when you dont listen but you spaw a client, your client never get promisify
### v1.1.0
- Fix bug: register seneca command without the server listen pin config.
### v1.0.6
- Add new way to declare the command
```javascript
const FakeCommand2 = class {
    static get pin() {
        return 'cmd:myCommand2';
    }

    static get name() {
        return 'myCommand2';
    }

    static get dtoType() {
        return 'MyDto';
    }

    static get dtoSubType() {
        return '';
    }

    func() {
        return null;
    }
};

module.exports = FakeCommand2;
```
### v1.0.5
- Update dtobase to 1.0.1

### v1.0.4
- Add Dto support. Now when exporting your command, add dto type and subtype. Both are optional

```javascript
class MyCommand {
    constructor() {
        this.SampleLogic = kv.resolve('SampleLogic');
        this.logger = kv.resolve('logger');
    }

    get dtoType() {
        return 'MyDto';
    }

    get dtoSubType() {
        return '';
    }

    func(inp) {
        return this.SampleLogic.doSomething(inp);
    }
}

module.exports = {
    pin: 'cmd:myCommand',
    Func: MyCommand,
    name: 'myCommand'
};
```

- Throw exception when can not detect the Dto registered