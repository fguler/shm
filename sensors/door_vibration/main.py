import micropython, urequests,ujson
#from machine import Timer
from machine import Pin
import time
micropython.alloc_emergency_exception_buf(100)


SERVER_URL="http://192.168.1.101:7788"
#SERVER_URL="http://192.168.1.25:7788"


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

#caculate delta ms
def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta


class DoorSwitch:

    def __init__(self):
        self.doorOpennedRef=self.doorOpenned
        self.pin=Pin(14,Pin.IN,Pin.PULL_UP)
        self.startMs=0
        self.ALARM_INTERVAL=60000
    
    def makeSureDoorOpenned(self):
        read1=self.pin.value()
        time.sleep(3)
        read2=self.pin.value()
        return bool(read1 and read2);

    def doorOpenned(self,v):     
        delta = getDeltaMs(self.startMs)
        isSure=self.makeSureDoorOpenned()

        if isSure and (delta >= self.ALARM_INTERVAL):
            print("The door is open")
            path="/api/devices/doorAlert"
            data={}
            data["isDoorOpen"]=True
            self.startMs=time.ticks_ms()
            sendToServer(path,data)
    
    def activate(self):
        self.pin.irq(trigger=Pin.IRQ_RISING,handler=self.cb)

    def cb(self,p):
        micropython.schedule(self.doorOpennedRef, p.value())


doorSwitch=DoorSwitch()
doorSwitch.activate()


