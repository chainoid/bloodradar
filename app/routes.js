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


  // Hospital
  app.get('/query_bpack_by_btype/:queryParams', function(req, res){
     radar.query_bpack_by_btype(req, res);
  });


  app.get('/get_parsel/:id', function(req, res){
    radar.get_parsel(req, res);
  });
  app.get('/add_parsel/:parsel', function(req, res){
    radar.add_parsel(req, res);
  });
  app.get('/get_all_parsels', function(req, res){
    radar.get_all_parsels(req, res);
  });
  app.get('/delivery_parsel/:delivery', function(req, res){
    radar.delivery_parsel(req, res);
  });
  
  
  app.get('/get_clients_by_range/:range', function(req, res){
    radar.get_clients_by_range(req, res);
  });
  app.get('/donor_history/:donorKey', function(req, res){
    radar.donor_history(req, res);
  });
 
  app.get('/create_parsel_order/:order', function(req, res){
    radar.create_parsel_order(req, res);
  });
  app.get('/accept_parsel/:accept', function(req, res){
    radar.accept_parsel(req, res);
  });
  app.get('/switch_courier/:switch', function(req, res){
    radar.switch_courier(req, res);
  });
   
}
