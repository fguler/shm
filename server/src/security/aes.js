const Crypto = require('crypto');


class AES128CBC {

    constructor(key) {
        this.key = Buffer.from(key, "hex");
        this.bs = 16;
    }

    decrypt(cipherTextWithIV) {

        let cipherText, iv;
        let plainText = "";

        [iv, cipherText] = cipherTextWithIV.split(":"); // split iv and ciphertext
        iv = Buffer.from(iv, "base64");

        const decipher = Crypto.createDecipheriv("aes-128-cbc", this.key, iv);

        plainText = decipher.update(cipherText, 'base64', 'utf8');
        plainText += decipher.final('utf8');

        return plainText;

    }

    encrypt(plainText) {

        let cipherText = "";

        let iv = Crypto.randomBytes(this.bs)

        const cipher = Crypto.createCipheriv('aes-128-cbc', this.key, iv);

        cipherText = cipher.update(plainText, 'utf8', 'base64');
        cipherText += cipher.final('base64');

        cipherText = iv.toString("base64") + ":" + cipherText;

        return cipherText;
    }


}

module.exports = {
    /**
     * Creates an AES128CBC Cipher object.
     *
     * @param {String} key
     *   Key for cipher. {key} Must be a hex string
     */
    createAES128Cipher(key) {
        return new AES128CBC(key);
    }
};