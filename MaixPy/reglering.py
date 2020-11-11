# Untitled - By: s8kevkla - Tue Jan 7 2020
import sensor, image, time, lcd
from fpioa_manager import fm
from machine import UART
from board import board_info



fm.register(board_info.PIN15, fm.fpioa.UART1_TX, force = True) # Sets pin15 as new TX-pin
# fm.register(board_info.PIN17, fm.fpioa.UART1_RX, force=True)
# fm.register(board_info.PIN9, fm.fpioa.UART2_TX, force=True)
# fm.register(board_info.PIN10, fm.fpioa.UART2_RX, force=True)

uart_A = UART(UART.UART1, 115200, 8, None, 1, timeout = 1000, read_buf_len = 4096)

THRESHOLD = (0, 150)

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000) # Time for camera to initialize and stabilize
sensor.set_hmirror(0) # Mirrors image
clock = time.clock()
lcd.init()

Found_centerline = False
Found_crossing = False
centerlines = 4
crossingsFound = 0
offCenterCrossing = False

while(True):
    lines = []
    crossings = []
    clock.tick()
    img = sensor.snapshot() # Original picture, in color
    bw_img = img.copy().to_grayscale()
    bw_img.binary([THRESHOLD],invert = True) # Convert img to binary, black and white
    blobs = bw_img.find_blobs([(120, 256)]) # Find white spots
    middle_line = bw_img.find_blobs([(120, 256)], roi = (120, 238, 80, 2)) # Used to count tiles

    if Found_centerline == True:
        tmp=img.draw_rectangle((0, 0, 10, 10), color = (0, 213, 140), fill = True)
    else:
        tmp=img.draw_rectangle((0, 0, 10, 10), color = (213, 140, 0), fill = True)

    if Found_crossing == True:
        tmp=img.draw_rectangle((310, 0, 10, 10), color = (0, 255, 0), fill = True)
    else:
        tmp=img.draw_rectangle((310, 0, 10, 10), color = (255, 136, 0), fill = True)

    if offCenterCrossing == True:
        tmp=img.draw_rectangle((0, 230, 10, 10), color = (0, 110, 255), fill = True)



    #print("centerlines found: " + str(centerlines))
    #print("crossings found: " + str(crossingsFound))

    lcd.display(bw_img)
    bw_img.clear()

    if blobs: # If blobs are found:
        for b in blobs:
            if b[2]/b[3] > 3 or b[2]/b[3] < 0.69: # If blob is rectangular
                tmp = bw_img.draw_rectangle(b[0:4], color = (255), fill = False)
            elif b.rotation() < 70 or b.rotation() > 110: # If blob is rotated
                if b.area() > 1000:
                    tmp = bw_img.draw_rectangle(b[0:4], color = (255), fill = False)

    merged_blobs = bw_img.find_blobs([(120, 256)], merge = True, margin = 17) # Merge blobs

    bw_img.clear()

    if merged_blobs:
        for b in merged_blobs:
            if b.area() > 2000 and b.count() > 2: # If blob is big enough and consists of 3 or more small blobs
                crossings.append(b)
                offCenterCrossing = True
                tmp=img.draw_rectangle(b[0:4], color = (255, 136, 0))
            elif b.area() > 150: # Ignores the smallest blobs to avoid errors
                lines.append(b)
                tmp=img.draw_rectangle(b[0:4], color = (0, 136, 255))
                tmp=bw_img.draw_rectangle(b[0:4], color = (255))



    center_line = bw_img.get_regression([(100, 256)], roi = (106, 0, 106, 240), area_threshold = 300, robust = True) # Looks in middle of screen for center-line
    checking_line = bw_img.get_regression([(100, 256)], area_threshold = 300, robust = True) # Does a regression on the entire screen, used in identification

    if center_line:
       img.draw_line(center_line.line(), color = (120, 255, 3), thickness = 5)
       img.draw_line((center_line[0], 0, 159, 239), color = (219, 49, 245), thickness = 5) # Draws line from bottom center and top, x on top is based on center-line
       img.draw_line(checking_line.line(), color = (255, 255, 0), thickness = 5)
       fault = center_line[0] - 159 # Fault is based on how far the center line is from center of the sreen
       #uart_A.write(str(fault))
       #print("UART:", fault)

    def FindRoad():
      if len(crossings) > 1:
          uart_A.write("k")
          print("4-vägskorsning")
      elif len(crossings) == 1:
          if crossings[0][5] < 106:
              uart_A.write("g")
              print("T-korsning <--")
          elif crossings[0][5] > 212:
              uart_A.write("i")
              print("T-korsning -->")
          elif crossings[0][6] < 80:
              uart_A.write("h")
              print("T-korsning ^")
          elif crossings[0][6] > 160:
              uart_A.write("j")
              print("T-korsning v")
          else:
              print("whack")
      elif len(lines) > 2: # If enough line-blobs are found:
          if checking_line.theta() > 20 and checking_line.theta() < 70: # Checks angle of checking line
              if checking_line[1] > 200 or checking_line[3] > 200: # Checks if line is found on bottom of screen
                  uart_A.write("d")
                  print("Sväng ^>")
              else:
                  uart_A.write("f")
                  print("Sväng <v")
          elif checking_line.theta() > 110 and checking_line.theta() < 160:
              if checking_line[1] > 200 or checking_line[3] > 200:
                  uart_A.write("c")
                  print("Sväng <^")
              else:
                  uart_A.write("e")
                  print("Sväng v>")
          elif checking_line.theta() > 45 and checking_line.theta() < 135:
              uart_A.write("b")
              print("Raksträcka ---")
          else:
              uart_A.write("a")
              print("Raksträcka |")
      else:
          print("Nuthin'")

    print("yeet")
    if middle_line:
        print("skeet")
        if len(middle_line) > 1: # If multiple lines are found, which means there is a crossing
            #print("found overwalking mannen")
            if Found_crossing == False:
                Found_crossing = True
                crossingsFound = crossingsFound + 1
                if crossingsFound > 1:
                    tmp=img.draw_rectangle((310, 0, 10, 10), color = (255, 255, 255), fill = True)
                    crossingsFound = 0
                    centerlines = 0

        else: # If only one centerline is found
            #print("found center line, very epic")
            if Found_centerline == False:
                Found_centerline = True
                centerlines = centerlines + 1
                if centerlines >= 4:
                    FindRoad()
                    print("RoadFind")
                    uart_A.write("d")
                    if offCenterCrossing == True:
                        tmp=img.draw_rectangle((0, 230, 10, 10), color = (213, 0, 145), fill = True)
                        offCenterCrossing = False
                    else:
                        tmp=img.draw_rectangle((0, 230, 10, 10), color = (255, 255, 255), fill = True)
                    centerlines = 0
                    crossingsfound = 0

    else:
        #print("No center line, big sad ;-;")
        Found_crossing = False
        Found_centerline = False
