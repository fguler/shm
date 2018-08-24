#import hashlib
import binascii
import ucryptolib
import os


class AES():

    def __init__(self, key): 
        self.bs = 16
        self.key = binascii.unhexlify(key) # key must be a hex string

    def encrypt(self, plainText):
        plainText = self._pad(plainText)
        iv = os.urandom(self.bs)
        cipher = ucryptolib.aes(self.key, 2,iv) #CBC mode
        cipherText=binascii.b2a_base64(cipher.encrypt(plainText)).decode('utf-8')
        return binascii.b2a_base64(iv).decode("utf-8")+":"+cipherText

    def decrypt(self, cipherTextWithIV):
        iv,cipherText=cipherTextWithIV.split(":")
        cipherText = binascii.a2b_base64(cipherText)
        iv=binascii.a2b_base64(iv)
        cipher = ucryptolib.aes(self.key, 2,iv)
        return self._unpad(cipher.decrypt(cipherText)).decode('utf-8')

    def _pad(self, s):
        return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)

    def _unpad(self,s):
        return s[:-ord(s[len(s)-1:])]


""" class AES():

    def __init__(self, key): 
        self.bs = 16
        self.key = binascii.unhexlify(key) # key must be a hex string

    def encrypt(self, plainText):
        plainText = self._pad(plainText)
        iv = os.urandom(self.bs)
        cipher = ucryptolib.aes(self.key, 2,iv) #CBC mode
        cipherText=binascii.hexlify(cipher.encrypt(plainText)).decode('utf-8')
        return binascii.hexlify(iv).decode("utf-8")+":"+cipherText

    def decrypt(self, cipherTextWithIV):
        iv,cipherText=cipherTextWithIV.split(":")
        cipherText = binascii.unhexlify(cipherText)
        iv=binascii.unhexlify(iv)
        cipher = ucryptolib.aes(self.key, 2,iv)
        return self._unpad(cipher.decrypt(cipherText)).decode('utf-8')

    def _pad(self, s):
        return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)

    def _unpad(self,s):
        return s[:-ord(s[len(s)-1:])]
 """