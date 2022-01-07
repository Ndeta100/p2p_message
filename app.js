const  crypto=require('crypto')
const alice=crypto.createECDH('secp256k1')
alice.generateKeys()
const bob=crypto.createECDH('secp256k1')
bob.generateKeys()
const alicePublicKeyBase64=alice.generateKeys().toString('base64')
const bobPublicKeyBase64=bob.generateKeys().toString('base64')

const aliceSharedKey=alice.computeSecret(bobPublicKeyBase64, 'base64', 'hex')

const bobSharedKey=bob.computeSecret(alicePublicKeyBase64, 'base64', 'hex')

console.log(aliceSharedKey===bobSharedKey)
console.log()
console.log(aliceSharedKey)
console.log()
console.log(bobSharedKey)
console.log()
console.log(aliceSharedKey.length*4)
console.log()
console.log(bobSharedKey.length*4)


const message ='Hi Bob I miss you'
const IV=crypto.randomBytes(16)
const cipher=crypto.createCipheriv('aes-256-gcm', Buffer.from(aliceSharedKey, 'hex'), IV)

let encrypt=cipher.update(message, 'utf-8', 'hex')
encrypt +=cipher.final('hex')


const auth_tag=cipher.getAuthTag().toString('hex')
console.table({
    IV:IV.toString('hex'),
    encrypt:encrypt,
    auth_tag:auth_tag
})

const payload=IV.toString('hex')+encrypt+auth_tag

const payloadBase64=Buffer.from(payload, 'hex').toString('hex')
console.log(payloadBase64)


// Bob will do something to see message
const bob_payload=Buffer.from(payloadBase64, 'base64').toString('hex')
const bob_iv=bob_payload.substr(0, 32)
const bob_encrypt=bob_payload.substr(32, bob_payload.length -32-32)
const bob_auth_tag=bob_payload.substr(bob_payload.length-32, 32)

console.table({
    bob_iv, bob_encrypt, bob_auth_tag
})
try {
    const decipher=crypto.createDecipheriv('aes-256-gcm', Buffer.from(bobSharedKey, 'hex'), Buffer.from(bob_iv, 'hex'))

    decipher.setAuthTag(Buffer.from(bob_auth_tag, 'hex'))
    let decrypted=decipher.update(bob_encrypt, 'hex', 'utf-8')
    decrypted +=decipher.final('utf-8')
    console.log("DECRYPTED MESSAGE", decrypted)
} catch (error) {
   console.log(error.message) 
}