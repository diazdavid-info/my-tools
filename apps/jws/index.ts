import jws from 'jws'
import * as fs from 'fs'

const signatureBySecret = jws.sign({
  header: { alg: 'HS256' },
  payload: 'h. jon benjamin',
  secret: 'has a van'
})

console.log(signatureBySecret)

console.log(jws.verify(signatureBySecret, 'HS256', 'has a van'))

console.log(jws.decode(signatureBySecret))

const privateKey = fs.readFileSync('./key')
console.log(privateKey)
const signatureByKey = jws.sign({
  header: { alg: 'RS256' },
  payload: { email: 'diaz@zityhub.com' },
  privateKey: privateKey
})

console.log(signatureByKey)

const publicKey = fs.readFileSync('./key.pub')
console.log(publicKey)
console.log(jws.verify(signatureByKey, 'RS256', publicKey))

console.log(jws.decode(signatureByKey))
