import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const creditPackageValidation = [
    body('name').isString().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('hours').isInt({ min: 1 }).withMessage('Hours must be a positive integer'),
    body('price').isNumeric().withMessage('Price must be a valid number'),
    body('description').optional().isString().trim()
];

const addCreditsValidation = [
    body('studentId').isInt({ min: 1 }).withMessage('Valid student ID is required'),
    body('timePackageId').isInt({ min: 1 }).withMessage('Valid time package ID is required'),
    body('notes').optional().isString().trim()
];

// Get payment overview data
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        // Get total revenue from payments
        const revenueResult = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total_revenue 
            FROM payments
        `);
        
        // Get pending payments (invoices with pending status)
        const pendingResult = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) as pending_amount 
            FROM invoices 
            WHERE status = 'pending'
        `);
        
        // Get overdue invoices
        const overdueResult = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) as overdue_amount 
            FROM invoices 
            WHERE status = 'overdue'
        `);
        
        // Get payment success rate
        const successRateResult = await pool.query(`
            SELECT 
                COUNT(*) as total_payments,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_payments
            FROM invoices
        `);
        
        const totalPayments = parseInt(successRateResult.rows[0].total_payments) || 0;
        const successfulPayments = parseInt(successRateResult.rows[0].successful_payments) || 0;
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
        
        // Mock monthly trend data (in a real app, you'd calculate this from actual data)
        const monthlyTrend = [
            { month: 'Jan', revenue: 18000, payments: 16500, overdue: 1500 },
            { month: 'Feb', revenue: 19500, payments: 18200, overdue: 1300 },
            { month: 'Mar', revenue: 21000, payments: 19800, overdue: 1200 },
            { month: 'Apr', revenue: 22500, payments: 21200, overdue: 1300 },
            { month: 'May', revenue: 24000, payments: 22800, overdue: 1200 },
            { month: 'Jun', revenue: 25500, payments: 24200, overdue: 1300 }
        ];
        
        res.json({
            totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
            pendingPayments: parseFloat(pendingResult.rows[0].pending_amount) || 0,
            overdueInvoices: parseFloat(overdueResult.rows[0].overdue_amount) || 0,
            averagePaymentTime: 3.2, // Mock data
            paymentSuccessRate: Math.round(successRate * 100) / 100,
            monthlyTrend
        });
    } catch (error) {
        console.error('Error fetching payment overview:', error);
        res.status(500).json({ error: 'Failed to fetch payment overview' });
    }
});

// Get all invoices
router.get('/invoices', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.invoice_id as id,
                u.name as student,
                i.total_amount as amount,
                i.issued_at as date,
                i.status,
                i.due_date,
                i.description
            FROM invoices i
            JOIN students s ON i.student_id = s.student_id
            JOIN users u ON s.student_id = u.user_id
            ORDER BY i.issued_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Get all payments
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.payment_id as id,
                u.name as student,
                p.amount,
                p.payment_date as date,
                pm.method_name as method,
                p.reference,
                p.description as notes
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN users u ON s.student_id = u.user_id
            LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
            ORDER BY p.payment_date DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Get all student credits
router.get('/credits', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                s.student_id,
                u.name as student_name,
                COALESCE(SUM(stp.minutes_remaining), 0) as total_minutes_remaining,
                COALESCE(SUM(stp.minutes_remaining) / 60.0, 0) as current_balance_hours
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            LEFT JOIN student_time_packages stp ON s.student_id = stp.student_id
            GROUP BY s.student_id, u.name
            ORDER BY u.name
        `);
        
        // For each student, get their packages and usage
        const studentsWithDetails = await Promise.all(result.rows.map(async (student) => {
            // Get active packages
            const packagesResult = await pool.query(`
                SELECT 
                    stp.purchase_id,
                    tp.name as package_name,
                    tp.hours_total,
                    stp.minutes_remaining,
                    stp.expiration_date,
                    stp.purchase_date
                FROM student_time_packages stp
                JOIN time_packages tp ON stp.time_package_id = tp.time_package_id
                WHERE stp.student_id = $1
                ORDER BY stp.expiration_date ASC
            `, [student.student_id]);
            
            // Get recent usage
            const usageResult = await pool.query(`
                SELECT 
                    td.deducted_at as date,
                    td.minutes_used,
                    cs.session_date,
                    sub.name as subject_name
                FROM time_deductions td
                JOIN class_sessions cs ON td.session_id = cs.session_id
                JOIN subjects sub ON cs.subject_id = sub.subject_id
                WHERE td.student_id = $1
                ORDER BY td.deducted_at DESC
                LIMIT 5
            `, [student.student_id]);
            
            // Calculate total purchased and used
            const totalPurchasedResult = await pool.query(`
                SELECT 
                    COALESCE(SUM(tp.hours_total), 0) as total_purchased_hours,
                    COALESCE(SUM(td.minutes_used) / 60.0, 0) as total_used_hours
                FROM student_time_packages stp
                JOIN time_packages tp ON stp.time_package_id = tp.time_package_id
                LEFT JOIN time_deductions td ON stp.purchase_id = td.time_package_id
                WHERE stp.student_id = $1
            `, [student.student_id]);
            
            return {
                studentId: student.student_id,
                student: student.student_name,
                currentBalance: Math.round(student.current_balance_hours * 100) / 100,
                totalPurchased: Math.round(totalPurchasedResult.rows[0].total_purchased_hours * 100) / 100,
                totalUsed: Math.round(totalPurchasedResult.rows[0].total_used_hours * 100) / 100,
                packages: packagesResult.rows.map(pkg => ({
                    name: pkg.package_name,
                    hours: pkg.hours_total,
                    remaining: Math.round((pkg.minutes_remaining / 60.0) * 100) / 100,
                    expires: pkg.expiration_date
                })),
                recentUsage: usageResult.rows.map(usage => ({
                    date: usage.date,
                    hours: Math.round((usage.minutes_used / 60.0) * 100) / 100,
                    session: usage.subject_name
                }))
            };
        }));
        
        res.json(studentsWithDetails);
    } catch (error) {
        console.error('Error fetching student credits:', error);
        res.status(500).json({ error: 'Failed to fetch student credits' });
    }
});

