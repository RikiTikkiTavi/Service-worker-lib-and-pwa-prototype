const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ROUTES */
/* payment */
const api = require('./routes/api');

app.use('/api', api);
app.use(express.static(__dirname + '/content'));

/*app.get('/!*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});*/

app.listen(8080, () => console.log('Listening on port 8080!'));