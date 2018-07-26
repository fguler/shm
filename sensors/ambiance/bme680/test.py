import micropython
import time
import urequests
import ujson
import bme680
from i2c import I2CAdapter
from machine import Pin
from machine import Timer
import gc

micropython.alloc_emergency_exception_buf(100)
ONE_MINUTE_IN_MS = 60000
SERVER_URL="http://192.168.1.101:7788"
#SERVER_URL = "http://192.168.1.22:7788"

sensorData={"temp":0,"hum":0,"gas":0,"hpa":0}

i2c_dev = I2CAdapter(scl=Pin(19), sda=Pin(18), freq=100000)
sensor = bme680.BME680(i2c_device=i2c_dev, i2c_addr=bme680.I2C_ADDR_SECONDARY)
sensor.set_gas_heater_profile(320, 150)


class Gas:
    def __init__(self):
        self.data=[] # will hold last 80 readings
        self.avg=0 # avarage of first 40 readings in the array
        self.DATA_ARRAY_SIZE=80
    
    def checkLastReading(self):
        if len(self.data)!=self.DATA_ARRAY_SIZE:
            print("Array size {}".format(len(self.data)))
            return True
        
        return True
        
    def addLastReading(self):
        if len(self.data)!=self.DATA_ARRAY_SIZE:
            self.data.insert(0,int(sensorData["gas"]))
        else:
            self.data.pop()#delete last element
            self.data.insert(0,int(sensorData["gas"]))#add new element to first position
            self.avg=round(sum(self.data[-40:])/40)
            print("Avg {}".format(self.avg))
    
    def trigerAlarm(self):
        pass 
    def run(self):
        if self.checkLastReading():
            self.addLastReading()

gas=Gas()


while True:
    if sensor.get_sensor_data() and sensor.data.heat_stable:
        sensorData["temp"] = round(sensor.data.temperature)
        sensorData["hum"] = round(sensor.data.humidity)
        # turn the VOC value into KOhms
        sensorData["gas"] = round(sensor.data.gas_resistance/1000)
        sensorData["hpa"] = round(sensor.data.pressure)
        print(sensorData)
        gas.run()
    time.sleep(2)

