# 📚 Student Fee Collector

A comprehensive mobile application for managing student fee collection with intuitive payment tracking, monthly history, and data analytics. Built with modern technologies to help schools and coaching centers streamline their fee collection process.

**Built with [Manus](https://github.com/ManusJS/Manus) | TypeScript + JavaScript**

---

## 🎯 Overview

**Student Fee Collector** is a mobile-first application designed to simplify and automate fee collection management in educational institutions. Whether you're running a school, coaching center, or tuition facility, this app provides a seamless experience for tracking student payments, maintaining accurate records, and generating comprehensive reports.

### Key Statistics
- **Language**: 97.6% TypeScript, 2.4% JavaScript
- **Framework**: React Native (via Manus)
- **Database**: Drizzle ORM
- **Styling**: Tailwind CSS + NativeWind

---

## ✨ Core Features

### 1. **Student Management**
- 📝 Quick student registration with name, class, and monthly fee
- 🔍 Search and filter students by name or class
- ✏️ Edit student information and fee structure
- 🗑️ Remove students with confirmation
- 📊 View complete student database

### 2. **Monthly Payment Tracking**
- 📅 12-month payment calendar grid (January - December)
- ✅ Mark payments with one tap
- 📍 Automatic timestamp recording for each payment
- 🔄 Edit payment dates if needed
- 💰 Visual indicators for paid/unpaid status

### 3. **Payment History & Records**
- 📋 Detailed chronological payment history
- 🗓️ View exact dates of all transactions (day, month, year)
- 📈 Sort and filter payment records
- 📤 Export payment history as CSV
- 🔄 Track payment trends over time

### 4. **Dashboard & Analytics**
- 📊 Overview of total students and collection status
- 💵 Summary of pending payments
- 📈 Monthly collection statistics
- 🎯 Payment completion rates

### 5. **Data Management**
- 💾 Automatic data persistence
- 📤 Export all data as CSV
- 🔐 Secure local storage
- 🔄 Backup and restore capabilities
- ⚙️ Reset functionality with confirmation

### 6. **User Interface**
- 🎨 Clean, professional design
- 📱 Optimized for mobile (Portrait orientation: 9:16)
- 👆 Large touch targets (44pt minimum) for easy interaction
- 🌈 Color-coded status indicators (Paid, Pending, Overdue)
- ♿ Accessible and responsive design

---

## 🏢 How It Helps Schools & Coaching Centers

### For Administrators
- **Centralized Database**: Manage all students and their payment records in one place
- **Reduced Paperwork**: Eliminate manual record-keeping and ledgers
- **Quick Access**: Find payment status of any student in seconds
- **Audit Trail**: Complete history of all transactions with timestamps

### For Fee Collection
- **Efficient Tracking**: Monitor monthly payments at a glance
- **Payment Reminders**: Quickly identify pending payments
- **Bulk Operations**: Manage fees for multiple students simultaneously
- **Data Export**: Generate reports for accounting and compliance

### For Management
- **Monthly Reports**: Analyze collection trends and identify patterns
- **Performance Metrics**: Track payment completion rates
- **Financial Planning**: Better understand cash flow
- **Compliance**: Maintain accurate, auditable records

### For Parents/Students
- **Transparency**: Clear payment history available anytime
- **Records**: Access to payment receipts and dates
- **Simple Process**: Easy payment confirmation system

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **Manus** - Modern React Native framework
- **Tailwind CSS + NativeWind** - Utility-first styling
- **React Router** - Navigation and routing

### Backend & Database
- **Node.js/Express** - Server runtime (if applicable)
- **Drizzle ORM** - Type-safe database queries
- **SQLite/PostgreSQL** - Data persistence
- **API Layer** - RESTful endpoints for data operations

### Development Tools
- **Babel** - JavaScript transpilation
- **ESLint** - Code quality and linting
- **Metro Bundler** - React Native bundler
- **pnpm** - Package management

### Design System
- **Color Scheme**:
  - Primary: `#0a7ea4` (Professional Blue)
  - Success: `#22C55E` (Green)
  - Error: `#EF4444` (Red)
  - Warning: `#F59E0B` (Amber)

---

## 📸 Screen Overview

### 1. **Home Screen (Dashboard)**
- Display list of all students
- Quick payment status indicators
- Add new student button
- Search and filter functionality
- Navigation to student details

### 2. **Add/Edit Student Screen**
- Input student name (required)
- Select class/grade (required)
- Enter monthly fee amount (required, must be positive)
- Form validation
- Save or cancel options

### 3. **Student Detail Screen**
- Student information summary
- 12-month payment grid
- Payment status for each month
- View/edit payment details
- Student management options (edit, delete)
- Payment history link

### 4. **Payment History Screen**
- Chronological list of all payments
- Filter by date range or student
- Payment amount and date paid
- Sort options (newest first/oldest first)
- Export functionality

### 5. **Settings Screen**
- Export all data as CSV
- Clear all data (with confirmation prompt)
- About and app information
- Version details

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/M-GCoder/Student-Fee-Collector.git
cd Student-Fee-Collector

# Install dependencies
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
