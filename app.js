const Express = require("express");
const Mongoose = require("mongoose");
const BodyParser = require("body-parser");

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

Mongoose.connect("mongodb://localhost/haushalt");

const BillModel = Mongoose.model("bill",{
    date:Date,
    amount:Number,
    person:String,
    category:String
});

const PersonModel = Mongoose.model("person",{
    name:String
});

const CategoryModel = Mongoose.model("category",{
    category:String
});

app.post("/bill", async (request, response) => {
    try {
        var bill = new BillModel(request.body);
        var result = await bill.save();
        response.send(result);
    }catch(error) {
        response.status(500).send(error);
    }
});

app.get("/bill/:id", async (request, response) => {
    try {
        var bill = await BillModel.findById(request.params.id).exec();
        response.send(bill);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/bill/:id", async (request, response) => {
    try {
        var bill = await BillModel.findById(request.params.id).exec();
        bill.set(request.body);
        var result = await bill.save();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/bill/:id", async (request, response) => {
    try {
        var result = await BillModel.deleteOne({ _id: request.params.id }).exec();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});


app.get("/bills", async (request, response) => {
    try {
        var result = await BillModel.find().lean().exec();
        response.send(result);
    }catch(error) {
        response.status(500).send(error);
    }
});

/*
app.post("/person", async (request, response) => {

});
app.get("/person/:id", async (request, response) => {

});
app.put("/person/:id", async (request, response) => {

});
app.delete("/person/:id", async (request, response) => {

});


app.post("/category", async (request, response) => {

});
app.get("/category/:id", async (request, response) => {

});
app.put("/category/:id", async (request, response) => {

});
app.delete("/category/:id", async (request, response) => {

});

*/
app.listen(3000, () => {
    console.log("Listening at :3000...");
});