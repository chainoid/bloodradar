//SPDX-License-Identifier: Apache-2.0

var radar = require('./controller.js');

module.exports = function(app){

  // Common usage
  app.get('/bpack_history/:bpackId', function(req, res){
    radar.bpack_history(req, res);
  });
  app.get('/delete_bpack/:bpackId', function(req, res){
    radar.delete_bpack(req, res);
  });
  app.get('/get_donor_activity/:donorId', function(req, res){
    radar.get_donor_activity(req, res);
  });

  //  Admin page
  app.get('/add_donor/:donor', function(req, res){
    radar.add_donor(req, res);
  });
  app.get('/update_donor/:donor', function(req, res){
    radar.update_donor(req, res);
  });
  app.get('/get_donors_by_btype/:btype', function(req, res){
    radar.get_donors_by_btype(req, res);
  });


  // Donor page
  app.get('/get_donor_by_id/:donorId', function(req, res){
    radar.get_donor_by_id(req, res);
  });

  app.get('/donor_history/:donorKey', function(req, res){
    radar.donor_history(req, res);
  });

  

  // Blood Camp Page
  app.get('/add_donation/:donation', function(req, res){
    radar.add_donation(req, res);
  });

  //  Blood bank page
  app.get('/change_bpack_status/:params', function(req, res){
    radar.change_bpack_status(req, res);
  });
 

  // Hospital
  app.get('/query_bpack_by_btype/:queryParams', function(req, res){
     radar.query_bpack_by_btype(req, res);
  });
  app.get('/get_bpack_by_id/:bpackId', function(req, res){
    radar.get_bpack_by_id(req, res);
  });
  app.get('/do_transfuse/:bpackId', function(req, res){
    radar.do_transfuse(req, res);
  });
   
}
