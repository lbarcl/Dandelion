function calculateTime(seconds) {
    let s = seconds % 60;
    let flag01 = seconds < 10 || seconds == 0;
    //@ts-ignore
    let m = parseInt(seconds / 60);
    if (m >= 60) {
        let h = m / 60;
        m = m % 60;
        let mstr = m.toString();
        let hstr = h.toString();
        if (1 > (m / 10)) {
            mstr = `0${m}`;
        }
        if (1 > (h / 10)) {
            hstr = `0${h}`;
        }
        return flag01 ? `${hstr}:${mstr}:0${s}` : `${hstr}:${mstr}:${s}`;
    }
    let mstr = m.toString();
    if (1 > (m / 10)) {
        mstr = `0${m}`;
    }
    return flag01 ? `${mstr}:0${s}` : `${mstr}:${s}`;
}

module.exports = calculateTime
