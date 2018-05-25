import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { Before, AfterAll } from 'cucumber'
import createTestCafe from 'testcafe'
import { join } from 'path'

const testControllerHolder = {
  testFile: join(__dirname, 'testcafe-test.js'),

  testController: null,

  captureResolver: null,
  getResolver: null,

  capture (t) {
    testControllerHolder.testController = t

    if (testControllerHolder.getResolver) {
      testControllerHolder.getResolver(t)
    }

    return new Promise(function (resolve) {
      testControllerHolder.captureResolver = resolve
    })
  },

  free () {
    this.testController = null

    if (this.captureResolver) {
      this.captureResolver()
    }
  },

  get () {
    return new Promise(function (resolve) {
      if (testControllerHolder.testController) {
        resolve(testControllerHolder.testController)
      } else {
        testControllerHolder.getResolver = resolve
      }
    })
  },

  async before (callback) {
    this._createTestFile()
    await this._runTest()
  },

  async afterall () {
    await testControllerHolder.free()
    if (this.cafeRunner) {
      await this.cafeRunner.close()
    }
    this._deleteTestFile()
  },

  _runTest: function () {
    return createTestCafe('localhost')
      .then(tc => {
        this.cafeRunner = tc
        const runner = tc.createRunner()

        return runner
          .src(this.testFile)
          .browsers('chrome')
          .run()
          .catch(error => console.log('error', error))
      })
  },

  _createTestFile: function () {
    writeFileSync(this.testFile,
      `
      import testControllerHolder from './testControllerHolder'

      fixture('fixture')

      test('testing', testControllerHolder.capture)
      `
    )
  },

  _deleteTestFile: function () {
    if (existsSync(this.testFile)) {
      unlinkSync(this.testFile)
    }
  }
}

export default testControllerHolder

Before('@testcafe', function () {
  testControllerHolder.before()
})

AfterAll('@testcafe', function () {
  testControllerHolder.afterall()
})
