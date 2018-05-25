import { setWorldConstructor, setDefaultTimeout } from 'cucumber'
import testControllerHolder from './testControllerHolder'

setDefaultTimeout(60000)

class CustomWorld {
  constructor ({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters

    this.waitForTestController = testControllerHolder.get
  }
}

setWorldConstructor(CustomWorld)
