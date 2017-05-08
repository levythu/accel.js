import os
import sys
import time

def test_serial(times):
    os.system('rm thisIsATempFile')
    for i in range(times):
        os.system("node serialize.js >> thisIsATempFile")

def test_parallel(times):
    os.system('rm thisIsATempFile')
    for i in range(times):
        os.system("node parallel.js >> thisIsATempFile")

def test_accel(times):
    os.system('rm thisIsATempFile')
    for i in range(times):
        os.system("acceljs -l 4 para-accel.js >> thisIsATempFile &")
        time.sleep(10)
        os.system("kill -9 $(ps aux | grep node | awk '{print $2}')")

def process_result():
    with open('thisIsATempFile', 'r') as f:
        content = f.readlines()
    os.system('rm thisIsATempFile')
    content = [x.strip() for x in content]
    nums = []
    for i, line in enumerate(content):
        if i % 2 == 0:
            if int(line) != 1664727345:
                print 'incorrect value!'
                sys.exit(1);
        else:
            nums.append(int(line.split(' ')[-2]))
    print sum(nums) / float(len(nums))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print 'Usage: python test.py [s|p|a] [times]'
        sys.exit(1);
    times = int(sys.argv[2])
    if sys.argv[1] == 's':
        test_serial(times)
    elif sys.argv[1] == 'p':
        test_parallel(times)
    else:
        test_accel(times)
    process_result()
