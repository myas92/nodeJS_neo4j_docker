const bodyParser = require("body-parser");
const morgan = require('morgan');
const express = require('express');
const cors = require('cors')
const router = require('./router/user.router');
let initDatabase = require("./config/db");
initDatabase.configurationNeo4j()
const app = express();


app.use(cors())
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: 10000 }));


app.use("/api", router);

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).send({
        message: err.message
    })
})

app.listen(3000, () => {
    console.log("Server listening on 3000")
}
)