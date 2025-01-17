const { strict: assert } = require('assert')

const generateIV = require('../help/generate_iv')
const base64url = require('../help/base64url')

module.exports = (JWA) => {
  ['A128GCMKW', 'A192GCMKW', 'A256GCMKW'].forEach((jwaAlg) => {
    assert(!JWA.keyManagementEncrypt.has(jwaAlg), `keyManagementEncrypt alg ${jwaAlg} already registered`)
    assert(!JWA.keyManagementDecrypt.has(jwaAlg), `keyManagementDecrypt alg ${jwaAlg} already registered`)

    const encAlg = jwaAlg.substr(0, 7)
    const encrypt = JWA.encrypt.get(encAlg)
    const decrypt = JWA.decrypt.get(encAlg)

    JWA.keyManagementEncrypt.set(jwaAlg, (key, payload) => {
      const iv = generateIV(jwaAlg)
      const { ciphertext, tag } = encrypt(key, payload, { iv })
      return {
        wrapped: ciphertext,
        header: { tag: base64url.encodeBuffer(tag), iv: base64url.encodeBuffer(iv) }
      }
    })
    JWA.keyManagementDecrypt.set(jwaAlg, decrypt)
  })
}
