import time
import bme680
from i2c import I2CAdapter
from machine import Pin
from machine import Timer
import math
from utils import WDT, CheckIn, MqttClient


i2c_dev = I2CAdapter(scl=Pin(19), sda=Pin(18), freq=100000)
sensor = bme680.BME680(i2c_device=i2c_dev, i2c_addr=bme680.I2C_ADDR_SECONDARY)
sensor.set_gas_heater_profile(320, 150)


# MQTT topics
TOPIC_AMB = "{}{}".format(MQTT_APP_ID, "/devices/ambiance")
#TOPIC_GAS = "{}{}".format(MQTT_APP_ID, "/devices/gasAlert")


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
while counter < 80:
    print(counter)
    data = getSensorData()
    print(data)
    counter += 1
    time.sleep(15)
print("Sensor stabilizing period has ended")


# Class to send Ambiance values to server
class Ambiance:
    def __init__(self):
        self.sensorData = {"temp": 0, "hum": 0, "gas": 0,"hpa": 0, "deviceId": MQTT_CLIENT_ID}

    def send(self):
        mc.publish(TOPIC_AMB, self.sensorData)

    def run(self):
        sData = getSensorData()

        self.sensorData["temp"] = sData["temp"]
        self.sensorData["hum"] = sData["hum"]
        self.sensorData["hpa"] = sData["hpa"]
        self.sensorData["gas"] = sData["gas"]

        print(self.sensorData)
        self.send()



wdt = WDT()

# MQTT
mc = MqttClient(MQTT_CLIENT_ID, PRIVATE_KEY, MQTT_BRK, 1200)
mc.connect()
print("connected to MQTT broker!")

amb = Ambiance()
chk = CheckIn(MQTT_APP_ID, MQTT_CLIENT_ID, mc)


# Run loop
while True:
    amb.run()
    chk.pool()
    wdt.feed()
    time.sleep(15)

