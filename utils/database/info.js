const videoInfoScheme = require("../../schemes/video-info")
const {urlToInfo} = require("../Video&Song/ytdlThings")
const search = require("../Algorithm/search")
const ytdl = require("ytdl-core")
const mongo = require("./connect")
const { YTSearcher } = require('ytsearcher');
const config = require("../../config.json")
const searchers = []
for (var i = 0; i < config.api.youtube.dataV3.length; i++){
  searchers.push(new YTSearcher(config.api.youtube.dataV3[i]))
}

module.exports = {videoFind, videoInfoFind}

async function videoFind(keyWord){
  var url
  await mongo().then(async mongoose => {
    info: try{
      var list = await videoInfoScheme.find({})
      // Search with db keywords
      let keyWords = []
      for (let i = 0; i < list.length; i++){
        if (list[i].keyWords.length < 1) continue
        keyWords = keyWords.concat(list[i].keyWords.splice(0, 1))
      }
      var basicSearchResult = search.basicSearch(keyWord, keyWords)
      if (basicSearchResult[0] != undefined) {
        let result = await videoInfoScheme.findOne({keyWords: basicSearchResult[0]})
        url = result?.url
        break info
      }
      // Search with db titles | Bu yere gelene kadar sadece 1 await
      let titles = []
      for (let i = 0; i < list.length; i++){
        titles.push(list[i].title)
      }
      var distanceSearchResult = search.distanceSearch(titles, keyWord, list)
      if (distanceSearchResult && distanceSearchResult.title.toLowerCase().includes(keyWord.toLowerCase())){
        await videoInfoScheme.findByIdAndUpdate(distanceSearchResult._id, {$addToSet: {keyWords: keyWord}})
        url = distanceSearchResult?.url
        break info
      }
      // Search with youtube API | Bu yere gelene kadar sadece 1 await
      var apiSearchResult
      for (var i = 0; i < searchers.length; i++){
        apiSearchResult = await searchers[i].search(keyWord, { type: 'video' })
        if (apiSearchResult) break
      }
      url = apiSearchResult.first.url
      // Checking for same ID on db | Bu yere gelene kadar sonuç bulunana kadar await
      let id = ytdl.getURLVideoID(url)
      let ids = []
      for (let i = 0; i < list.length; i++){
        ids.push(list[i]._id)
      }
      var idSearchResult = search.distanceSearch(ids, id)
      if (idSearchResult == id){
        await videoInfoScheme.findByIdAndUpdate(id, {$addToSet: {keyWords: keyWord}})
      }
    }
    finally {
      mongoose.connection.close()
    }
  })

  return url
}

async function videoInfoFind(url){
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
            image: result.image,
        }).save()
      }
      await videoInfoScheme.findByIdAndUpdate(id, {$inc: {requestCounter: 1}, $set: {lastTime: Date.now()}})
    }
    finally {
      mongoose.connection.close()
    }
  })
  return result
}
