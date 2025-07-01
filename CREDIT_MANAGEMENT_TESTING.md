# Credit Management Testing Guide

## Overview
The credit management system is now fully functional with the following features:
- ✅ Create credit packages
- ✅ Edit credit packages  
- ✅ Delete credit packages
- ✅ Add credits to students
- ✅ View student credit balances
- ✅ Payment tracking

## Setup Instructions

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Seed the Database (Optional)
```bash
cd server
npm run seed
```
This will add sample data including:
- 5 credit packages (Basic, Standard, Premium, Physics, Mathematics)
- Sample students with credit balances
- Sample payments and invoices

### 3. Start the Client
```bash
cd client
npm run dev
```

## Testing the Credit Management Features

### 1. Create Credit Package
1. Navigate to **Operations > Financial Dashboard > Payments**
2. Click on the **"Credit Packages"** tab
3. Click **"Create Package"** button
4. Fill in the form:
   - **Package Name**: "Test Package"
   - **Hours**: 8
   - **Price**: 350
   - **Description**: "Test package for 8 hours"
5. Click **"Create Package"**
6. ✅ Verify the package appears in the list

### 2. Edit Credit Package
1. In the Credit Packages tab, find any package
2. Click the **"Edit"** button
3. Modify the package details
4. Click **"Update Package"**
5. ✅ Verify the changes are saved

### 3. Delete Credit Package
1. In the Credit Packages tab, find a package
2. Click the **"Delete"** button
3. Confirm the deletion
4. ✅ Verify the package is removed from the list

### 4. Add Credits to Student
1. Click on the **"Credits Management"** tab
2. Click **"Add Credits"** button
3. Select a student from the dropdown
4. Select a credit package
5. Add optional notes
6. Click **"Add Credits"**
7. ✅ Verify the student's credit balance increases

### 5. View Student Credits
1. In the Credits Management tab
2. ✅ Verify you can see:
   - Student names and current balances
   - Active packages with remaining hours
   - Recent usage history
   - Total purchased vs used hours

## Expected Behavior

### Success Messages
- Green success messages should appear for successful operations
- Messages auto-dismiss after 3 seconds
- Can be manually dismissed with the × button

### Error Handling
- Red error messages for validation errors
- Duplicate package names are prevented
- Cannot delete packages assigned to students
- Form validation prevents invalid data

### Loading States
- Buttons show loading text during operations
- Forms are disabled during processing
- Loading spinner appears when fetching data

## Database Schema
The system uses these tables:
- `time_packages` - Credit package definitions
- `student_time_packages` - Student credit balances
- `payments` - Payment records
- `invoices` - Invoice records
- `time_deductions` - Credit usage tracking

## API Endpoints
- `GET /api/payments/packages` - Get all packages
- `POST /api/payments/packages` - Create package
- `PUT /api/payments/packages/:id` - Update package
- `DELETE /api/payments/packages/:id` - Delete package
- `GET /api/payments/credits` - Get student credits
- `POST /api/payments/credits/add` - Add credits to student

## Troubleshooting

### Common Issues:
1. **"Failed to load payment data"** - Check if server is running
2. **"Student not found"** - Ensure students exist in database
3. **"Package name already exists"** - Use a unique name
4. **"Cannot delete package"** - Package is assigned to students

### Database Issues:
- Run `npm run seed` to add sample data
- Check database connection in `.env` file
- Verify all tables exist in the database

## Features Implemented
- ✅ Full CRUD operations for credit packages
- ✅ Real-time data from database
- ✅ Form validation (client and server)
- ✅ Loading states and error handling
- ✅ Success/error message display
- ✅ Responsive design
- ✅ Duplicate name prevention
- ✅ Safety checks for deletions 