// Get specific student credits
router.get('/credits/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student details
        const studentResult = await pool.query(`
            SELECT 
                s.student_id,
                u.name as student_name,
                COALESCE(SUM(stp.minutes_remaining), 0) as total_minutes_remaining,
                COALESCE(SUM(stp.minutes_remaining) / 60.0, 0) as current_balance_hours
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            LEFT JOIN student_time_packages stp ON s.student_id = stp.student_id
            WHERE s.student_id = $1
            GROUP BY s.student_id, u.name
        `, [studentId]);
        
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const student = studentResult.rows[0];
        
        // Get active packages
        const packagesResult = await pool.query(`
            SELECT 
                stp.purchase_id,
                tp.name as package_name,
                tp.hours_total,
                stp.minutes_remaining,
                stp.expiration_date,
                stp.purchase_date
            FROM student_time_packages stp
            JOIN time_packages tp ON stp.time_package_id = tp.time_package_id
            WHERE stp.student_id = $1
            ORDER BY stp.expiration_date ASC
        `, [studentId]);
        
        // Get recent usage
        const usageResult = await pool.query(`
            SELECT 
                td.deducted_at as date,
                td.minutes_used,
                cs.session_date,
                sub.name as subject_name
            FROM time_deductions td
            JOIN class_sessions cs ON td.session_id = cs.session_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE td.student_id = $1
            ORDER BY td.deducted_at DESC
            LIMIT 5
        `, [studentId]);
        
        // Calculate total purchased and used
        const totalPurchasedResult = await pool.query(`
            SELECT 
                COALESCE(SUM(tp.hours_total), 0) as total_purchased_hours,
                COALESCE(SUM(td.minutes_used) / 60.0, 0) as total_used_hours
            FROM student_time_packages stp
            JOIN time_packages tp ON stp.time_package_id = tp.time_package_id
            LEFT JOIN time_deductions td ON stp.purchase_id = td.time_package_id
            WHERE stp.student_id = $1
        `, [studentId]);
        
        const studentWithDetails = {
            studentId: student.student_id,
            student: student.student_name,
            currentBalance: Math.round(student.current_balance_hours * 100) / 100,
            totalPurchased: Math.round(totalPurchasedResult.rows[0].total_purchased_hours * 100) / 100,
            totalUsed: Math.round(totalPurchasedResult.rows[0].total_used_hours * 100) / 100,
            packages: packagesResult.rows.map(pkg => ({
                name: pkg.package_name,
                hours: pkg.hours_total,
                remaining: Math.round((pkg.minutes_remaining / 60.0) * 100) / 100,
                expires: pkg.expiration_date
            })),
            recentUsage: usageResult.rows.map(usage => ({
                date: usage.date,
                hours: Math.round((usage.minutes_used / 60.0) * 100) / 100,
                session: usage.subject_name
            }))
        };
        
        res.json(studentWithDetails);
    } catch (error) {
        console.error('Error fetching student credits:', error);
        res.status(500).json({ error: 'Failed to fetch student credits' });
    }
});

