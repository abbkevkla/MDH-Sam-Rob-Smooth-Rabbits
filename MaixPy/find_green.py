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
#green_threshold   = ((100, 0, -21, -128, 127, 23))
green_threshold   = ((100, 0, -16, -128, 5, 15))

while True:
    img=sensor.snapshot()
    blobs = img.find_blobs([green_threshold], area_threshold=5, merge=True, margin=10)
    if blobs:
        for b in blobs:
            tmp=img.draw_rectangle(b[0:4])
    lcd.display(img)
