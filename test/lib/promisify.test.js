'use strict';
const Promisify = require('../../lib/promisify');
const sinon = require('sinon');
const assert = require('assert');

const seneca = new (function seneca() {
    this.client = sinon.spy();
})();

describe('Seneca - Promisify', () => {
    before(() => {
        Promisify.call(seneca);
    });

    describe('readyAsync', () => {
        it('seneca ready function should be called', () => {
            seneca.ready = sinon.spy(() => { });
            seneca.readyAsync();
            assert.equal(seneca.ready.called, true);
        });

        it('should reject when seneca can not ready', () => {
            const expectError = 'error';
            seneca.ready = (callback) => {
                return callback(new Error(expectError));
            };

            return seneca.readyAsync()
                .then(() => {
                    throw new Error('readyAsync does not reject when having error');
                })
                .catch((err) => {
                    assert.equal(err.message, expectError);
                });
        });

        it('should fullfiled when seneca ready', () => {
            seneca.ready = sinon.spy((callback) => {
                return callback(null);
            });

            return seneca.readyAsync()
                .then(() => {
                    assert.equal(seneca.ready.called, true);
                });
        });
    });

    describe('closeAsync', () => {
        it('seneca close function should be called', () => {
            seneca.close = sinon.spy(() => { });
            seneca.closeAsync();
            assert.equal(seneca.close.called, true);
        });

        it('should reject when seneca close got exception', () => {
            const expectError = 'error';
            seneca.close = (callback) => {
                return callback(new Error(expectError));
            };

            return seneca.closeAsync()
                .then(() => {
                    throw new Error('closeAsync does not reject when having error');
                })
                .catch((err) => {
                    assert.equal(err.message, expectError);
                });
        });

        it('should fullfiled when seneca closed', () => {
            seneca.close = sinon.spy((callback) => {
                return callback(null);
            });

            return seneca.closeAsync()
                .then(() => {
                    assert.equal(seneca.close.called, true);
                });
        });
    });

    describe('actAsync', () => {
        before(() => {
            seneca.act = sinon.spy((...args) => {
                const done = args[args.length - 1];

                if (args[0].shouldSuccess) {
                    return done(null, { shouldSuccess: true });
                }

                if (args[0].sucessWithData) {
                    return done(null, { success: true, data: 123 });
                }

                if (args[0].rejectWithData) {
                    return done(null, { success: false, data: 'rejectWithData' });
                }

                if (args[0].rejectWhenError) {
                    return done(new Error('rejectWhenError'));
                }

                if (args[0].rejectWhenException) {
                    throw new Error('rejectWhenException');
                }

                if (args[0].rejectWhenExceptionWithErrorCode) {
                    const error = new Error('');
                    delete error.message;
                    error.code = 400;
                    throw error;
                }
                return done(null, {});
            });
        });

        it('should call function act', () => {
            seneca.act.reset();
            seneca.actAsync('test');
            assert.equal(seneca.act.called, true);
        });

        it('should return success when act invoked successfully', () => {
            return seneca
                .actAsync({ shouldSuccess: true })
                .then((res) => {
                    assert.equal(res.shouldSuccess, true);
                });
        });

        it('should return data when act return {success: true}', () => {
            return seneca
                .actAsync({ sucessWithData: true })
                .then((res) => {
                    assert.equal(res, 123);
                });
        });

        it('should reject data when act return success=false', () => {
            return seneca
                .actAsync({ rejectWithData: true })
                .then(() => {
                    throw new Error('actSync successfully when rejectWithData');
                })
                .catch((err) => {
                    assert.equal(err.message, 'rejectWithData');
                });
        });

        it('should reject when act got error', () => {
            return seneca
                .actAsync({ rejectWhenError: true })
                .then(() => {
                    throw new Error('actSync successfully when rejectWhenError');
                })
                .catch((err) => {
                    assert.equal(err.message, 'rejectWhenError');
                });
        });

        it('should reject when act got exception', () => {
            return seneca
                .actAsync({ rejectWhenException: true })
                .then(() => {
                    throw new Error('actSync successfully when rejectWhenException');
                })
                .catch((err) => {
                    assert.equal(err.message, 'rejectWhenException');
                });
        });

        it('should reject when act got exception with error code', () => {
            return seneca
                .actAsync({ rejectWhenExceptionWithErrorCode: true })
                .then(() => {
                    throw new Error('actSync successfully when rejectWhenExceptionWithErrorCode');
                })
                .catch((err) => {
                    assert.equal(err.message, 400);
                });
        });
    });

    describe('clientAsync', () => {
        it('should call function readyAsync when invoked', () => {
            const save = sinon.stub(seneca, 'readyAsync').returns({
                then() {
                    return Promise.resolve();
                }
            });
            return seneca.clientAsync({})
                .then(() => {
                    assert.equal(seneca.readyAsync.called, true);
                    save.restore();
                });
        });

        it('should call function client when invoked', () => {
            const save = sinon.stub(seneca, 'readyAsync').returns({
                then(callback) {
                    return callback(seneca);
                }
            });

            seneca.client.reset();

            return seneca.clientAsync({})
                .then(() => {
                    assert.equal(seneca.client.called, true);
                    save.restore();
                });
        });

        it('should call function client when invoked', () => {
            seneca.ready = sinon.spy((done) => {
                done(null);
            });
            const save = sinon.stub(seneca, 'readyAsync').returns({
                then(callback) {
                    return callback(seneca);
                }
            });

            seneca.client.reset();

            return seneca.clientAsync({})
                .then(() => {
                    assert.equal(seneca.client.called, true);
                    assert.equal(seneca.ready.called, true);
                    save.restore();
                });
        });

        it('should reject when function ready throw exeption', () => {
            const expectErorr = '123';
            seneca.ready = sinon.spy((done) => {
                done(expectErorr);
            });
            const save = sinon.stub(seneca, 'readyAsync').returns({
                then(callback) {
                    return callback(seneca);
                }
            });

            seneca.client.reset();

            return seneca.clientAsync({})
                .then(() => {
                    throw new Error('clientAsync connect sucessfully when has exception');
                })
                .catch((err) => {
                    assert.equal(err, expectErorr);
                    save.restore();
                });
        });
    });
});