# https://github.com/robmarkcole/bme680-mqtt-micropython
# https://github.com/gkluoe/bme680/blob/master/library/bme680/i2c.py

import micropython, time, urequests,ujson
import bme680
from i2c import I2CAdapter
from machine import Pin
from machine import Timer

micropython.alloc_emergency_exception_buf(100)
ONE_MINUTE=60000
#SERVER_URL="http://192.168.1.101:7788"
SERVER_URL="http://192.168.1.22:7788"

i2c_dev = I2CAdapter(scl=Pin(19), sda=Pin(18), freq=100000)
sensor = bme680.BME680(i2c_device=i2c_dev, i2c_addr=bme680.I2C_ADDR_SECONDARY)
sensor.set_gas_heater_profile(320, 150)


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


#reads sensor data
def getSensorData():
    values={}

    while True:
        if sensor.get_sensor_data() and sensor.data.heat_stable:
            values["temp"] = round(sensor.data.temperature)
            values["hum"] = round(sensor.data.humidity)
            values["gas"] = round(sensor.data.gas_resistance/1000) # turn the value into KOhms
            values["hpa"] = round(sensor.data.pressure)
            break

    return values



# at the begining this work time is needed to stabilize sensor readings
print("Sensor stabilizing period is starting")
time.sleep(3)
counter = 0
while counter < 20:
    print(getSensorData())
    counter += 1
    time.sleep(1)
print("Sensor stabilizing period has ended")


#Class to send Ambiance values to server
class Ambiance:
    def __init__(self):
        self.timer = Timer(-1)
        self.read_ref = self.read
    
    def send(self,data):
        path="/api/devices/ambiance"
        sendToServer(path,data)

    def read(self, _):
        data=getSensorData()
        self.send(data)

    def start(self):
        self.timer.init(period=3000, mode=Timer.PERIODIC, callback=self.cb)

    def cb(self, t):
        micropython.schedule(self.read_ref, 0)

amp=Ambiance()
amp.start()




#Class to take action based on sensor gas measurement(VOC)
class Gas:
    def __init__(self):
        self.timer = Timer(-1)
        self.read_ref = self.read
    
    def alert(self):
        pass

    def read(self, _):
        print(getSensorData())


    def start(self):
        self.timer.init(period=3000, mode=Timer.PERIODIC, callback=self.cb)

    def cb(self, t):
        micropython.schedule(self.read_ref, 0)

