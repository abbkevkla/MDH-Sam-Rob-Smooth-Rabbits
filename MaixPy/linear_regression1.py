# Untitled - By: s8kevkla - Tue Jan 7 2020

THRESHOLD = (0, 190)
BINARY_VISIBLE = True


import sensor, image, time

sensor.reset()
sensor.set_pixformat(sensor.GRAYSCALE)
sensor.set_framesize(sensor.QQVGA)
sensor.skip_frames(time = 2000)
sensor.set_hmirror(0)
clock = time.clock()
lines = []

while(True):
    clock.tick()
    img = sensor.snapshot().binary([THRESHOLD],invert=True) if BINARY_VISIBLE else sensor.snapshot()

#    line = img.get_regression([(0,100) if BINARY_VISIBLE else THRESHOLD],invert=True,area_threshold=300,robust=True)
    lines = img.find_lines(threshold=2500)

#    if (line):
#        img.draw_line(line.line(), color = 127)

    for l in lines:
        print(l)
        if l[2]-l[0] == 0 or abs((l[3]-l[1])/(l[2]-l[0])) > 1:
            img.draw_line(l.line(), color = 127)
    #print(clock.fps())
