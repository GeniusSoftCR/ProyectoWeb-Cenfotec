(function(){
  /* Controlador de Request de proyecto de Cenfotec Software House */
  'use strict';
  angular.module('cshApp')
    .controller('cshReqController', cshReqCtrlFn);

    function cshReqCtrlFn ($scope, ImageService, filepickerService, $window,Upload) {
      var cshReqCtrl = this;
      cshReqCtrl.cloudObj = ImageService.getConfiguration();

      //Files
      cshReqCtrl.pickFile = pickFile;
      cshReqCtrl.onSuccess = onSuccess;

      function pickFile(){
          filepickerService.pick(
              {extension: '.pdf',
              language: 'es',
              container: 'modal',
              services: ['COMPUTER']
              },
              onSuccess
          );
      };

      function onSuccess(Blob){
        // cshReqCtrl.files.push(Blob);
        cshReqCtrl.projectFile = Blob.url;
        // $window.localStorage.setItem('files', JSON.stringify(cshReqCtrl.files));
      };

      cshReqCtrl.preSave = function(){
        cshReqCtrl.cloudObj.data.file = document.getElementById("imageProjectRequest").files[0];
        Upload.upload(cshReqCtrl.cloudObj)
          .success(function(data){
            cshReqCtrl.save(data.url);
          });
      }

      cshReqCtrl.save= function(pimage){
        console.log();
        var newProjectRequest ={
          company : cshReqCtrl.clientData.company,
          idnumber : cshReqCtrl.clientData.identificationNumber,
          clientName : cshReqCtrl.clientData.clientName,
          clientMail : cshReqCtrl.clientData.clientMail,
          funds : cshReqCtrl.clientData.fundsToMakeProject,
          images : cshReqCtrl.clientData.projectImages,
          status : 'En Revisión',
          projectFile : cshReqCtrl.projectFile,
          image: pimage
        }

        movieService.addMovie(newMovie);

        cshReqCtrl.clientData.company = null;
        cshReqCtrl.clientData.identificationNumber = null;
        cshReqCtrl.clientData.clientName = null;
        cshReqCtrl.clientData.clientMail = null;
        cshReqCtrl.clientData.fundsToMakeProject = null;
        cshReqCtrl.clientData.projectImages = null;
      }
      console.log('Inside Ctrl Cenfotec Software House Controller');
    }
})();