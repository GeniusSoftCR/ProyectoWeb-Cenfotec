(function(){
  'use strict'; 
  angular
  .module('cshApp')
  .service('ImageService', ImageService);
  
  function ImageService($http){

    var cloudObj = {
      url:'https://api.cloudinary.com/v1_1/genius-soft/image/upload',
      data:{
        upload_preset: 'awo2hbct',
        tags:'Any',
        context:'photo=test'
      }
    };

    var public_api = {
      getConfiguration:getConfiguration
    };
    return public_api;

    function getConfiguration(){
      return cloudObj;
    }
  }
})();
