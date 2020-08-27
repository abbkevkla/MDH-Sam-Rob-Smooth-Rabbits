# Untitled - By: s8kevkla - Tue Jan 7 2020
import sensor, image, time, lcd
from fpioa_manager import fm
from machine import UART
from board import board_info

fm.register(board_info.PIN15, fm.fpioa.UART1_TX, force=True) # Sets pin15 as new TX-pin
# fm.register(board_info.PIN17, fm.fpioa.UART1_RX, force=True)
# fm.register(board_info.PIN9, fm.fpioa.UART2_TX, force=True)
# fm.register(board_info.PIN10, fm.fpioa.UART2_RX, force=True)

uart_A = UART(UART.UART1, 115200,8,None,1, timeout=1000, read_buf_len=4096)

THRESHOLD = (0,230)

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
    bw_img = img.copy().to_grayscale()
    bw_img.binary([THRESHOLD],invert=True)
    lcd.display(bw_img)
    blobs = bw_img.find_blobs([(120,256)])
    bw_img.clear()

    if blobs:
        #print(blobs)
        for b in blobs:
            #print(b[2]*b[3])
            if b[2]/b[3] > 3 or b[2]/b[3] < 0.69:
                tmp = bw_img.draw_rectangle(b[0:4], color = (255), fill = False)
            elif b[7] < 70 or b[7] > 110:
                if b[2]*b[3] > 1000:
                    tmp = bw_img.draw_rectangle(b[0:4], color = (255), fill = False)

    merged_blobs = bw_img.find_blobs([(120,256)], merge = True, margin = 15)

    bw_img.clear()

    if merged_blobs:
        for b in merged_blobs:
            if b.area() > 2000 and b.count() > 2:
                crossings.append(b)
                tmp=img.draw_rectangle(b[0:4], color = (255, 136, 0))
                #tmp=bw_img.draw_rectangle(b[0:4], color = (255), thickness = 5)
            elif b.area() > 150:
                tmp=img.draw_rectangle(b[0:4], color = (0, 136, 255))
                lines.append(b)
                tmp=bw_img.draw_rectangle(b[0:4], color = (255))



    center_line = bw_img.get_regression([(100,256)], roi = (106, 0, 106, 240), area_threshold=300, robust = True)
    checking_line = bw_img.get_regression([(100,256)], area_threshold=300, robust = True)

    if center_line:
        #print(center_line)
       img.draw_line(center_line.line(), color = (120, 255, 3), thickness = 5)
       img.draw_line((center_line[0], 0, 159, 239), color = (219, 49, 245), thickness = 5)
       img.draw_line(checking_line.line(), color = (255, 255, 0), thickness = 5)
       fault = center_line[0] - 159
       uart_A.write(str(fault))
       print(checking_line.theta())
       #print(fault)


    if len(crossings) > 1:
        print("4-vägskorsning")
    elif len(crossings) == 1:
        if crossings[0][5] < 106:
            print("T-korsning <--")
        elif crossings[0][5] > 212:
            print("T-korsning -->")
        elif crossings[0][6] < 80:
            print("T-korsning ^")
        elif crossings[0][6] > 160:
            print("T-korsning v")
        else:
            print("whack")
    elif len(lines) > 2:
        if checking_line.theta() > 20 and checking_line.theta() < 70:
            if checking_line[1] > 200 or checking_line[3] > 200:
                print("Sväng ^>")
            else:
                print("Sväng <v")
        elif checking_line.theta() > 110 and checking_line.theta() < 160:
            if checking_line[1] > 200 or checking_line[3] > 200:
                print("Sväng <^")
            else:
                print("Sväng v>")
        elif checking_line.theta() > 45 and checking_line.theta() < 135:
            print("Raksträcka ---")
        else:
            print("Raksträcka |")
    else:
        print("Nuthin'")
    #print(clock.fps())