// Get credit packages (time packages)
router.get('/packages', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                time_package_id as id,
                name,
                hours_total as hours,
                price,
                expiration_days,
                CONCAT(hours_total, ' hours of tutoring') as description
            FROM time_packages
            ORDER BY hours_total ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching credit packages:', error);
        res.status(500).json({ error: 'Failed to fetch credit packages' });
    }
});

// Add credits to student (purchase time package)
router.post('/credits/add', authenticateToken, addCreditsValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { studentId, timePackageId, notes } = req.body;

        // Validate student exists
        const studentExists = await client.query('SELECT * FROM students WHERE student_id = $1', [studentId]);
        if (studentExists.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get package details
        const packageResult = await client.query(
            'SELECT * FROM time_packages WHERE time_package_id = $1',
            [timePackageId]
        );

        if (packageResult.rows.length === 0) {
            return res.status(404).json({ error: 'Time package not found' });
        }

        await client.query('BEGIN');

        const package_info = packageResult.rows[0];
        const expiration_date = new Date();
        expiration_date.setDate(expiration_date.getDate() + package_info.expiration_days);

        // Convert hours to minutes
        const minutes_remaining = package_info.hours_total * 60;

        // Create student time package
        const timePackageResult = await client.query(`
            INSERT INTO student_time_packages 
            (student_id, time_package_id, minutes_remaining, expiration_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [studentId, timePackageId, minutes_remaining, expiration_date]);

        // Create payment record
        const paymentResult = await client.query(`
            INSERT INTO payments 
            (student_id, amount, payment_date, description)
            VALUES ($1, $2, CURRENT_DATE, $3)
            RETURNING *
        `, [studentId, package_info.price, notes || `Purchase of ${package_info.name}`]);

        await client.query('COMMIT');
        
        res.status(201).json({
            message: 'Credits added successfully',
            timePackage: timePackageResult.rows[0],
            payment: paymentResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding credits:', error);
        res.status(500).json({ 
            error: 'Failed to add credits',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Create new credit package
router.post('/packages', authenticateToken, creditPackageValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, hours, price, description } = req.body;

        // Check if package name already exists
        const existingPackage = await client.query(
            'SELECT * FROM time_packages WHERE LOWER(name) = LOWER($1)',
            [name]
        );

        if (existingPackage.rows.length > 0) {
            return res.status(400).json({ 
                error: 'A package with this name already exists' 
            });
        }

        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO time_packages (name, hours_total, price, expiration_days)
            VALUES ($1, $2, $3, 365)
            RETURNING *
        `, [name, hours, price]);

        await client.query('COMMIT');
        
        // Return the created package with formatted data
        const createdPackage = {
            id: result.rows[0].time_package_id,
            name: result.rows[0].name,
            hours: result.rows[0].hours_total,
            price: result.rows[0].price,
            description: `${result.rows[0].hours_total} hours of tutoring`
        };
        
        res.status(201).json(createdPackage);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating credit package:', error);
        res.status(500).json({ 
            error: 'Failed to create credit package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Update credit package
router.put('/packages/:id', authenticateToken, creditPackageValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { name, hours, price, description } = req.body;

        // Check if package name already exists (excluding current package)
        const existingPackage = await client.query(
            'SELECT * FROM time_packages WHERE LOWER(name) = LOWER($1) AND time_package_id != $2',
            [name, id]
        );

        if (existingPackage.rows.length > 0) {
            return res.status(400).json({ 
                error: 'A package with this name already exists' 
            });
        }

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE time_packages 
            SET name = $1, hours_total = $2, price = $3
            WHERE time_package_id = $4
            RETURNING *
        `, [name, hours, price, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Credit package not found' });
        }

        await client.query('COMMIT');
        
        // Return the updated package with formatted data
        const updatedPackage = {
            id: result.rows[0].time_package_id,
            name: result.rows[0].name,
            hours: result.rows[0].hours_total,
            price: result.rows[0].price,
            description: `${result.rows[0].hours_total} hours of tutoring`
        };
        
        res.json(updatedPackage);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating credit package:', error);
        res.status(500).json({ 
            error: 'Failed to update credit package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Delete credit package
router.delete('/packages/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        // Check if any students have this time package
        const studentPackages = await client.query(`
            SELECT COUNT(*) FROM student_time_packages 
            WHERE time_package_id = $1
        `, [id]);

        if (parseInt(studentPackages.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete credit package that is currently assigned to students' 
            });
        }

        await client.query('BEGIN');

        const result = await client.query(`
            DELETE FROM time_packages 
            WHERE time_package_id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Credit package not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Credit package deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting credit package:', error);
        res.status(500).json({ 
            error: 'Failed to delete credit package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

export default router; 