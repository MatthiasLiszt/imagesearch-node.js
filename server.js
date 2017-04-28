var express = require ('express')
var path = require('path')
var Scraper = require ('images-scraper')
var app=express()
var mongo = require('mongodb').MongoClient
var google=new Scraper.Google()
var yahoo=new Scraper.Yahoo()
var url = process.env.MONGOLAB_URI
var Res

var port = process.env.PORT || 5000

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.listen(process.env.PORT || port, function(err) {

if (err) {return console.log('something bad happened', err)}
console.log('server is listening on '+port)
})

app.get('/:query',function(req,res){
    var query = req.params.query
    var size = req.query.offset || '10'

    size=parseInt(size)
    Res=res    
    doYahoo(query,size)
    
})

app.get('/api/latest/imagesearch',function(req,res){
    Res=res
    dbFind()    
})

app.get('/api/latest/imagesearch/',function(req,res){
    Res=res
    dbFind()    
})

// sorry, but Google does not want to work or cooperate ... 
function doGoogle(query,size){
          google.list({ keyword: 'banana' , num: 10, detail: true, 
                 nightmare: {show: true	}})
   .then(function (res) { console.log('results from google', res) }).
    catch(function(err) {	console.log('err', err) })
}

function doYahoo(query,size){
  yahoo.list({
	keyword: query,
	num: 10,
        }).then(function (res) {
	console.log('results', res)
        Res.send(res)
        dbInsert(query)
        }).catch(function (err) {
	console.log('err',err)
        Res.send(err)
  });
}

function dbInsert(lts){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to', url)
              var dbUrl=db.collection('last')
              var value={"latest": lts }
                            
             
              console.log("value = "+JSON.stringify(value))

              // do some work here with the database.
           
             dbUrl.insert(value,
             function(err, data) {
                 if (err) { throw err }
                  console.log(lts)
                  
                 db.close()
             })
           }  
     }) 
}

function dbFind(){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to', url)
                 var dbUrl=db.collection('last')
                 var list=[]                 

                 dbUrl.find()
                 .toArray(function(err,dat){
                 if(err) throw err 
                 var i=dat.length-1
                 var j=0
                 while((i!=0)&&(j<10))
                  {console.log("found "+dat[i].latest)
                   list.push(dat[i].latest)
                   --i
                   ++j
                  }   
                 list.join()
                 Res.send(list)
                 db.close()
                 })
                } 
   })

}

