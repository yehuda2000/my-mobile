let productsInTheCart = []  //? מערך המוצרים בעגלת הקניות

document.getElementById('continueToSignUp').addEventListener('click', function(event) { //? פונקציה למעבר מעמוד התחברות לעמוד הרשמה
    event.preventDefault();
    window.location.href = '/signUp'

})

function continueToSignIn(event) {  //? פונקציה למעבר מעמוד הרשמה לעמוד התחברות
    event.preventDefault();
    window.location.href = '/';
};

function goToLogin(){             //? פונקציה למעבר מעמוד שגיאה 404 לעמוד התחברות
    window.location.href = '/';
}

function beyondProfile(){             //? פונקציה למעבר לעמוד פרופיל
    window.location.href = '/profile';
}


document.getElementById('signIn').addEventListener('click', async function(event) { //? פונקצית התחברות לאתר
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    if (!email || !password) {
        alert('Please fill in all mandatory fields!');
        
        if (!email) {
            document.getElementById('email').focus();
        } else {
            document.getElementById('password').focus();
        }

        return;
    }

    const response = await fetch('/api/signIn',{
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify({email,password})
    })
    const data = await response.json();
    if(response.status == 500 || response.status == 404){
        alert(data.msg)
    }else{
        localStorage.setItem('myUser', JSON.stringify(data)); //? בהתחברות נכונה לאתר ישמרו נתוני המשתמש בדפדפן
        window.location.href = '/products';
    }
    
});

async function signUp(event) { //? פונקצית הרשמה לאתר
    event.preventDefault();
    let fullName = document.querySelector('#fullName').value;
    const phoneNumber = document.querySelector('#phoneNumber').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;
    const accept = document.querySelector('#accept');

    if(!fullName || fullName.length<4 ){                           //* שם מלא חייב להכיל לפחות 4 תווים
        alert("Full name should include at least 4 characters")
        document.getElementById('fullName').focus();
        return
    }
    if(!/^[a-zA-Z\s]+$/.test(fullName)){                            //*  שם מלא חייב להכיל אך ורק אותיות באנגלית ורווחים
        alert("Full name must include only letters")
        document.getElementById('fullName').focus();
        return
    }
    if(!phoneNumber || phoneNumber.length!=10 ){                  //* מספר טלפון חייב להכיל בדיוק 10 ספרות
        alert("Phone number must include exactly 10 digits")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!(phoneNumber[0] == '0' && phoneNumber[1] == '5')){       //* מספר טלפון חייב להתחיל ב-05
        alert("Phone number must start with 05")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!/^[0-9]+$/.test(phoneNumber)){                           //* מספר טלפון חייב להכיל רק ספרות
        alert("Phone number must include only digits")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!email.includes('@')){                                   //* @ איימל חייב להכיל 
        alert("Invalid email")
        document.getElementById('email').focus();
        return
    }
    if(!password || password.length<7 ){                       //* סיסמה חייבת להכיל 8 תווים לפחות
        alert("Password must include at least 8 characters")
        document.getElementById('password').focus();
        return
    }
    if(!(/[a-zA-Z]/.test(password) && /\d/.test(password) && /\W|_/.test(password))){    //* סיסמה חייבת להכיל ספרות אותיות ותווים
        alert("Password must include letters, numbers and characters")
        document.getElementById('password').focus();
        return
    }
    if(password != confirmPassword){                                                    //* סיסמה חייבת להיות זהה לאימות סיסמה
        alert("Confirm password not the same as password")
        document.getElementById('confirmPassword').focus();
        return
    }
    if(!accept.checked){                                                               //* תיבת הסימון חייבת להיות מסומנת
        alert("You must complete the acceptance of the terms and conditions")
        return
    }
    fullName = fullName.split(" ").map(w=>w[0].toUpperCase()+ w.slice(1)).join(" ");
    const responseEmail = await checkEmail(email)
    if(!responseEmail){
        const response = await fetch('/addUser',{
            headers:{"Content-Type":"application/json"},
            method:"POST",
            body:JSON.stringify({fullName,phoneNumber,email,password,confirmPassword})
        })
        
        const data = await response.text()
        alert(data)
        if(response.status == 200){
           window.location.href = '/' 
        }  
    }else{
        alert('The email typed exists')
        document.getElementById('email').focus();
    }
}
    

async function checkEmail(email){                                    //? בדיקה איימל ברישום לאתר - האם האיימל שהוקלד במערכת
    try {
        const response = await fetch(`/api/findEmail/filter?email=${email}`)
        if(!response.ok){
            throw new Error("Failed to fetch")
        }
        const user = await response.json()
        return user
    } catch (error) {
        console.error('Error fetching product after filter '+ error )
    }
}


