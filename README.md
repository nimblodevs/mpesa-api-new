# mpesa-api-new

A comprehensive M-Pesa payment integration system built with React, Node.js, and the M-Pesa Daraja API.

## Features

- **C2B Payments (STK Push)** - Customer to Business payments
- **B2C Payments** - Business to Customer payments  
- **B2B Payments** - Business to Business payments
- **Account Balance** - Check M-Pesa account balance
- **QR Code Generation** - Generate M-Pesa QR codes
- **Transaction Reversal** - Reverse failed transactions
- **Payment History** - View all transaction history
- **Real-time Status Updates** - Live payment status tracking

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- Node.js with Express
- Prisma ORM with MongoDB
- M-Pesa Daraja API integration
- Rate limiting and security middleware

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- M-Pesa Daraja API credentials

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mpesa-api-new
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

3. Environment Setup
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update with your M-Pesa credentials and database URL
```

4. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

5. Start the application
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)  
npm run dev
```

## Configuration

### M-Pesa Credentials
Update `server/.env` with your M-Pesa Daraja API credentials:
- Consumer Key
- Consumer Secret  
- Business Short Code
- Passkey
- Initiator Name
- Security Credential

### Database
Configure your MongoDB connection string in `DATABASE_URL`.

## API Endpoints

### Payments
- `POST /api/payments/initiate` - Initiate STK Push
- `GET /api/payments/status/:id` - Check payment status
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/b2c` - B2C payment
- `POST /api/payments/b2b` - B2B payment
- `POST /api/payments/balance` - Check account balance
- `POST /api/payments/qr-code` - Generate QR code
- `POST /api/payments/transaction-reversal` - Reverse transaction

### Callbacks
- `POST /api/payments/mpesa/callback` - M-Pesa STK callback
- `POST /api/payments/mpesa/result` - M-Pesa result callback
- `POST /api/payments/mpesa/timeout` - M-Pesa timeout callback

## Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- Security headers with Helmet.js
- Error handling and logging
- CORS configuration

## Deployment

### Using Render (Recommended)
1. Connect your repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy!

### Manual Deployment
1. Build the client: `npm run build`
2. Set production environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Roadmap

- [ ] Add unit and integration tests
- [ ] Implement webhook signature verification
- [ ] Add transaction analytics dashboard
- [ ] Support for multiple business accounts
- [ ] Mobile app version
- [ ] Advanced reporting features