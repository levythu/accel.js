import matplotlib.pyplot as plt
plt.rcdefaults()
import numpy as np
import matplotlib.pyplot as plt


plt.rcdefaults()
fig, ax = plt.subplots()
people = ('Serial', 'Parallel.js', 'Accel-1', 'Accel-2', 'Accel-4')
y_pos = np.arange(len(people))
performance = [32.2568,18.3980,9.67925,5.1116,3.5146]
ax.barh(y_pos, performance, align='center',
        color='green', ecolor='black')
ax.set_yticks(y_pos)
ax.set_yticklabels(people)
ax.invert_yaxis()  # labels read top-to-bottom
ax.set_xlabel('Execution time (s)')
ax.set_title('Mandelbrot')

plt.savefig('mandelbrot.png')
