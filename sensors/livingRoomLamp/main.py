from machine import Pin,Timer
import micropython
from utils import WDT,CheckIn,MqttClient
import time
import ujson

mc=MqttClient(MQTT_CLIENT_ID,PRIVATE_KEY,MQTT_BRK,1200)
wdt=WDT()

TOPIC_LAMP="{}{}".format(MQTT_APP_ID,"/devices/LRoomLamp")
TOPIC_ALARM="{}{}".format(MQTT_APP_ID,"/alarm/status")


class Lamp():
    def __init__(self):
        self.pin=Pin(12,Pin.OUT)
        self.timer = Timer(-1)
        self._autoTurnOffRef=self._autoTurnOff
    
    def turnOn(self,autoTurnOff=False):
        self.pin.on()
        if autoTurnOff:
            self.timer.init(period=(60000*5), mode=Timer.ONE_SHOT, callback=self.cb)

    def turnOff(self):
        self.pin.off()

    def _autoTurnOff(self,_):
        self.turnOff()
    
    def cb(self,t):
        micropython.schedule(self._autoTurnOffRef,0)
    
lamp=Lamp()

def onMessage(topic, msg):
    
    if topic==TOPIC_LAMP:
        if msg["status"]:
            lamp.turnOn()
        else:
            lamp.turnOff()

    elif topic==TOPIC_ALARM:
        if msg["status"]:
            lamp.turnOn(True)# auto turning off active


mc.setCallback(onMessage)
mc.connect()
print("connected to MQTT broker!")
mc.subscribe(TOPIC_LAMP)
mc.subscribe(TOPIC_ALARM)


check=CheckIn(MQTT_APP_ID,MQTT_CLIENT_ID,mc)

while True:
    mc.checkForMsg() # only necessary if are subscriber
    check.pool()
    wdt.feed()
    time.sleep(2)