import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import '../../../css/FinancialDashboard.css';
import '../../../css/Payments.css';
import { paymentService } from '../../../services/paymentService';

function Payments() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for real data
  const [paymentOverview, setPaymentOverview] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
    averagePaymentTime: 0,
    paymentSuccessRate: 0,
    monthlyTrend: []
  });
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [studentCredits, setStudentCredits] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);

  // Form state for modals
  const [addCreditsForm, setAddCreditsForm] = useState({
    studentId: '',
    timePackageId: '',
    notes: ''
  });
  const [createPackageForm, setCreatePackageForm] = useState({
    name: '',
    hours: '',
    price: '',
    description: ''
  });



  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overview, invoicesData, paymentsData, creditsData, packagesData] = await Promise.all([
        paymentService.getPaymentOverview().catch(() => ({
          totalRevenue: 0,
          pendingPayments: 0,
          overdueInvoices: 0,
          averagePaymentTime: 0,
          paymentSuccessRate: 0,
          monthlyTrend: []
        })),
        paymentService.getInvoices().catch(() => []),
        paymentService.getPayments().catch(() => []),
        paymentService.getStudentCredits().catch(() => []),
        paymentService.getCreditPackages().catch(() => [])
      ]);

      setPaymentOverview(overview);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setStudentCredits(creditsData);
      setCreditPackages(packagesData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Don't show error if it's just no data - set empty defaults instead
      setPaymentOverview({
        totalRevenue: 0,
        pendingPayments: 0,
        overdueInvoices: 0,
        averagePaymentTime: 0,
        paymentSuccessRate: 0,
        monthlyTrend: []
      });
      setInvoices([]);
      setPayments([]);
      setStudentCredits([]);
      setCreditPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form handlers
  const handleAddCreditsChange = (e) => {
    setAddCreditsForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreatePackageChange = (e) => {
    setCreatePackageForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await paymentService.addCredits(addCreditsForm);
      setShowAddCreditsModal(false);
      setAddCreditsForm({ studentId: '', timePackageId: '', notes: '' });
      fetchData(); // Refresh data
      alert('Credits added successfully!');
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!createPackageForm.name.trim()) {
      setError('Package name is required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (createPackageForm.hours < 1) {
      setError('Hours must be at least 1');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (createPackageForm.price <= 0) {
      setError('Price must be greater than 0');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Check if package name already exists
    const existingPackage = creditPackages.find(
      pkg => pkg.name.toLowerCase() === createPackageForm.name.toLowerCase()
    );
    
    if (existingPackage) {
      setError('A package with this name already exists');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await paymentService.createCreditPackage(createPackageForm);
      setShowCreatePackageModal(false);
      setCreatePackageForm({ name: '', hours: '', price: '', description: '' });
      fetchData(); // Refresh data
      setSuccessMessage('Credit package created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating package:', error);
      setError('Failed to create package: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await paymentService.deleteCreditPackage(packageId);
      fetchData(); // Refresh data
      alert('Credit package deleted successfully!');
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setCreatePackageForm({
      name: pkg.name,
      hours: pkg.hours,
      price: pkg.price,
      description: pkg.description || ''
    });
    setShowEditPackageModal(true);
  };

  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await paymentService.updateCreditPackage(editingPackage.id, createPackageForm);
      setShowEditPackageModal(false);
      setEditingPackage(null);
      setCreatePackageForm({ name: '', hours: '', price: '', description: '' });
      fetchData(); // Refresh data
      setSuccessMessage('Credit package updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating package:', error);
      setError('Failed to update package: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return 'CC';
      case 'bank_transfer': return 'BT';
      case 'cash': return 'CA';
      case 'online': return 'OL';
      default: return 'PM';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.student && invoice.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (invoice.id && invoice.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.student && payment.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.id && payment.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = dateFilter === 'all' || (payment.date && payment.date.includes(dateFilter));
    return matchesSearch && matchesDate;
  });

  const filteredCredits = studentCredits.filter(credit => {
    return credit.student && credit.student.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading && !paymentOverview.totalRevenue) {
    return (
      <div className="page-container">
        <div className="main">
          <section className="dashboard-main">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading payment data...</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error && !paymentOverview.totalRevenue && invoices.length === 0 && payments.length === 0) {
    return (
      <div className="page-container">
        <div className="main">
          <section className="dashboard-main">
            <div className="error-container">
              <h2>No Payment Data Available</h2>
              <p>There's no payment data to display. You can start by creating credit packages or adding students.</p>
              <div className="error-actions">
                <button className="btn btn-primary" onClick={fetchData}>
                  Refresh
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreatePackageModal(true)}
                >
                  Create First Package
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              <span>✓ {successMessage}</span>
              <button onClick={() => setSuccessMessage('')}>×</button>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span>✗ {error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}


          {/* Navigation Tabs */}
          <div className="payments-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </button>
            <button 
              className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
            <button 
              className={`tab ${activeTab === 'credits' ? 'active' : ''}`}
              onClick={() => setActiveTab('credits')}
            >
              Credits Management
            </button>
            <button 
              className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              Credit Packages
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon revenue-icon">$</div>
                  <div className="card-content">
                    <h3>Total Revenue</h3>
                    <div className="card-value">{formatCurrency(paymentOverview.totalRevenue)}</div>
                    <div className="card-subtitle">Year to date</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon pending-icon">⏱</div>
                  <div className="card-content">
                    <h3>Pending Payments</h3>
                    <div className="card-value">{formatCurrency(paymentOverview.pendingPayments)}</div>
                    <div className="card-subtitle">Awaiting payment</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon overdue-icon">!</div>
                  <div className="card-content">
                    <h3>Overdue Invoices</h3>
                    <div className="card-value">{formatCurrency(paymentOverview.overdueInvoices)}</div>
                    <div className="card-subtitle">Past due</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon success-icon">%</div>
                  <div className="card-content">
                    <h3>Success Rate</h3>
                    <div className="card-value">{paymentOverview.paymentSuccessRate}%</div>
                    <div className="card-subtitle">Payment completion</div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-section">
                <div className="chart-container">
                  <h3>Payment Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={paymentOverview.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue" />
                      <Line type="monotone" dataKey="payments" stroke="#10b981" strokeWidth={3} name="Payments" />
                      <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={3} name="Overdue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="invoices-content">
              <div className="section-header">
                <h2>Invoices</h2>
                <div className="filters">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Student</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Paid Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>{invoice.student}</td>
                        <td>{invoice.description}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(invoice.status) }}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td>{formatDate(invoice.dueDate)}</td>
                        <td>{invoice.paidDate ? formatDate(invoice.paidDate) : '-'}</td>
                        <td>
                          <button className="btn btn-small" disabled>
                            View <span className="coming-soon">(Soon)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="payments-content">
              <div className="section-header">
                <h2>Payments</h2>
                <div className="filters">
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Dates</option>
                    <option value="2024-06">June 2024</option>
                    <option value="2024-05">May 2024</option>
                    <option value="2024-04">April 2024</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>{payment.student}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>
                          <span className="payment-method-badge">
                            {getPaymentMethodIcon(payment.method)}
                          </span>
                          <span className="payment-method-text">
                            {payment.method ? payment.method.replace('_', ' ') : 'N/A'}
                          </span>
                        </td>
                        <td>{formatDate(payment.date)}</td>
                        <td>{payment.reference}</td>
                        <td>{payment.notes}</td>
                        <td>
                          <button className="btn btn-small" disabled>
                            Refund <span className="coming-soon">(Soon)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Credits Management Tab */}
          {activeTab === 'credits' && (
            <div className="credits-content">
              <div className="section-header">
                <h2>Credits Management</h2>
                <div className="filters">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddCreditsModal(true)}
                  >
                    Add Credits
                  </button>
                </div>
              </div>

              <div className="credits-grid">
                {filteredCredits.map(student => (
                  <div key={student.studentId} className="credit-card">
                    <div className="credit-header">
                      <h3>{student.student}</h3>
                      <div className="credit-balance">
                        <span className="balance-label">Current Balance:</span>
                        <span className="balance-amount">{student.currentBalance} hours</span>
                      </div>
                    </div>
                    
                    <div className="credit-stats">
                      <div className="stat">
                        <span className="stat-label">Total Purchased:</span>
                        <span className="stat-value">{student.totalPurchased} hours</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Total Used:</span>
                        <span className="stat-value">{student.totalUsed} hours</span>
                      </div>
                    </div>

                    <div className="credit-packages">
                      <h4>Active Packages</h4>
                      {student.packages.length > 0 ? (
                        <div className="package-list">
                          {student.packages.map((pkg, index) => (
                            <div key={index} className="package-item">
                              <div className="package-name">{pkg.name}</div>
                              <div className="package-details">
                                <span>{pkg.remaining}/{pkg.hours} hours remaining</span>
                                <span className="expiry">Expires: {formatDate(pkg.expires)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-packages">No active packages</p>
                      )}
                    </div>

                    <div className="credit-usage">
                      <h4>Recent Usage</h4>
                      <div className="usage-list">
                        {student.recentUsage.slice(0, 3).map((usage, index) => (
                          <div key={index} className="usage-item">
                            <span className="usage-date">{formatDate(usage.date)}</span>
                            <span className="usage-hours">-{usage.hours}h</span>
                            <span className="usage-session">{usage.session}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credit Packages Tab */}
          {activeTab === 'packages' && (
            <div className="packages-content">
              <div className="section-header">
                <h2>Credit Packages</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreatePackageModal(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Package'}
                </button>
              </div>

              <div className="packages-grid">
                {creditPackages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon package-icon">PKG</div>
                    <h3>No Credit Packages</h3>
                    <p>Create your first credit package to get started.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCreatePackageModal(true)}
                    >
                      Create First Package
                    </button>
                  </div>
                ) : (
                  creditPackages.map(pkg => (
                    <div key={pkg.id} className="package-card">
                      <div className="package-header">
                        <h3>{pkg.name}</h3>
                        <div className="package-price">{formatCurrency(pkg.price)}</div>
                      </div>
                      <div className="package-details">
                        <div className="package-hours">{pkg.hours} hours</div>
                        <div className="package-description">{pkg.description}</div>
                      </div>
                      <div className="package-actions">
                        <button 
                          className="btn btn-small"
                          onClick={() => handleEditPackage(pkg)}
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeletePackage(pkg.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Credits to Student</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddCreditsModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddCredits}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Select Student</label>
                  <select 
                    className="form-input"
                    name="studentId"
                    value={addCreditsForm.studentId}
                    onChange={handleAddCreditsChange}
                    required
                  >
                    <option value="">Choose a student...</option>
                    {studentCredits.map(student => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.student}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Package</label>
                  <select 
                    className="form-input"
                    name="timePackageId"
                    value={addCreditsForm.timePackageId}
                    onChange={handleAddCreditsChange}
                    required
                  >
                    <option value="">Choose a package...</option>
                    {creditPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.hours} hours ({formatCurrency(pkg.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Add any notes..."
                    name="notes"
                    value={addCreditsForm.notes}
                    onChange={handleAddCreditsChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddCreditsModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreatePackageModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Credit Package</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreatePackageModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePackage}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Package Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Premium Package"
                    name="name"
                    value={createPackageForm.name}
                    onChange={handleCreatePackageChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hours</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="10"
                    name="hours"
                    value={createPackageForm.hours}
                    onChange={handleCreatePackageChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="450"
                    name="price"
                    value={createPackageForm.price}
                    onChange={handleCreatePackageChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Package description..."
                    name="description"
                    value={createPackageForm.description}
                    onChange={handleCreatePackageChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreatePackageModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditPackageModal && editingPackage && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Credit Package</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditPackageModal(false);
                  setEditingPackage(null);
                  setCreatePackageForm({ name: '', hours: '', price: '', description: '' });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdatePackage}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Package Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Premium Package"
                    name="name"
                    value={createPackageForm.name}
                    onChange={handleCreatePackageChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hours</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="10"
                    name="hours"
                    value={createPackageForm.hours}
                    onChange={handleCreatePackageChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="450"
                    name="price"
                    value={createPackageForm.price}
                    onChange={handleCreatePackageChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Package description..."
                    name="description"
                    value={createPackageForm.description}
                    onChange={handleCreatePackageChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditPackageModal(false);
                    setEditingPackage(null);
                    setCreatePackageForm({ name: '', hours: '', price: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;