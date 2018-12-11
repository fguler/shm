import time
import urequests
import ujson
import bme680
from i2c import I2CAdapter
from machine import Pin
from machine import Timer
import gc
import math
from utils import WDT, CheckIn, MqttClient

ONE_MINUTE_IN_MS = 60000

i2c_dev = I2CAdapter(scl=Pin(19), sda=Pin(18), freq=100000)
sensor = bme680.BME680(i2c_device=i2c_dev, i2c_addr=bme680.I2C_ADDR_SECONDARY)
sensor.set_gas_heater_profile(320, 150)


# MQTT topics
TOPIC_AMB = "{}{}".format(MQTT_APP_ID, "/devices/ambiance")
TOPIC_GAS = "{}{}".format(MQTT_APP_ID, "/devices/gasAlert")


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

        self.lastTimeDataSent = 0
        # alarm should be triggered every 10 minutes
        self.ALARM_INTERVAL = ONE_MINUTE_IN_MS*10
        self.BASE_VOC_VALUE = 750000

    def calculateAirQuality(self, gas):
        air_quality_score = 0

        if gas >= self.BASE_VOC_VALUE:
            air_quality_score = 99
        else:
            air_quality_score = math.floor((gas/self.BASE_VOC_VALUE)*100)

        return air_quality_score

    def send(self):
        msg = {"status": True, "deviceId": MQTT_CLIENT_ID}
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
    def __init__(self, air):
        self.air = air
        self.lastTime = 0
        self.response_time = ONE_MINUTE_IN_MS*15
        self.sensorData = {"temp": 0, "hum": 0, "gas": 0,
                           "air": 0, "hpa": 0, "deviceId": MQTT_CLIENT_ID}

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
        self.sensorData["gas"] = sData["gas"]

        air = self.air.calculateAirQuality(sData["gas"])
        self.sensorData["air"] = air
        print(self.sensorData)

        # trigers alarm if air quality score drops below 60
        if air < 50:
            self.air.trigerAlarm()

        if self.measureTimePassed():
            self.send()
            self.lastTime = time.ticks_ms()


wdt = WDT()

# MQTT
mc = MqttClient(MQTT_CLIENT_ID, PRIVATE_KEY, MQTT_BRK, 1200)
mc.connect()
print("connected to MQTT broker!")

airObj = AirQuality()
amb = Ambiance(airObj)
chk = CheckIn(MQTT_APP_ID, MQTT_CLIENT_ID, mc)


# Run loop
while True:
    amb.run()
    chk.pool()
    wdt.feed()
    time.sleep(10)

