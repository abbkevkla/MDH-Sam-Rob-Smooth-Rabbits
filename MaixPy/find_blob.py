# Untitled - By: s8kevkla - Tue Jan 7 2020

THRESHOLD = (0, 190)
BINARY_VISIBLE = True


import sensor, image, time, lcd

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)
sensor.set_hmirror(0)
clock = time.clock()
lcd.init()


while(True):
    lines = []
    crossings = []
    clock.tick()
    img = sensor.snapshot()
    #blank = img.copy().clear()
    bw_img = img.copy().to_grayscale()
    bw_img.binary([THRESHOLD],invert=True) if BINARY_VISIBLE else sensor.snapshot()

    crossing = bw_img.find_blobs([(120,256)])

    bw_img.clear()

    if crossing:
        #print(crossing)
        for b in crossing:
            if b[2]/b[3] > 2 or b[2]/b[3] < 0.69:
                tmp=bw_img.draw_rectangle(b[0:4], color = (255), fill = True)


    crossing2 = bw_img.find_blobs([(120,256)], merge = True, margin = 15)

    bw_img.clear()

    if crossing2:
        for b in crossing2:
            #print(b[2]*b[3])
            if b[2]*b[3] > 2001:
                crossings.append(b)
                tmp=img.draw_rectangle(b[0:4], color = (255, 136, 0))
            else:
                tmp=img.draw_rectangle(b[0:4], color = (0, 136, 255))
                lines.append(b)
                tmp=bw_img.draw_rectangle(b[0:4], color = (255))

    line = bw_img.get_regression([(100,256) if BINARY_VISIBLE else THRESHOLD],area_threshold=300,robust=True)

    #if line:
    #    img.draw_line(line.line(), color = (120, 255, 3), thickness = 5)

    if len(crossings) > 2:
        print("4-vägskorsning")
    elif len(crossings) == 1:
        print("T-korsning")
    elif len(lines) > 3:
        print("Raksträcka")
    else:
        print("sväng")
    #print(blank.compress_for_ide(), end="")
    lcd.display(bw_img)
    #print(clock.fps())
