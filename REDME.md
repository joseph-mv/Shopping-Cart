
## README File

### Shopping Cart Application

**Description:**

This is a web application that provides a streamlined shopping cart experience. It allows users to add products to their carts, manage their orders, and make secure online payments.

**Features:**

* User registration and login
* Product browsing and adding to cart
* Cart management (increment, decrement, remove items)
* Secure online payments via Razorpay
* Cash on Delivery (COD) option
* Order tracking and management
* Admin panel for product management, user management, and order fulfillment

**Tech Stack:**

* Express.js
* Handlebars
* MongoDB
* Razorpay
* Express-session
* Bcrypt

**Installation:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/joseph-mv/Shopping-Cart.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Reinstall Bcrypt module:**
"The bcrypt module comes in versions for both x86 (32-bit) and x64 (64-bit) systems. Ensure you install the version compatible with your system."
   ```bash
   npm uninstall bcrypt 
   ```   
   ```bash
   npm install bcrypt 
   ```  
4. **Set up environment variables:**
   Create a `.env` file and add the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

**Usage:**

1. **Start the server:**
   ```bash
   npm start
   ```
2. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

**Contributing:**

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository.**
2. **Create a new branch:** `git checkout -b feature/your-feature`
3. **Make your changes.**
4. **Commit your changes:** `git commit -m 'Add new feature'`
5. **Push to your branch:** `git push origin feature/your-feature`
6. **Create a pull request.**

**License:**

[MIT License]

**Acknowledgements:**

* Thank you to the Express.js, Handlebars, MongoDB, and Razorpay communities for their excellent tools and resources.
