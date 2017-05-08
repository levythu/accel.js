import matplotlib.pyplot as plt
plt.rcdefaults()
import numpy as np
import matplotlib.pyplot as plt


plt.rcdefaults()
fig, ax = plt.subplots()
people = ('Serial', 'Parallel.js', 'Accel-1', 'Accel-2', 'Accel-4')
y_pos = np.arange(len(people))
performance = [5,4,3,2,1]
ax.barh(y_pos, performance, align='center',
        color='green', ecolor='black')
ax.set_yticks(y_pos)
ax.set_yticklabels(people)
ax.invert_yaxis()  # labels read top-to-bottom
ax.set_xlabel('Execution time (ms)')
ax.set_title('Mandelbrot')

plt.savefig('mandelbrot.png')
