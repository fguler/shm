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


def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta


# sends sensor data to server
def sendToServer(path,data):
    headers = {'Content-Type': 'application/json'}
    url = SERVER_URL+path

    try:
        jdata = ujson.dumps(data)
        response = urequests.post(url, data=jdata, headers=headers)
        return response
    except Exception:
        print("Error occured while sending data to server")
    
    gc.collect()


# reads sensor data
def getSensorData():

    while True:
        if sensor.get_sensor_data() and sensor.data.heat_stable:
            sensorData["temp"] = round(sensor.data.temperature)
            sensorData["hum"] = round(sensor.data.humidity)
            # turn the VOC value into KOhms
            sensorData["gas"] = round(sensor.data.gas_resistance/1000)
            sensorData["hpa"] = round(sensor.data.pressure)
            break



# at the begining this work time is needed to stabilize sensor readings
print("Sensor stabilizing period is starting")
counter = 0
# runs around 20 minute to warm up the sensor
while counter < 600:
    print(counter)
    getSensorData()
    print(sensorData)
    counter += 1
    time.sleep(2)
print("Sensor stabilizing period has ended")



# Class to send Ambiance values to server
class Ambiance:
    def __init__(self):
        self.lastTime = 0
        self.response_time = ONE_MINUTE_IN_MS*30

    def measureTimePassed(self):
        delta = getDeltaMs(self.lastTime)
        result = delta >= self.response_time
        return result

    def send(self):
        path = "/api/devices/ambiance"
        sendToServer(path,sensorData)
        print("Ambiance data sent to server")

    def run(self):
        if self.measureTimePassed():
            self.send()
            self.lastTime = time.ticks_ms()


#Class to measure air quality based on sensor's VOC value
class AirQuality:
    def __init__(self):
        self.data=[] # will hold last the VOC readings
        self.avg=0 # avarage of first 30 readings in the array
        self.lastTimeDataSent = 0
        self.DATA_ARRAY_SIZE=60
        self.TRIGER_GAP=0.25 # this percentange will be subtracted from avg
        self.ALARM_INTERVAL=ONE_MINUTE_IN_MS*15 #every 15 minute set the alarm
    
    def checkLastReading(self,gas):
        if len(self.data)!=self.DATA_ARRAY_SIZE:
            return True
        
        #baseline
        baseline=round((self.avg-(self.avg*self.TRIGER_GAP)))
        print("Avg {}, Baseline {}, Gas {}".format(self.avg,baseline,gas))

        if gas<=baseline:
            return False
        else:
            return True
        
    def addLastReading(self,gas):
        if len(self.data)!=self.DATA_ARRAY_SIZE:
            self.data.insert(0,gas)
            print("Data array size {}".format(len(self.data)))
        else:
            self.data.pop()#delete last element
            self.data.insert(0,gas)#add new element to first position
            self.avg=round(sum(self.data[-30:])/30) # calculate avg
    
    def send(self):
        path = "/api/devices/gasAlarm"
        payload={"gasAlarm":True}
        sendToServer(path,payload)
    
    def measureTimePassed(self):
        delta = getDeltaMs(self.lastTimeDataSent)
        result = (delta >= self.ALARM_INTERVAL)
        return result
    
    def trigerAlarm(self):
        # if called, gas alarm only can inform server at defined interval
        if self.measureTimePassed():
            self.send()
            self.lastTimeDataSent=time.ticks_ms()

    def run(self):
        gas=int(sensorData["gas"])
        if self.checkLastReading(gas):
            self.addLastReading(gas)
        else:
            self.trigerAlarm()

            



air=AirQuality()
amp = Ambiance()

#Run loop
while True:
    getSensorData()
    air.run()
    amp.run()
    time.sleep(2)
