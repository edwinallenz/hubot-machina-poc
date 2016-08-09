'use strict'

const Lodash = require('lodash')
const Machina = require ('machina')
const Response = require('hubot').Response

const internals = {}

internals.kebab = new Machina.Fsm({
  initialize: (options) => {
  },
  namespace: 'kebab',
  initialState: "uninitialized",
  states:{
    uninitialized:{
      "*": _ => {
        internals.kebab.deferUntilTransition()
        internals.kebab.transition( "welcome" )
      }
    },
    welcome:{
      _onEnter: _ => {
        internals.kebab.emit("kebab", { state: "welcome" })
      },
      todayLocations: 'locations',
      getMenu: 'menu',
      toOperator: 'operator'
    },
    locations:{
      showMap:'map',
      getSchedule:'schedule',
    },
    menu:{
      todayLocations:'locations',
      order:'operator'
    },
    schedule:{
      orderToGo:'operator',
      showMap:'map',
      otherLocations:'locations'
    },
    map:{

    },
    operator:{

    }
  },
  start: _ => {
    internals.kebab.transition('welcome')
  },
  reset: _ => {
    internals.kebab.emit("vehicles", { state: "reset" })
    internals.kebab.transition('welcome')
  }
})

module.exports = (robot) => {

  robot.enter((res) => {
    res.send('Welcome to debab')
  })

  robot.hear ( /(buenas|buen|buena|hola|días|dias|tardes|noches)/i, (res) => {
    internals.kebab.start()
    robot.emit ('welcome', res.envelope)
  })

  robot.hear (/current|st|status/i, (res) => {
    res.send(internals.kebab.compositeState())
  })

  robot.catchAll((res) => {
    res.send(internals.kebab.handle(res.message.text))
  })

  robot.on('welcome', (envelope) => {

    const res = new Response(robot, envelope, null)
    res.send('seleccione alguna opcion de menu')
  })
  internals.kebab.on('*', (eventName, data) => {
    robot.logger.info(eventName)
  })
}
