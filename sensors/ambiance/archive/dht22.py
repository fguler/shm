import time, micropython, dht, urequests,ujson
from machine import Timer
from machine import Pin
micropython.alloc_emergency_exception_buf(100)

dht22 = dht.DHT22(Pin(4))
ONE_MINUTE=60000

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


# class for Ambiance measurements
class Ambiance:
    def __init__(self):
        self.measureRef=self.measure
        self.temp=0
        self.hum=0
        self.tim=Timer(-1)
        
    def measure(self,_):
        path="/api/devices/ambiance"
        data={}

        dht22.measure()
        self.temp=dht22.temperature()
        self.hum=dht22.humidity()
        data["temp"]=self.temp
        data["hum"]=self.hum
        data["pre"]=0
        data["air"]=0
        sendToServer(path,data)
        #print("kullanılan memory {}".format(gc.mem_alloc()))
    
    def start(self):
        self.tim.init(period=(ONE_MINUTE*15), mode=Timer.PERIODIC, callback=self.cb)

    def cb(self,t):
        micropython.schedule(self.measureRef, 0)

ambiance=Ambiance()
ambiance.start()


#class for leak alert
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
