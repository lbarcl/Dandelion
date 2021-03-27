module.exports = search

function search(keyWord, list){
    var flag = 0
    const max = keyWord.length
    const searched = []
    for(var l = 0; l < list.length; l++){
        for(var m = 0; m < max; m++){
            flag = 0
            if(list[l].toLowerCase()[m] != keyWord.toLowerCase()[m]){
                flag = 1
                break
            }
        }
        if(flag == 0){
            searched.push(list[l])
        }
    }
    return searched
}