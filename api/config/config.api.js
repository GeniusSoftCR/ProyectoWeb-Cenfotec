var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	//////////////////////////////
	Schema = mongoose.Schema,
	//////////////////////////////
	degree = ['Técnico', 'Diplomado', 'Bachillerato', 'Licenciatura', 'Maestría'];

var configSchema = new Schema({
	code :   {type: String, required: true, unique: true},
	name :   {type: String, required: true},
	degree : {type: String, required: true}
	}, {collection : 'careers'});

var Career = mongoose.model('Careers', configSchema);

//Lleva la lista de carreras
router.get('/config/getCareers', function(req, res, next){
	Career.find({}, function(err, career){
		res.json(career);
	});
});

//Elimina la carrera
router.put('/config/deleteCareer', function(req,res,next){
	Career.remove(req.body, function(err){
		res.json(req.body);
	});
});

//Registar Carrera
router.post('/config/addCareer', function(req, res, next){
	var career = Object.assign(new Career(),req.body);
	console.log(career);
	career.save(function(err){
		if(err){
			res.json({success: false, massage: 'Ha ocurrido un error'});
		}else{
			res.json({success : true, massage: 'Se ha registrado la carrera correctamente'});
		}
	});
});

module.exports = router;