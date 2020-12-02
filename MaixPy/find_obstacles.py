import sensor
import image
import lcd
import time
lcd.init()
sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_hmirror(0) # Mirrors image
sensor.run(1)

green_threshold   = (100, 0, -16, -128, 5, 15)
yellow_threshold   = (100, 0, 1, 127, 127, 17)

while True:
    img=sensor.snapshot()
    greenblobs = img.find_blobs([green_threshold], area_threshold=5, merge=True, margin=10)
    yellowblobs = img.find_blobs([yellow_threshold], area_threshold=20, merge=True, margin=25)
    if greenblobs:
        for b in greenblobs:
            tmp=img.draw_rectangle(b[0:4], color=(0, 180, 55))
    if yellowblobs:
        for b in yellowblobs:
            tmp=img.draw_rectangle(b[0:4], color=(255, 221, 0))
    lcd.display(img)
