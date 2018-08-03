import time
import micropython
import urequests
import ujson
import machine
from machine import Pin, Timer
import gc
micropython.alloc_emergency_exception_buf(100)

ONE_MINUTE_IN_MS = 60000

SERVER_URL = "http://192.168.1.101:7788"
# SERVER_URL="http://192.168.1.25:7788"


def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta

# sends sensor data to server
def sendToServer(path, data):
    headers = {'Content-Type': 'application/json'}
    url = SERVER_URL+path

    try:
        jdata = ujson.dumps(data)
        response = urequests.post(url, data=jdata, headers=headers)
        return response
    except Exception:
        print("Error occured while sending data to server")

    gc.collect()


# class for leak alert
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
