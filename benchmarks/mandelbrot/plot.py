import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots()
people = ('Serial', 'Parallel.js', 'Accel-1', 'Accel-2', 'Accel-4')
y_pos = np.arange(len(people))
overhead = [32.2568, 19.449, 9.644 ,5.057 ,3.5146]
compute = [32.2568, 9.721, 9.37325, 4.67075, 2.3064]
for i in range(len(overhead)):
    overhead[i] -= compute[i]
ax.bar(y_pos, compute, align='center', color='green', ecolor='black', label='compute')
ax.bar(y_pos, overhead, align='center', color='red', ecolor='black', bottom=compute, label='overhead')
ax.set_xticks(y_pos)
ax.set_xticklabels(people)
ax.set_ylabel('Execution time (s)')
ax.set_title('Mandelbrot')
legend = ax.legend(loc='upper right', shadow=True)
plt.savefig('mandelbrot.png')
