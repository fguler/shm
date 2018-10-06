import time
import urequests
import ujson
import bme680
from i2c import I2CAdapter
from machine import Pin
from machine import Timer
import gc
from utils import WDT,CheckIn,MqttClient

ONE_MINUTE_IN_MS = 60000

i2c_dev = I2CAdapter(scl=Pin(19), sda=Pin(18), freq=100000)
sensor = bme680.BME680(i2c_device=i2c_dev, i2c_addr=bme680.I2C_ADDR_SECONDARY)
sensor.set_gas_heater_profile(320, 150)


#MQTT topics
TOPIC_AMB="{}{}".format(MQTT_APP_ID,"/devices/ambiance")
TOPIC_GAS="{}{}".format(MQTT_APP_ID,"/devices/gasAlert")


def getDeltaMs(start=0):
    delta = time.ticks_diff(time.ticks_ms(), start)
    return delta


# reads sensor data
def getSensorData():
    data = {"temp": 0, "hum": 0, "gas": 0, "hpa": 0}

    while True:
        if sensor.get_sensor_data() and sensor.data.heat_stable:
            data["temp"] = round(sensor.data.temperature)
            data["hum"] = round(sensor.data.humidity)
            data["gas"] = round(sensor.data.gas_resistance)
            data["hpa"] = round(sensor.data.pressure)
            break

    return data


# at the begining this work time is needed to stabilize sensor readings
print("Sensor stabilizing period is starting")
counter = 0
# runs around 20 minute to warm up the sensor
while counter < 120:
    print(counter)
    data = getSensorData()
    print(data)
    counter += 1
    time.sleep(10)
print("Sensor stabilizing period has ended")


# Class to measure air quality based on sensor's VOC value
class AirQuality:
    def __init__(self):

        self.data = []  # will hold last the VOC readings
        self.gasBaseline = 0  # avarage of first 30 readings in the array
        self.lastTimeDataSent = 0
        self.DATA_ARRAY_SIZE = 60
        self.ALARM_INTERVAL = ONE_MINUTE_IN_MS*10  # alarm should be triggered every 10 minutes

    def calculateAirQuality(self, gas, hum):
        #add last reading to the list to calculate gas baseline
        self.addLastReading(gas)

        # if we don't have enough data to calculate baseline return 100
        if len(self.data) != self.DATA_ARRAY_SIZE:
            return 100

        gas_baseline = self.gasBaseline

        # Set the humidity baseline to 40%, an optimal indoor humidity.
        hum_baseline = 40.0

        # This sets the balance between humidity and gas reading in the
        # calculation of air_quality_score (25:75, humidity:gas)
        hum_weighting = 0.25

        gas_offset = gas_baseline - gas
        hum_offset = hum - hum_baseline

        # Calculate hum_score as the distance from the hum_baseline.
        if hum_offset > 0:
            hum_score = (100 - hum_baseline - hum_offset) / (100 - hum_baseline) * (hum_weighting * 100)

        else:
            hum_score = (hum_baseline + hum_offset) / hum_baseline * (hum_weighting * 100)

        # Calculate gas_score as the distance from the gas_baseline.
        if gas_offset > 0:
            gas_score = (gas / gas_baseline) * (100 - (hum_weighting * 100))

        else:
            gas_score = 100 - (hum_weighting * 100)

        # Calculate air_quality_score.
        air_quality_score = round(hum_score + gas_score)

        return air_quality_score

    def addLastReading(self, gas):
        if len(self.data) != self.DATA_ARRAY_SIZE:
            self.data.insert(0, gas)
            print("Data array size {}".format(len(self.data)))
        else:
            self.data.pop()  # delete last element
            self.data.insert(0, gas)  # add new element to first position
            self.gasBaseline = round(sum(self.data[-30:])/30)  # calculate baseline

    def send(self):
        msg = {"status": True,"id":MQTT_CLIENT_ID}
        mc.publish(TOPIC_GAS, msg)

    def measureTimePassed(self):
        delta = getDeltaMs(self.lastTimeDataSent)
        result = (delta >= self.ALARM_INTERVAL)
        return result

    def trigerAlarm(self):
        # if called, gas alarm only can inform the server at defined interval
        if self.measureTimePassed():
            self.send()
            self.lastTimeDataSent = time.ticks_ms()



# Class to send Ambiance values to server
class Ambiance:
    def __init__(self,air):
        self.air=air
        self.lastTime = 0
        self.response_time = ONE_MINUTE_IN_MS*30
        self.sensorData = {"temp": 0, "hum": 0, "air": 0, "hpa": 0,"id":MQTT_CLIENT_ID}

    def measureTimePassed(self):
        delta = getDeltaMs(self.lastTime)
        result = delta >= self.response_time
        return result

    def send(self):
        mc.publish(TOPIC_AMB, self.sensorData)

    def run(self):
        sData = getSensorData()

        self.sensorData["temp"] = sData["temp"]
        self.sensorData["hum"] = sData["hum"]
        self.sensorData["hpa"] = sData["hpa"]

        air = self.air.calculateAirQuality(sData["gas"], sData["hum"])
        self.sensorData["air"] = air
        print(self.sensorData)

        #trigers alarm if air quality score drops below 60
        if air<65:
            self.air.trigerAlarm()
        
        if self.measureTimePassed():
            self.send()
            self.lastTime = time.ticks_ms()



wdt=WDT()

#MQTT
mc=MqttClient(MQTT_CLIENT_ID,PRIVATE_KEY,MQTT_BRK,1200)
mc.connect()
print("connected to MQTT broker!")

airObj = AirQuality()
amb = Ambiance(airObj)
chk=CheckIn(MQTT_APP_ID,MQTT_CLIENT_ID,mc)


# Run loop
while True:
    amb.run()
    chk.pool()
    wdt.feed()
    time.sleep(10)