async function product(){ //? פונקציה להוספת מוצר למאגר הנתונים
    const image = 'phoneStand' 
    const price = 399 
    const productName = 'Phone stand with wireless charger' 
    const response = await fetch('/addproduct',{
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify({image, price, productName})
    })
    
    const data = await response.text()
    alert(data)
}

function productPageInitialization(){ //? פונקציה לעדכון מספר הפריטים בעגלת הקניות
    
    productsInTheCart = JSON.parse(localStorage.getItem('myArray'))

    if(productsInTheCart.length != 0){
        document.querySelector("#shopping").innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${productsInTheCart.length}`
    }else{
        document.querySelector("#shopping").innerHTML = `<i class="fa-solid fa-cart-shopping"></i>`
    }
    creatingProducts();
}

async function creatingProducts() { //? פונקציה לשליפת כל המוצרים ממאגר הנתונים ושמירתם במערך
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const products = await response.json();
      renderProducts(products)
    } catch (error) {
      console.error('error something happend' + error);
    }
  }
  function renderProducts(products) { //? פונקציה להצגת כל המוצרים באתר

      const productsContainer = document.querySelector(".section3");
      productsContainer.innerHTML = "";
      products.forEach((products) => {
      const productElement = document.createElement("div");
      productElement.setAttribute("class","productElement")
      const image = document.createElement("img");
      image.setAttribute("class","product")
      image.src = `../images/${products.image}.jpg`;

      const price = document.createElement("h3");
      price.setAttribute("class","price")
      price.textContent =`NIS ${products.price}`;

      const productName = document.createElement("h4");
      productName.setAttribute("class","productName")
      productName.textContent = products.productName;

      const addToCart = document.createElement("button");
      addToCart.setAttribute("class","addToCart")
      if(!productsInTheCart.find(e => e._id === products._id)){
        addToCart.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      }else{
        addToCart.innerHTML = `<i class="fa-solid fa-minus"></i>`
      }
      
      addToCart.addEventListener('click', ()=> addToShoppingCart(products._id,addToCart))

    productElement.append(image,price,productName,addToCart);
   
    productsContainer.append(productElement)
    });
  }
  
 async function addToShoppingCart(productId,buttonId){ //? פונקציה להוספת מוצר לעגלת הקניות
   
    const product = await findProduct(productId);
    
    if(!productsInTheCart.find(e => e._id === product._id)){
        buttonId.innerHTML =`<i class="fa-solid fa-minus"></i>`
        productsInTheCart.push(product)
    }else{
        buttonId.innerHTML =`<i class="fa-solid fa-plus"></i>`
        let index = productsInTheCart.findIndex(e => e._id === product._id)
        productsInTheCart.splice(index,1)
    }
    if(productsInTheCart.length != 0){
        document.querySelector("#shopping").innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${productsInTheCart.length}`
    }else{
        document.querySelector("#shopping").innerHTML = `<i class="fa-solid fa-cart-shopping"></i>`
    }

    localStorage.setItem('myArray', JSON.stringify(productsInTheCart));
}

async function findProduct(productId) {               //? שלו id-פוקנציה למציאת נתוני המוצר לפי ה
    try {
      const response = await fetch(`/api/findProduct/filter?productId=${productId}`)
      if(!response.ok){
          throw new Error("Failed to fetch")
      }
      const product  = await response.json()
      return product
  } catch (error) {
      console.error('Error fetching product after filter '+ error )
  }
}

function beyondShoppingCart(){                       //? פוקנציה למעבר לעגלת הקניות
    window.location.href = '/buy'
}

function creatingPage(){                            //? פונקציה להצגת המוצרים בעגלת הקניות
    let myArray = JSON.parse(localStorage.getItem('myArray'))
    document.querySelector('#secondaryTitle').innerHTML = `My Shopping Cart ( ${myArray.length} )`
    console.log(myArray)

    const productsContainer = document.querySelector(".container");
      productsContainer.innerHTML = "";
      myArray.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.setAttribute("class","productInTheCart")
      const image = document.createElement("img");
      image.setAttribute("class","imgProductInTheCart")
      image.src = `../images/${product.image}.jpg`;

      const price = document.createElement("h3");
      price.setAttribute("class","priceProductInTheCart")
      price.textContent =`NIS ${product.price}`;

      const productName = document.createElement("h4");
      productName.setAttribute("class","productNameProductInTheCart")
      productName.textContent = product.productName;
      
      const removeProduct = document.createElement("h4");
      removeProduct.setAttribute("class","removeProduct")
      removeProduct.addEventListener('click', ()=> removeFromShoppingCart(myArray,product))
      removeProduct.innerHTML = '<i class="fa-solid fa-trash" style="color: #000000;"></i>';
      
      productElement.append(image,price,productName,removeProduct);
   
      productsContainer.append(productElement)
    })

      const Total = document.createElement("div");
      Total.setAttribute("class","Total")
      const priceTotal = document.createElement("h3");
      priceTotal.setAttribute("class","priceTotal")
      priceTotal.innerHTML = `<i class="fa-solid fa-coins"></i>`
      priceTotal.innerHTML +=`  NIS ${myArray.reduce((t,e)=>{return t+e.price},0)}`;
      Total.append(priceTotal)

      const divTotal = document.createElement("div");
      divTotal.setAttribute("class","divTotal")

      const buy = document.createElement("button");
      buy.setAttribute("class","buy")
      buy.addEventListener('click', ()=> buyingProductsuy(myArray))
      buy.innerHTML = `<i class="fa-regular fa-credit-card"></i>`
      buy.innerHTML += '  buy'
   
      divTotal.append(buy,Total)
      productsContainer.append(divTotal)
}   

