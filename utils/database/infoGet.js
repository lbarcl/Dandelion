const videoSearchScheme = require('../../schemes/video-search-scheme');
const videoInfoScheme = require("../../schemes/video-info")
const {urlToInfo} = require("../Video&Song/ytdlThings")
const ytdl = require("ytdl-core")
const mongo = require("./mongo")

module.exports = {mongoCheck, mongoFind}

async function mongoCheck(keyWord){
    let url
    await mongo().then(async mongoose => {
      try{
        let result = await videoSearchScheme.findOne({keyWords: keyWord})
        if (result){
          url = result.videoUrl
  //      console.log('DB')
        } else {
          result = await searcher.search(keyWord, { type: 'video' })
          url = result.first.url
          let id = ytdl.getURLVideoID(url)
          result = await videoSearchScheme.findById(id)
          if (result){
            await videoSearchScheme.findByIdAndUpdate(id, {
              $addToSet: {
                keyWords: keyWord
              }
            })
          } else {
            await new videoSearchScheme({
              _id: id,
              keyWords: keyWord,
              videoUrl: url
            }).save()
          }
  //        console.log('API')
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
      }
    }
    finally {
      mongoose.connection.close()
    }
  })
  return result
}