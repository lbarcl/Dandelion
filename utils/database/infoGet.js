const videoInfoScheme = require("../../schemes/video-info")
const {urlToInfo} = require("../Video&Song/ytdlThings")
const search = require("../algorithm/search")
const ytdl = require("ytdl-core")
const mongo = require("./mongo")
const { YTSearcher } = require('ytsearcher');
const config = require("../../config.json")
const searchers = []
for (var i = 0; i < config.api.youtube.dataV3.length; i++){
  searchers.push(new YTSearcher(config.api.youtube.dataV3[i]))
}

module.exports = {mongoCheck, mongoFind}

async function mongoCheck(keyWord){
    let url
    await mongo().then(async mongoose => {
      try{
        let result = await videoInfoScheme.findOne({keyWords: keyWord})

        if (result){
          url = result.url
        }else {

          result = await videoInfoScheme.find({})
          const titles = []
          for (let t = 0; t < result.length; t++) {
            titles.push(result[t].title)
          }
          result = search(keyWord, titles)
          if(result && result.toString().toLowerCase().includes(keyWord.toString().toLowerCase())){
            result = await videoInfoScheme.findOne({title: result})
            url = result.url
          }
          else {

            for (var i = 0; i < searchers.length; i++){
              result = await searchers[i].search(keyWord, { type: 'video' })
              if (result) break
            }
            
            if (!result) return
            url = result.first.url
            let id = ytdl.getURLVideoID(url)
            result = await videoInfoScheme.findById(id)
            if (result) await videoInfoScheme.findByIdAndUpdate(id, {$addToSet: {keyWords: keyWord}})
            else {
              
              result = await urlToInfo(url)
              await videoInfoScheme({
                _id: id,
                url: result.url,
                title: result.title,
                time: result.time,
                image: result.image
              }).save()
              
              await videoInfoScheme.findByIdAndUpdate(id, {
                $addToSet: {
                  keyWords: result.title
                }
              })
              await videoInfoScheme.findByIdAndUpdate(id, {
                $addToSet: {
                  keyWords: keyWord
                }
              })
              
            }

            url = result.url
          }
        }
      }
      finally {
        mongoose.connection.close()
      }
    })
    return url
}

async function mongoFind(url){
  let result
  await mongo().then(async mongoose => {
    try{
      let id = ytdl.getURLVideoID(url)  
      result = await videoInfoScheme.findById(id)
      if (!result){
        result = await urlToInfo(url)
        await videoInfoScheme({
            _id: id,
            url: result.url,
            title: result.title,
            time: result.time,
            image: result.image
        }).save()

        await videoInfoScheme.findByIdAndUpdate(id, {
          $addToSet: {
            keyWords: result.title
          }
        })
      }
    }
    finally {
      mongoose.connection.close()
    }
  })
  return result
}