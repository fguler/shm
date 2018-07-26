from machine import Pin
from machine import Timer
import time, micropython

micropython.alloc_emergency_exception_buf(100)


def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta

#class for pir sensor
class Pir:
    def __init__(self):
        self.motion_ref=self.motion
        self.initPin_ref=self.initPin

        self.count=0
        self.startMs=0
        self.RESPONSE_RANGE=30000


        self.tim=Timer(-1)
        self.tim.init(period=65000, mode=Timer.ONE_SHOT, callback=self.timerCB)
    
    def motion(self,_):
        delta = getDeltaMs(self.startMs)

        if delta >= self.RESPONSE_RANGE:
            self.startMs=time.ticks_ms()
            self.count+=1
            print("motion detected {} delta : {}".format(self.count, delta))
    

    def initPin(self,_):
        self.pir=Pin(5,Pin.IN)
        self.pir.irq(trigger=Pin.IRQ_RISING, handler=self.cb)

    def timerCB(self,t):
        print("PIR timer ran")
        micropython.schedule(self.initPin_ref, 0)
    
    def cb(self,p):
        micropython.schedule(self.motion_ref, 0)
        


pir_=Pir()
