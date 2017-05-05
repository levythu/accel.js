function mandel(c_re, c_im, count)
{
    var z_re = c_re, z_im = c_im;
    var i;
    for (i = 0; i < count; i++) {
        if (z_re * z_re + z_im * z_im > 4.0)
            break;

        var new_re = z_re*z_re - z_im*z_im;
        var new_im = 2.0 * z_re * z_im;
        z_re = c_re + new_re;
        z_im = c_im + new_im;
    }

    return i;
}

function mandel_range(x0, y0, x1, y1,
                      width, height,
                      startRow, totalRow,
                      maxIter, stepSize=1) {
    console.log(startRow, totalRow);

    var dx = (x1 - x0) / width;
    var dy = (y1 - y0) / height;

    var endRow = startRow + totalRow;

    var result=[];
    for (var j = startRow; j < endRow; j+=stepSize) {
        for (var i = 0; i < width; i+=stepSize) {
            var x = x0 + i * dx;
            var y = y0 + j * dy;

            result.push(mandel(x, y, maxIter));
        }
    }

    return result;
}

exports.mandel=mandel;
exports.mandel_range=mandel_range;
