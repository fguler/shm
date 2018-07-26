import time, micropython,urequests,ujson
import machine
from machine import Pin
micropython.alloc_emergency_exception_buf(100)

ONE_MINUTE=60000

SERVER_URL="http://192.168.1.101:7788"
#SERVER_URL="http://192.168.1.25:7788"

pin=Pin(5,Pin.IN)#D01 on the boart


#sends sensor data to server
def sendToServer(path,data):
    headers = {'Content-Type': 'application/json'} 
    url=SERVER_URL+path
    
    try:
        jdata=ujson.dumps(data)
        response = urequests.post(url,data=jdata, headers=headers)
        return response
    except Exception:
        print("Error occured while sending data to server")

#read sensor status and inform server
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
    goDeepSleep()




""" #class for leak alert
class Leak:
    def __init__(self):
        self.leakActionRef=self.leakAction
        self.pin=Pin(5,Pin.IN)#D01 on the boart
        self.timeOutTimer=Timer(-1)
    
    def leakAction(self,_):

        if not self.pin.value():
            print("leak alert")
            path="/api/devices/leakAlert"
            data={"leak":True}
            sendToServer(path,data)
        
    def start(self):
        #self.timeOutTimer.deinit()
        self.timeOutTimer.init(period=10000, mode=Timer.PERIODIC, callback=self.cb)


    def cb(self,t):
        micropython.schedule(self.leakActionRef, 0)

leak=Leak()
leak.start()
 """