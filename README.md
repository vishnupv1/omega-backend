# Grabit E-commerce Backend

This is the backend server for the Grabit e-commerce application. It provides RESTful APIs for user authentication, product management, order processing, and more.

## Features

- User authentication and authorization
- Product management with categories and ratings
- Shopping cart and wishlist functionality
- Order processing and tracking
- Payment integration with Stripe
- Email notifications
- Vendor management
- Admin dashboard

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- Nodemailer for emails

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grabit
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- Body:
  ```json
  {
    "email": "john@example.com"
  }
  ```

#### Reset Password
- **POST** `/api/auth/reset-password`
- Body:
  ```json
  {
    "token": "reset_token",
    "password": "new_password"
  }
  ```

### Products

#### Get All Products
- **GET** `/api/products`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort field (default: -createdAt)
  - `category`: Filter by category
  - `search`: Search in name and description
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price

#### Get Single Product
- **GET** `/api/products/:id`

#### Create Product (Vendor/Admin only)
- **POST** `/api/products`
- Body:
  ```json
  {
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "category_id",
    "stock": 100,
    "sku": "SKU123",
    "images": ["image_url1", "image_url2"]
  }
  ```

#### Update Product (Vendor/Admin only)
- **PUT** `/api/products/:id`
- Body: Same as create product

#### Delete Product (Vendor/Admin only)
- **DELETE** `/api/products/:id`

### Orders

#### Create Order
- **POST** `/api/orders`
- Body:
  ```json
  {
    "items": [
      {
        "product": "product_id",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "country": "Country",
      "zipCode": "12345"
    },
    "paymentMethod": "stripe"
  }
  ```

#### Get User Orders
- **GET** `/api/orders/my-orders`

#### Get Single Order
- **GET** `/api/orders/:id`

#### Cancel Order
- **POST** `/api/orders/:id/cancel`

#### Update Order Status (Admin/Vendor only)
- **PUT** `/api/orders/:id/status`
- Body:
  ```json
  {
    "status": "processing"
  }
  ```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development mode)"
}
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Role-based access control
- CORS enabled
- Rate limiting (to be implemented)
- XSS protection (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 