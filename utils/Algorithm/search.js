module.exports = search

function search(arr, inputvalue) {
    let closestOne = "";
    let floorDistance = 0.1;
  
    for (let i = 0; i < arr.length; i++) {
      let dist = distance(arr[i], inputvalue);
      if (dist > floorDistance) {
          floorDistance = dist;
        closestOne = arr[i];
      }
    }
  
    return closestOne;
  }
  
  function distance(val1, val2) {
    let longer, shorter, longerlth, result;
  
    if (val1.length > val2.length) {
      longer = val1;
      shorter = val2;
    } else {
      longer = val2;
      shorter = val1;
    }
  
    longerlth = longer.length;
  
    result = ((longerlth - editDistance(longer, shorter)) / parseFloat(longerlth));
  
    return result;
  }
  
  function editDistance(val1, val2) {
    val1 = val1.toString().toLowerCase();
    val2 = val2.toString().toLowerCase();
  
    let costs = [];
  
    for(let i = 0; i <= val1.length; i++) {
      let lastVal = i;
      for(let j = 0; j <= val2.length; j++) {
          if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newVal = costs[j - 1];
          if (val1.charAt(i - 1) !== val2.charAt(j - 1)) {
            newVal = Math.min(Math.min(newVal, lastVal), costs[j]) + 1;
          }
          costs[j - 1] = lastVal;
          lastVal = newVal;
        }
      }
      if (i > 0) { costs[val2.length] = lastVal }
    }
  
    return costs[val2.length];
  }