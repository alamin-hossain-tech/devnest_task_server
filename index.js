const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mongodb connect by mongoose
const uri = `mongodb+srv://alamin_hossain:KSwpZnHg9CNzCQWU@cluster0.rfyyfuu.mongodb.net/emaJohn?retryWrites=true&w=majority`;
mongoose
  .connect(uri)
  .then(() => console.log("db connected"))
  .catch(() => console.log("error not connected"));
// mongodb connect by mongoose end

// Mongoose Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  seller: String,
  ratings: Number,
  stock: Number,
  img: String,
});

// Mongoose Model
const Product = mongoose.model("products", productSchema);

async function run() {
  try {
    // create a procut api
    app.post("/products", async (req, res) => {
      const product = req.body;
      const newProduct = new Product(product);
      const productData = await newProduct.save();
      res.send(productData);
    });

    // get all products api
    app.get("/products", async (req, res) => {
      const page = +req.query.page;
      const cursor = Product.find();
      const products = await cursor
        .skip(page * 5)
        .limit(5)
        .sort({ _id: -1 });
      const count = await Product.estimatedDocumentCount();
      res.send({ products, count });
    });

    // get product by id api
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: id,
      };

      const cursor = await Product.findOne(query);

      res.send(cursor);
    });

    // edit product by id api
    app.put("/edit/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: id };
      const product = req.body;
      const option = { new: true };
      const updatedProduct = {
        $set: {
          name: product.name,
          category: product.category,
          seller: product.seller,
          price: product.price,
          ratings: product.ratings,
          stock: product.stock,
          img: product.img,
        },
      };
      const result = await Product.updateOne(filter, updatedProduct, option);
      res.send(result);
    });

    // delete product api
    app.post("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await Product.deleteOne(query);
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
}
run().catch((err) => console.log(err));
// ------------------
app.get("/", (req, res) => {
  res.send(`Server Running on port:${port} `);
});

app.listen(port, () => {
  console.log("server running port:", port);
});
