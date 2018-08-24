import micropython
from machine import Timer
from mqtt import MQTTClient
import ujson
import machine
import time
from aes import AES

def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta

class CheckIn():
    def __init__(self,appId,clientId,c,interval=(60000*15)):
        self.c=c #MQTT client
        self.appId=appId
        self.clientId=clientId
        self.INTERVAL=interval
        self.lastTime=0

    def send(self):
        top="{}{}".format(self.appId,"/devices/checkIn")
        msg={"id":self.clientId}
        msg=ujson.dumps(msg)
        self.c.publish(top, msg)

    def pool(self):
        passedTime=getDeltaMs(self.lastTime)

        if passedTime >= self.INTERVAL:
            self.send()
            self.lastTime = time.ticks_ms()
    

class WDT():
    def __init__(self,interval=60000):
        self.interval=interval
        self.timer = Timer(-1)
        self._resetRef=self._reset
        self.feed()
    
    def feed(self):
        self.timer.deinit()
        self.timer.init(period=self.interval, mode=Timer.ONE_SHOT, callback=self.cb)
    
    def _reset(self,_):
        print("WDT restart")
        machine.reset()

    def cb(self,t):
        micropython.schedule(self._resetRef,0)


class MqttClient():
    def __init__(self,clientId,privateKey,server,keepalive=60):
        self.c=MQTTClient(client_id=clientId,server=server,keepalive=keepalive)
        self.c.DEBUG = True
        self.mCb=""
        self.aes=AES(privateKey)

    def setCallback(self,cb):
        self.mCb=cb
        self.c.set_callback(self._sub_cb)

    def connect(self,clean_session=True):
        return self.c.connect(clean_session)

    def disconnect(self):
        return self.c.disconnect()
    
    def _sub_cb(self,topic,msg):
        try:
            msg=self.aes.decrypt(msg.decode())
            self.mCb(topic.decode(),msg)
        except Exception:
            print("Incoming MQTT message error!",topic.decode())

    def checkForMsg(self):
        while 1:
            try:
                return self.c.check_msg()
            except OSError as e:
                self.c.log(False, e)
            self.c.reconnect()
  
    def subscribe(self,topic):
        self.c.subscribe(topic.encode())
    
    def publish(self,topic,msg):
        try:
            msg=self.aes.encrypt(msg)
            self.c.publish(topic.encode(), msg.encode())
        except Exception:
            print("Outgoing MQTT message error!",topic)
