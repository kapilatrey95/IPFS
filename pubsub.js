const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const swarmConfig = require('./swarmConfig.js')
const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  },
  config: swarmConfig()

})

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with address ' + info.id)

  const room = Room(ipfs, 'ipfs-pubsub-demo')

  room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
  room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))

  // send and receive messages

  room.on('peer joined', (peer) => room.sendTo(peer, 'Hello ' + peer + '!'))
  room.on('message', (message) => console.log('got message from ' + message.from + ': ' + message.data.toString()))

  // broadcast message every 2 seconds

  setInterval(() => room.broadcast('hey everyone!'), 200000)
}))

function repo () {
  return 'pubsub-demo/' + Math.random()
}