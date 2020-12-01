// index.js 
var express = require("express");
var cors = require("cors"); 
const bodyParser = require("body-parser");
var app = express(); 
app.use(cors());

const port = 5000;

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");  
const swaggerDef = require("./swagger.json");

const swaggerOptions = {
  swaggerDefinition: swaggerDef, 
  apis: ["index.js","approuter.js"]
};

//set static folder for image
app.use(express.static(`${__dirname}/uploads`))

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// set use body json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// add route
const newsRoute = require('./routes/news');
app.use('/api/news', newsRoute);

const placeRoute = require('./routes/place');
app.use('/api/place', placeRoute);

const placeGroupRoute = require('./routes/placeGroup');
app.use('/api/placeGroup', placeGroupRoute);

const zoneRoute = require('./routes/zone');
app.use('/api/zone', zoneRoute); 

const reserveRoute = require('./routes/reserve');
app.use('/api/reserve', reserveRoute);

const authenRoute = require('./routes/authen');
app.use('/api/authen', authenRoute);

// set port & run server
app.listen(port, () => console.log(`Candle app listening on port ${port}!`));

