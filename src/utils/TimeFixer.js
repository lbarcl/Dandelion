function calculateTime(seconds) {
    var time;
    var m = parseInt(seconds / 60)
    var s = parseInt(seconds % 60)
    if (m > 60) {
        var h = parseInt(m / 60)
        m = parseInt(m % 60)

        if (1 > (m / 10)) {
            m = `0${m}`
        }
        if (1 > (h / 10)) {
            h = `0${h}`
        }
        time = `${h}:${m}:${s}`
    }
    else {
        if (1 > (m / 10)) {
            m = `0${m}`
        }
        time = `${m}:${s}`
    }
    return time
}

module.exports = calculateTime