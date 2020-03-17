# Untitled - By: s8kevkla - Tue Jan 7 2020

THRESHOLD = (0, 190)
BINARY_VISIBLE = True


import sensor, image, time, lcd

from fpioa_manager import fm
from machine import UART
from board import board_info

fm.register(board_info.PIN15, fm.fpioa.UART1_TX, force=True) # Sets pin15 as new TX-pin
# fm.register(board_info.PIN17, fm.fpioa.UART1_RX, force=True)
# fm.register(board_info.PIN9, fm.fpioa.UART2_TX, force=True)
# fm.register(board_info.PIN10, fm.fpioa.UART2_RX, force=True)

uart_A = UART(UART.UART1, 115200,8,None,1, timeout=1000, read_buf_len=4096)

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)
sensor.set_hmirror(0)
clock = time.clock()
lcd.init()

def cross_line():
    run = True
    print(len(crossings))
    for b in crossings:
        if run == True:
            if b[2]/b[3] > 1:
                mid = b[0] + (b[2]/2)
                img.draw_line((int(mid), 0, 159, 239), color = (219, 49, 245), thickness = 5)
                run = False


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
            if b[2]/b[3] > 3 or b[2]/b[3] < 0.69:
                #print(b[2]*b[3])
                #if b[2]*b[3] > 300:
                tmp=bw_img.draw_rectangle(b[0:4], color = (255), fill = True)

    #bw_img.mean(1).binary([(0,1)], invert = True)
    crossing2 = bw_img.find_blobs([(120,256)], merge = True, margin = 15)

    lcd.display(bw_img)

    bw_img.clear()

    if crossing2:
        for b in crossing2:
            #print(b[2]*b[3])
            if b[2]*b[3] > 2501:
                crossings.append(b)
                tmp=img.draw_rectangle(b[0:4], color = (255, 136, 0))
            else:
                tmp=img.draw_rectangle(b[0:4], color = (0, 136, 255))
                lines.append(b)
                tmp=bw_img.draw_rectangle(b[0:4], color = (255))

    # cross_line()

    linei = bw_img.get_regression([(100,256) if BINARY_VISIBLE else THRESHOLD],area_threshold=300,robust=True)

    if linei:
        #print(linei)
       img.draw_line(linei.line(), color = (120, 255, 3), thickness = 5)
       img.draw_line((linei[0], 0, 159, 239), color = (219, 49, 245), thickness = 5)
       fault = linei[0] - 159
       uart_A.write(str(fault))
       print(fault)

    #if len(crossings) > 2:
    #    print("4-vägskorsning")
    #    for c in crossings:
    #        if c[2]/c[3] > 1:
    #            pass
    #elif len(crossings) == 1:
    #    print("T-korsning")
    #elif len(lines) > 3:
    #    print("Raksträcka")
    #else:
    #    print("sväng")
    #print(blank.compress_for_ide(), end="")
    #lcd.display(bw_img)
    #print(clock.fps())
