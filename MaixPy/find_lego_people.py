# Untitled - By: s8kevkla - Thu Nov 5 2020

import sensor, image, lcd, time

lcd.init()
sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.run(1)
yellow_threshold   = (76, 100, -11, 127, 127, 17)
bw_threshold = (0, 46)
while True:
    img=sensor.snapshot()
    # bw_img = img.copy().to_grayscale()
    blobs = img.find_blobs([yellow_threshold])
    if blobs:
        for b in blobs:
            tmp=img.draw_rectangle(b[0:4], color=(255, 137, 0))
    lcd.display(img)
