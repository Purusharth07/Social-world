var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = new ItemSchema(
  { img: 
      { data: Buffer, contentType: String }
  }
);
var Item = mongoose.model('Clothes',ItemSchema);