function removeFromShoppingCart(myArray,product){        //? פונקציה להסרת מוצר ספציפי מעגלת הקניות
    let index = myArray.findIndex(e => e._id === product._id)
    myArray.splice(index,1)
    localStorage.setItem('myArray', JSON.stringify(myArray));
    creatingPage()
}

async function buyingProductsuy(products){               //? פוקנציה לרכישת המוצרים בעגלת הקניות
    let userOrder = JSON.parse(localStorage.getItem('myUser'))
    const response = await fetch('/addOrder',{
        headers:{"Content-Type":"application/json"},
        method:"POST",
        body:JSON.stringify({userOrder,products})
    })
    
    const data = await response.text()
    alert(data)

    localStorage.setItem('myArray', JSON.stringify([]))
    window.location.href = '/'
}

async function sortProducts() {                         //? פונקציה למיון המוצרים באתר 
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const products = await response.json();
      const sort = document.querySelector('#sort').value
      if(sort == 'name'){
        products.sort((a, b) => a.productName.localeCompare(b.productName))
      }else if(sort == 'priceSl'){
        products.sort((a, b) => a.price - b.price)
      }else if(sort == 'priceLs'){
        products.sort((a, b) => b.price - a.price)
      }
      
      renderProducts(products)
    } catch (error) {
      console.error('error something happend' + error);
    }
  }


function exit(){                       //? פונקציה ליציאה מהמשתמש וחזרה לעמוד התחברות
    window.location.href = '/'
}

function beyondProducst(){            //? פונקציה לחזרה לעמוד המוצרים מעמוד הקנייה 
    window.location.href = '/products'
}

function reset(){                    //? פונקציה לאיפוס עגלת הקניות ביציאה מהמשתמש
    localStorage.setItem('myArray', JSON.stringify([]));
}

async function acceptingServerOrders(){   //? פונקציה לשליפת כל ההזמנות ממאגר הנתונים ושמירתם במערך
    try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const orders = await response.json();
        renderOrders(orders)
      } catch (error) {
        console.error('error something happend' + error);
      }
}

function renderOrders(orders) { //? פונקציה להצגת כל הזמנות באתר

    document.querySelector('#title').innerHTML = `My Order List ( ${orders.length} )`

    const ordersContainer = document.querySelector(".container");
    orders.forEach((order) => {
       const orderElement = document.createElement("div");
       orderElement.setAttribute("class","orderElement")
    
        const nameOrder = document.createElement("h3");
        nameOrder.setAttribute("class","nameOrder")
        nameOrder.textContent =`Name Order: ${order.userOrder[0].fullName}`;

        const emailOrder = document.createElement("h3");
        emailOrder.setAttribute("class","emailOrder")
        emailOrder.textContent =`Email Order: ${order.userOrder[0].email}`;

        const phoneNumberOrder = document.createElement("h3");
        phoneNumberOrder.setAttribute("class","phoneNumberOrder")
        phoneNumberOrder.textContent =`Phone Number Order: ${order.userOrder[0].phoneNumber}`;

        const listProductsOrder = document.createElement("h3");
        listProductsOrder.setAttribute("class","listProductsOrder")
        listProductsOrder.textContent ='List Products Order:';
        
        const containerProducts = document.createElement("div");
        containerProducts.setAttribute("class","containerProducts")

        let totalPrice = 0
    
        if(order.products.length == 1){
            containerProducts.setAttribute("id","containerProducts")
        }

        
        for(let i = 0 ; i<order.products.length;i++){

            totalPrice += order.products[i].price
            const product = document.createElement("div");
            product.setAttribute("class","product")

            const productTitle = document.createElement("h3");
            productTitle.setAttribute("class","productTitle")
            productTitle.textContent = order.products[i].productName;

             const productImage = document.createElement("img");
             productImage.setAttribute("class","productImage")
             productImage.src = `../images/${order.products[i].image}.jpg`;

            product.append(productTitle,productImage)

            containerProducts.append(product)

        }

        const total = document.createElement("div");
        total.setAttribute("class","Total")
        const priceTotal = document.createElement("h3");
        priceTotal.setAttribute("class","priceTotal")
        priceTotal.innerHTML = `<i class="fa-solid fa-coins"></i>`
        priceTotal.innerHTML +=`  NIS ${totalPrice}`;
        total.append(priceTotal)
        

        orderElement.append(nameOrder,emailOrder,phoneNumberOrder,listProductsOrder,containerProducts,total);
 
        ordersContainer.append(orderElement)

    })
    
}

