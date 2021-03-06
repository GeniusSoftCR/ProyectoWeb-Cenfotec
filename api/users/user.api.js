//Dependencies
var express = require('express'),
    mongoose = require('mongoose'),
    bcrypt=require('bcryptjs'),
    ///////////////////////////////
    router = express.Router(),    
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    //////////////////////////////
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),    
    authenticate = expressJwt({secret : 'server secret'}),
    jwtDecode = require('jwt-decode'),
    //////////////////////////////
    states = ['postulate', 'eligible', 'active', 'inactive', 'rejected','banned'],
    roles = ['admin','professor','assistant','student'];

var UsersSchema = new Schema({  
  // _id  :        ObjectId,
  idNum :       {type: String, required: true,minlength:9,maxlength:9},
  name:         {type: String, required: true},
  surname:      {type: String, required: true},
  secondSurname:{type: String, required: true},
  email:        {type: String, required: true, unique: true},
  phone:        {type: String, minlength:8,maxlength:8},
  avatar:       {type: String, required: true},
  password:     {type: String, required: true},
  //onfirmPassword:{type: String, required: true},
  state:        {type: String, required: true, em:states},
  role:         {type: String, required: true, em:roles },
  username:     {type: String},
  //Student only
  birthdate:     {type: Date},
  careers:       {type: String},
  rejectReason:  {type: String, default: undefined},
  resumeUrl:     {type: String},
  githubUrl:     {type: String},
  websiteUrl:    {type: String},
  //Professor only
  specialty:     {type: String},
  councilMember: {type: String},
  //Admin and assitant olny
  jobPosition:   {type: String},  
  timeTrack:[
    { 
      project_id:{ type:ObjectId , required:true},
      date: {
        start:Date,
        end:Date
      },
      task:String,
      time: { 
        mins:Number,
        hours:Number
      }
    }
  ]
}, {collection: 'users'});

UsersSchema.pre('save', function(next) {  
  var user = this;
  //Configuracion previa a salvar (toma en cuenta el objeto enviado)
  if (user) {
    if(!user.avatar){
      user.avatar = "../../imgs/user-profile-default.png";
    }
    user.username = user.email.split('@ucenfotec.ac.cr',1)[0];
  }

  if (!user.isModified('password')) return next();  

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
  });
});

UsersSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', UsersSchema);

//API General
router.put('/user/login', function(req, res, next) {
  var username = req.body.username || '';
  var password = req.body.password || '';

  User.findOne({username: username}, function(err, user) {
    if (err) throw err;
    
    if (user) {
      user.comparePassword(password, function(err, isMatch) {
        if (err) throw err;
        if (!isMatch) {         
          console.log('Attempt failed to login with: ' + user.username);
          res.json({"error":"Contraseña no coincide, intente nuevamente"});
        }else{
          user.password = undefined;
          switch(user.state)
          {
            case "eligible": 
            case "active":
            case "inactive":
              var data =  {};
              data.user = user;
              data.token = jwt.sign({id: user._id}, 'server secret',{ expiresIn: '4h' });

              res.json(data); 
            break;
            
            case "postulate":
              res.json({"error":"Solicitud de registro en revisión","succes":true});
            break;  

            case "banned":
              res.json({"error":"Usuario bloqueado, contacte administrador","succes":true});
            break;

            case "rejected":
              res.json({"error":"Solicitud de registro rechazada","succes":true});
            break;  
          };
        };  
      });
    }else{
      res.json({"error":"Usuario no encontrado, intente de nuevo"});
    }
    // test a matching password   
  });  
});

router.post('/user/track-time', function(req, res, next) {

    var data = req.body;    
    var io = req.io;

    if(data.user.timeTrack === undefined){
      data.user.timeTrack = [];
    }

    if (data.start) {
      // User.findByIdAndUpdate( data.user._id,{$push:{timeTrack:newActivity}}).then(function(data){
      //   res.json(data);
      // }); 
      // io.emit('trackStart', { mg: 'timer', hours:time.hours,mins:time.mins });

    }else{
      console.log(data.time)
      var newActivity = {
        project_id:data.project._id,
        task:data.task,
        time:data.time
      };      

      console.log(data)
      User.findByIdAndUpdate( data.user._id,{$push:{timeTrack:newActivity}}).then(function(data){
        res.json(data);
      }); 
      // User.findByIdAndUpdate( data.user._id,{$push:{timeTrack:newActivity}}).then(function(data){
      //   res.json(data);
      // }); 

      Object.assign(new User(), req.body)
      // io.emit('trackStop', { mg: 'timer', mins:'jajajajj' });
      io.emit('trackUpdate', {});
    }
    res.json({"data":"GO"});
});

// API method -> return ALL users 
//router.get('/users',authenticate, function(req, res, next) { auth
router.get('/users', function(req, res, next) {
  User.find({}, function(err, users){
    res.json(users);
  });
});




// API method -> search user with object as filter -> return all matched users
router.put('/users/search', function(req, res, next) { 
  User.find(req.body, function(err,results) {
    res.json(results);
  });
});

router.put('/user', function(req, res, next) { 
  User.findOne(req.body, function(err,user) {
    res.json(users);
  });
});
//procesar solicitudes de estudiantes
router.put('/user/students/update', function(req, res, next) {
  User.findByIdAndUpdate(req.body._id,{$set:req.body}).then(function(data){
    res.json({success: false, msg: 'Ha ocurrido un error'});
    res.json({success:true,msg:'Se ha actualizado correctamente.'});
  });
});

//registrar usuarios
router.post('/user/add', function(req, res, next) {  

  var user = Object.assign(new User(), req.body)

  switch (user.role){
    case 'student':
      user.birthdate     = req.body.birthdate;
      user.careers       = req.body.careers;
      user.justification = req.body.justification;
      user.resumeUrl     = req.body.resumeUrl;
      user.githubUrl     = req.body.githubUrl;
      user.websiteUrl    = req.body.websiteUrl;
      break;
    case 'professor':
      user.specialty    = req.body.specialty;
      user.councilMember = req.body.councilMember;
      break;
    case 'admin' || 'assistant':
      user.jobPosition = req.body.jobPosition;
      break;
  }
  user.save(function(err){
    if (err) {
      res.json({success: false, message: 'Ha ocurrido un error', error: err});
    } else {
      res.json({success: true, message: 'Solicitud enviada correctamente'});
    }
  });
});

//module router -- we specify this to declare to server
module.exports = router;