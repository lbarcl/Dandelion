function calculateTime(seconds) {
  let minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  
  let hour = Math.floor(minute / 60);
  minute = minute % 60;
  
  let sstr = (seconds < 10) ? `0${seconds}` : seconds;
  let mstr = (minute < 10) ? `0${minute}` : minute;
  let hstr = (hour < 10) ? `0${hour}` : hour;
  
  return (hour != 0) ? `${hstr}:${mstr}:${sstr}`: `${mstr}:${sstr}`;
}

module.exports = calculateTime
