'use strict'

const Lodash = require('lodash')
const Machina = require ('machina')


const internals = {}
const vSignal = new Machina.Fsm({
  initialize: (options) => {
  },
  namespace: 'vehicle-signal',
  initialState: "uninitialized",
  states:{
    uninitialized:{
      "*": _ => {
        internals.vSignals.deferUntilTransition()
        internals.vSignals.transition( "green" )
      }
    },
    green:{
      _onEnter: _ => {
        internals.vSignals.timer = setTimeout( _ => {
            internals.vSignals.handle('timeout')
        }, 10000)
        internals.vSignals.emit("vehicles", { status: "GREEN" })
      },
      timeout:'green-interruptible',
      pedestrianWaiting: _ => {
        internals.vSignals.emit("vehicles", { status: "pedastrian" })
//        internals.vSignals.handle('timeout')
        internals.vSignals.deferUntilTransition('green-interruptible')
      },
      _onExit: _ => {
        clearTimeout(internals.vSignals.timer)
      }
    },
    'green-interruptible':{
      _onEnter: _ => {
        internals.vSignals.timer = setTimeout( _ => {
          internals.vSignals.handle('timeout')
        }, 3000)
        internals.vSignals.emit("vehicles", { status: "GREEN INTERRUPTIBLE" })
      },
      pedestrianWaiting: 'yellow',
      timeout:'yellow'
    },
    yellow: {
      _onEnter: _ => {
        internals.vSignals.timer = setTimeout( _ => {
          internals.vSignals.handle('timeout')
        }, 1000)
        internals.vSignals.emit("vehicles", { status: "YELLOW" })
      },
      timeout:'red',
      _onExit: _ => {
        clearTimeout(internals.vSignals.timer)
      }
    },
    red: {
      _onEnter: _ => {
        internals.vSignals.timer = setTimeout( _ => {
          internals.vSignals.handle('timeout')
        }, 8000)
        internals.vSignals.emit("vehicles", { status: "RED" })
      },
      timeout: 'green',
      _reset: 'green',
      _onExit: _ => {
        clearTimeout(internals.vSignals.timer)
      }
    }

  },
  reset: _ => {
    internals.vSignals.emit("vehicles", { status: "Reset on REDDDD" })
    internals.vSignals.handle('_reset')
  },
  pedestrianWaiting:() => {
    internals.vSignals.handle('pedestrianWaiting')
  }
})

internals.vSignals = vSignal

module.exports = (robot) => {


  internals.vSignals.transition('red')

  robot.hear (/pedas/i, (res) => {
    res.send('Wait for red signal', res.match)
    internals.vSignals.pedestrianWaiting()
  })

  robot.hear (/current|st|status/i, (res) => {
    res.send(internals.vSignals.compositeState())
  })

  robot.listen ((message) => {
    let match = message.match(/^(.*)$/)
    robot.logger.info(match)
    internals.vSignals.reset()

    return true
  },
     (response) => {

  })

  // ver eventos que se emiten
  vSignal.on('*', (eventName, data) => {
    if(eventName == 'vehicles')
      robot.logger.info("this thing happened:", eventName, data)
  })

}
