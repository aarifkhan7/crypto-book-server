var express = require("express");
var app = express();

// port settings
const port = process.env.PORT || 5000

app.get('/', (req, res)=>{
    res.send('Foo Bar');
});

app.listen(port, async () => {
    console.log("Server running on port " + port);
});

module.exports = app;