async function searchProducts(){     //? פונקציה לסינון מוצרים בתיבת החיפוש בדף הבית - דף כל המוצרים
        
        try {
            const response = await fetch("/api/products");
            if (!response.ok) {
              throw new Error("Failed to fetch products");
            }
            const products = await response.json();
            const valueSearch = document.querySelector('#search').value
            const filteredProducts = products.filter(e => e.productName.toLowerCase().includes(valueSearch.toLowerCase()));
            renderProducts(filteredProducts)
          } catch (error) {
            console.error('error something happend' + error);
          }
}

function profile(){                                       //? עדכון פרטי המשתמש בדף הפרופיל 
    const myUser = JSON.parse(localStorage.getItem('myUser'))
    document.querySelector('#fullName').value = myUser.fullName
    document.querySelector('#phoneNumber').value = myUser.phoneNumber
    document.querySelector('#email').value = myUser.email
    document.querySelector('#password').value = myUser.password
}

async function deletion(){                             //? מחיקת נתוני המשתמש מהאתר
    const myUser = JSON.parse(localStorage.getItem('myUser'))
    const deleteId = myUser._id
    const response = await fetch('/api/delete',{
        headers:{"Content-Type":"application/json"},
        method:"DELETE",
        body:JSON.stringify({deleteId})
    })
    const data = await response.text();
    alert(data)
    if(response.status == 200){
        window.location.href = '/';
    }
}


async function updating(){                          //? עדכון נתוני המשתמש באתר

    const myUser = JSON.parse(localStorage.getItem('myUser'))
    let fullName = document.querySelector('#fullName').value
    const phoneNumber = document.querySelector('#phoneNumber').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const updateId = myUser._id

    if(!fullName || fullName.length<4 ){                           //* שם מלא חייב להכיל לפחות 4 תווים
        alert("Full name should include at least 4 characters")
        document.getElementById('fullName').focus();
        return
    }
    if(!/^[a-zA-Z\s]+$/.test(fullName)){                            //* שם מלא חייב להכיל אך ורק אותיות באנגלית
        alert("Full name must include only letters")
        document.getElementById('fullName').focus();
        return
    }
    if(!phoneNumber || phoneNumber.length!=10 ){                  //* מספר טלפון חייב להכיל בדיוק 10 ספרות
        alert("Phone number must include exactly 10 digits")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!(phoneNumber[0] == '0' && phoneNumber[1] == '5')){       //* מספר טלפון חייב להתחיל ב-05
        alert("Phone number must start with 05")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!/^[0-9]+$/.test(phoneNumber)){                           //* מספר טלפון חייב להכיל רק ספרות
        alert("Phone number must include only digits")
        document.getElementById('phoneNumber').focus();
        return
    }
    if(!email.includes('@')){                                   //* @ איימל חייב להכיל 
        alert("Invalid email")
        document.getElementById('email').focus();
        return
    }
    if(!password || password.length<7 ){                       //* סיסמה חייבת להכיל 8 תווים לפחות
        alert("Password must include at least 8 characters")
        document.getElementById('password').focus();
        return
    }
    if(!(/[a-zA-Z]/.test(password) && /\d/.test(password) && /\W|_/.test(password))){    //* סיסמה חייבת להכיל ספרות אותיות ותווים
        alert("Password must include letters, numbers and characters")
        document.getElementById('password').focus();
        return
    }
    fullName = fullName.split(" ").map(w=>w[0].toUpperCase()+ w.slice(1)).join(" ");
    const response = await fetch('/api/update',{
        headers:{"Content-Type":"application/json"},
        method:"PUT",
        body:JSON.stringify({updateId,fullName,phoneNumber,email,password})
    })
    const data = await response.json();
    if(response.status == 200){
        localStorage.setItem('myUser', JSON.stringify(data.data));
        console.log(data.data)
        alert(data.msg);
        profile();
    } else {
        alert(data.msg);
    }
  
}
