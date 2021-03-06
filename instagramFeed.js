var https = require('https');
var instagramCredentials = require('../instagramCredentials.js');
            
function getPosts(callback,pagination){

  var handleResponse = function(response) {
    var instagramResponse = '';
    response.on('data', function (chunk) { instagramResponse += chunk; });
    response.on('end', function () { 
      var instagramObject = JSON.parse(instagramResponse)
      callback(instagramObject); 
    });
  }

  https.request({ host: 'api.instagram.com',  path: '/v1/users/self/media/recent/?access_token=' + instagramCredentials.ACCESS_TOKEN + (pagination ? '&max_id=' + pagination : "")}, handleResponse).end();
}

function getNumberOfPosts(qty,callback){
  
  var posts = [];
  
  function tally(instagramObject){
    
    if(!instagramObject){
      getPosts(tally);
    }else{
      Array.prototype.push.apply(posts, instagramObject.data);
    
      if(typeof instagramObject.pagination.next_max_id == "undefined"){
        callback(posts);
        return;
      }
      
      if(posts.length < qty){
        getPosts(tally,instagramObject.pagination.next_max_id);
      }else{
        callback(posts.slice(0, qty));
      }
    }
    
  }
  tally();
  
}
module.exports = {
  
getQty: getNumberOfPosts,

get: function(callback){getPosts(function(instagramObject){callback(instagramObject.data)})}

}