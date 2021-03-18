const videoInfoScheme = require("../../schemes/video-info")
const {urlToInfo} = require("../Video&Song/ytdlThings")
const ytdl = require("ytdl-core")
const mongo = require("./mongo")
const { YTSearcher } = require('ytsearcher');
const config = require("../../config.json")
const searcher1 = new YTSearcher(config.api.youtube.dataV3.primary);
const searcher2 = new YTSearcher(config.api.youtube.dataV3.third);

module.exports = {mongoCheck, mongoFind}

async function mongoCheck(keyWord){
    let url
    await mongo().then(async mongoose => {
      try{
        let result = await videoInfoScheme.findOne({keyWords: keyWord})
        if (result){
          url = result.videoUrl
        } else {
          result = await searcher1.search(keyWord, { type: 'video' })
          if (!result.first.url){
            result = await searcher2.search(keyWord, { type: 'video' })
          }
          url = result.first.url
          let id = ytdl.getURLVideoID(url)
          result = await videoInfoScheme.findById(id)
          if (result){
            await videoInfoScheme.findByIdAndUpdate(id, {
              $addToSet: {
                keyWords: keyWord
              }
            })
          } else {
            await new videoInfoScheme({
              _id: id,
              keyWords: keyWord,
              videoUrl: url
            }).save()
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