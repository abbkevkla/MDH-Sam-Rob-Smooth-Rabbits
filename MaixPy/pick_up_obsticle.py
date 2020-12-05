import sensor
import image
import lcd
import time
from fpioa_manager import fm
from machine import UART
from board import board_info
lcd.init()
sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_hmirror(0) # Mirrors image
sensor.run(1)

fm.register(board_info.PIN15, fm.fpioa.UART1_TX, force = True) # Sets pin15 as new TX-pin
# fm.register(board_info.PIN17, fm.fpioa.UART1_RX, force=True)
# fm.register(board_info.PIN9, fm.fpioa.UART2_TX, force=True)
# fm.register(board_info.PIN10, fm.fpioa.UART2_RX, force=True)

uart_A = UART(UART.UART1, 115200, 8, None, 1, timeout = 1000, read_buf_len = 4096)

green_threshold   = (100, 0, -16, -128, 5, 15)

while True:
    img=sensor.snapshot()
    greenblobs = img.find_blobs([green_threshold], area_threshold=40, merge=True, margin=10)
    if greenblobs:
        for b in greenblobs:
            tmp=img.draw_rectangle(b[0:4], color=(0, 180, 55))
            if b[1] + b[3] >= 230:
                print("green")
                uart_A.write("n")
                uart_A.write("n")
                uart_A.write("n")
    lcd.display(img)
