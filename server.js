const express = require('express')  //? הגדרות השרת
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const PORT = 3000

app.use(express.static('client'))
app.use(express.json())

mongoose.connect('mongodb+srv://meir595630:2UaQu56EW1NIDplH@cluster0.r6speoz.mongodb.net/')
.then(()=>{ console.log('Db is connected.') })

const user = new mongoose.Schema({  //? סכימת המשתמש
    fullName:String,
    phoneNumber:String,
    email:String,
    password:String,
})

const product = new mongoose.Schema({  //? סכימת המוצר
    image:String,
    price:Number,
    productName:String,
})

const order = new mongoose.Schema({    //? סכימת ההזמנה
    userOrder :Array,
    products:Array,
})

const User = mongoose.model('User',user)

const Product = mongoose.model('Product',product)

const Order = mongoose.model('Order',order)



app.get("/",(req,res)=>{                                                 //? הגדרת הנתיבים האתר
    res.sendFile(path.join(__dirname , 'client/html', 'signIn.html'))    //* עמוד התחברות
})

app.get("/signUp",(req,res)=>{
    res.sendFile(path.join(__dirname , 'client/html', 'signUp.html'))    //* עמוד הרשמה
})

app.get("/products",(req,res)=>{
    res.sendFile(path.join(__dirname , 'client/html', 'products.html'))    //* עמוד כל המוצרים
})

app.get("/buy",(req,res)=>{
    res.sendFile(path.join(__dirname , 'client/html', 'buy.html'))        //* עמוד עגלת הקניות
})

app.get("/profile",(req,res)=>{
    res.sendFile(path.join(__dirname , 'client/html', 'profile.html'))    //* עמוד הפרופיל
})

app.get("/page404",(req,res)=>{
    res.sendFile(path.join(__dirname , 'client/html', 'page404.html'))  //* עמוד שגיאה 404
})


const authMiddleware = (req, res, next) => {         //? Middleware
    console.log(req.query);
    if (req.query.admin === "true") {
      next();
    } else {
      return res.redirect('/page404')
    }
}


  app.get("/all", authMiddleware, (req, res) => { //? //localhost:3000/all?admin=true
    res.sendFile(path.join(__dirname , 'client/html', 'all.html'))
  });

app.post('/api/signIn',async(req,res)=>{                           //? פוקצית התחברות לאתר
    const {email, password} = req.body
    try {
        const result = await User.findOne({email:email,password:password}) //* מחפשת במאגר נתונים משתמש עם האיימל והסיסמה שהוקלדו
        if(result){
            res.status(200).send(result)                   
        }else{
            res.status(404).send({msg:'No user found with the entered data'})
        }
    } catch (error) {
        res.status(500).send({msg:'Error occured'})
    }
})

app.post('/addUser', async (req,res)=>{                                          //? פונקצית הרשמה לאתר
    const {fullName, phoneNumber, email, password, confirmPassword} = req.body
    let user = {fullName, phoneNumber, email, password}
    try {
        await addNewUser(user)
        res.status(200).send("User successfully added!")
    } catch (error) {
        res.status(500).send("Error occured: " , error)
    }
})

const addNewUser = async (user) =>{ //? הוספת נתוני המשתמש למאגר הנתונים 
    const users = new User({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: user.password
    })
    await users.save()
}


app.post('/addproduct', async (req,res)=>{         //? הוספת מוצר לאתר
    const {image, price, productName} = req.body
    let product = {image, price, productName}
    try {
        await addNewProduct(product)
        res.send("Product successfully added!")
    } catch (error) {
        res.status(500).send("Error occured: " , error)
    }
})

const addNewProduct = async (product) =>{       //? הוספת נתוני המוצר למאגר הנתונים
    const products = new Product({
        image: product.image,
        price: product.price,
        productName: product.productName,
    })
    await products.save()
} 

app.get("/api/products", async (req, res) => {        //? שליפת כל המוצרים ממאגר הנתונים לאתר
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).send("Error fetching data");
    }
});

  app.get('/api/findProduct/filter',async(req,res)=>{  //? שליפת נתוני מוצר ספציפי ממאגר הנתונים
    const {productId} = req.query
    try { 
        const product = await Product.findById(productId);
        res.json(product);
    } catch (error) {
        res.status(500).send("Error fetching data");
    }
})

app.post('/addOrder', async (req,res)=>{              //? הוספת הזמנה למאגר הנתונים - קניית מוצרים
    const {userOrder, products} = req.body
    let order = {userOrder,products}
    try {
        await addNewOrder(order)
        res.send("order successfully added!")
    } catch (error) {
        res.status(500).send("Error occured: " , error)
    }
})

const addNewOrder = async (order) =>{                //? הוספת הזמנה למאגר הנתונים - קניית מוצרים
    const orders = new Order({
        userOrder: order.userOrder,
        products: order.products,
    })
    await orders.save()
}
  
  app.get("/api/orders", async (req, res) => {         //? שליפת כל ההזמנות ממאגר הנתונים לאתר
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (error) {
      res.status(500).send("Error fetching data");
    }
});

app.delete('/api/delete',async(req,res)=>{          //? מחיקת נתוני המשתמש ממאגר הנתונים 
    try {
        const {deleteId} = req.body
        const result = await User.findOneAndDelete({_id:deleteId})

        if(result){
            res.send(`User deleted successfully`)
        }
    } catch (error) {
        res.status(500).send("Error occured")
    }
})

app.put('/api/update', async (req, res) => {        //?  עדכון נתוני המשתמש במאגר הנתונים
    const { updateId, fullName, phoneNumber, email, password } = req.body;

    try {
        const result = await User.findOneAndUpdate(
            { _id: updateId },
            {
                $set: {
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    email: email,
                    password: password
                }
            },
            { new: true }
        );
        if (result) {
            console.log(result);
            res.json({ msg: 'User data has been successfully updated', data: result });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error occurred" });
    }
});


app.get('/api/findEmail/filter',async(req,res)=>{            //? בדיקה האם המייל שהוקלד קיים במאגר הנתונים כבר
    const {email} = req.query
    try { 
        const user = await User.findOne({email:email});
        res.json(user);
    } catch (error) {
        res.status(500).send("Error fetching data");
    }
})

  app.use((req, res, next) => {                             //? מעבר לעמוד שגיאה במידה והמשתמש מקליד כתובת נתיב שגויה
    res.status(404).sendFile(path.join(__dirname , 'client/html', 'page404.html'));
})


app.listen(PORT, ()=>{
   console.log(`Server on: http://localhost:${PORT}/`)
})