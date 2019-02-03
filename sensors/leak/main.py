import time
from machine import Pin
from utils import WDT,CheckIn,MqttClient

ONE_MINUTE_IN_MS = 60000

TOPIC_LEAK="{}{}".format(MQTT_APP_ID,"/devices/leakAlert")

# class for leak alert
class Leak:
    def __init__(self):
        self.pin = Pin(5, Pin.IN)  # D01 on the boart
        self.lastAlertTime = 0
        self.interval = ONE_MINUTE_IN_MS*15

    def raiseAlert(self):
        #path = "/api/devices/leakAlert"
        msg = {"status": True, "deviceId": MQTT_CLIENT_ID}
        mc.publish(TOPIC_LEAK, msg)

    def readSensorState(self):
        count = 0
        i = 0
        pValue = 0

        while i < 3:
            pValue = self.pin.value()
            count += pValue
            time.sleep_ms(300)
            i += 1
        return count

    def check(self, _):

        state = self.readSensorState()
        cTime = time.ticks_ms()
        isItTime = (cTime>=self.lastAlertTime)

        if state < 3 and isItTime:
            print("leak alert")
            self.lastAlertTime = (cTime+self.interval)
            self.raiseAlert()

mc=MqttClient(MQTT_CLIENT_ID,PRIVATE_KEY,MQTT_BRK,1200)
mc.connect()
print("connected to MQTT broker!")
#mc.subscribe(TOPIC)

wdt=WDT()
leak=Leak()
check=CheckIn(MQTT_APP_ID,MQTT_CLIENT_ID,mc)

while True:
    check.pool()
    wdt.feed()
    time.sleep(5)



""" # class for leak alert
class Leak:
    def __init__(self):
        self.leakActionRef = self.leakAction
        self.pin = Pin(5, Pin.IN)  # D01 on the boart
        self.timeOutTimer = Timer(-1)
        self.lastAlertTime = 0
        self.responseTime = ONE_MINUTE_IN_MS*15

    def respond(self):
        path = "/api/devices/leakAlert"
        data = {"leak": True}
        sendToServer(path, data)

    def readSensorState(self):
        count = 0
        i = 0
        pValue = 0

        while i < 3:
            pValue = self.pin.value()
            count += pValue
            time.sleep_ms(500)
            i += 1
        return count

    def leakAction(self, _):

        state = self.readSensorState()
        delta = getDeltaMs(self.lastAlertTime)
        isItTime = (delta >= self.responseTime)

        if state < 3 and isItTime:
            print("leak alert")
            self.lastAlertTime = time.ticks_ms()
            self.respond()

    def start(self):
        self.timeOutTimer.init(
            period=10000, mode=Timer.PERIODIC, callback=self.cb)

    def cb(self, t):
        micropython.schedule(self.leakActionRef, 0)


leak = Leak()
leak.start()
 """

""" #read sensor status and inform server
def readSensorState():
    print("reading sensor status")
    count=0
    i=0
    pValue=0

    while i<3:
        pValue=pin.value()
        count+=pValue
        time.sleep(1)
        i+=1
    
    if count<3:
        print("leak alert")
        path="/api/devices/leakAlert"
        data={"leak":True}
        sendToServer(path,data)


def goDeepSleep():
    # configure RTC.ALARM0 to be able to wake the device
    rtc = machine.RTC()
    rtc.irq(trigger=rtc.ALARM0, wake=machine.DEEPSLEEP)
    # set RTC.ALARM0 to fire after xxx seconds (waking the device)
    rtc.alarm(rtc.ALARM0, ONE_MINUTE*2)
    # put the device to sleep
    print('going into deep sleep')
    machine.deepsleep()


if machine.reset_cause() == machine.DEEPSLEEP_RESET:

    print('woke from a deep sleep')
    time.sleep_ms(2000)
    readSensorState()
    goDeepSleep()
else:
    print('power on or hard reset')
    time.sleep_ms(10000)
    goDeepSleep() """
