import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../KopagPOS.css";

const KopagPOS = () => {
  // State Management
  const [activeCategory, setActiveCategory] = useState('Main course');
  const [orderList, setOrderList] = useState([
    { id: 1, name: 'Vinicius Bayu', table: 3, items: 3, status: 'Cancelled', orderNumber: '#12532' },
    { id: 2, name: 'Cheryl Arema', table: 3, items: 3, status: 'Ready to Serve', orderNumber: '#12532' },
    { id: 3, name: 'Kylian Rex', table: 6, items: 12, status: 'Waiting', orderNumber: '#12531' },
    { id: 4, name: 'Rijal Arudam', table: 26, items: 3, status: 'Completed', orderNumber: '#12529' },
    { id: 5, name: 'Ed Berni', table: 1, items: 3, status: 'Completed', orderNumber: '#12528' }
  ]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  const [cart, setCart] = useState([
    { id: 1, name: 'Crispy Dory Sambal Matah', quantity: 2, price: 101.00, image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg' },
    { id: 2, name: 'Spicy Tuna Nachos', quantity: 1, price: 75.00, image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg' },
    { id: 3, name: 'Butterscotch', quantity: 3, price: 35.00, image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg' }
  ]);
  
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Crispy Dory Sambal Matah',
      description: 'Crispy Dory fillets served with homemade Indonesian traditional mouth-watering...',
      price: 101.00,
      available: 12,
      sold: 6,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Kopag Benedict',
      description: 'Home-made creation of the legendary poached eggs over bacon and butter...',
      price: 75.00,
      available: 0,
      sold: 32,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.5
    },
    {
      id: 3,
      name: 'Holland Bitterballen',
      description: 'Deep-fried bite sized balls made of meat mixture of beef and chicken, served w...',
      price: 50.50,
      available: 12,
      sold: 0,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Dory En Oats',
      description: 'Fresh dory fillet cooked in crushed oats and fried to a crunchy crisp. Serve...',
      price: 75.00,
      available: 0,
      sold: 32,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.3
    },
    {
      id: 5,
      name: 'Lemon Butter Dory',
      description: 'Dory fish fillet seasoned with herbs, served with fettuccine and creamy lemon butter...',
      price: 101.00,
      available: 12,
      sold: 6,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.9
    },
    {
      id: 6,
      name: 'Spicy Tuna Nachos',
      description: 'Spicy tuna on bed of crunchy nacho chips',
      price: 75.00,
      available: 0,
      sold: 32,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.6
    },
    {
      id: 7,
      name: 'Alfredo',
      description: 'Lightly Seasoned Grilled chicken breast strips and mushroom tossed in a rich...',
      price: 85.00,
      available: 12,
      sold: 6,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.4
    },
    {
      id: 8,
      name: 'Banana Wrap',
      description: 'Highly acclaimed wrapped banana brown fried bananas (Served with grated cheese...',
      price: 45.00,
      available: 12,
      sold: 6,
      image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/FOOD_CATALOG/IMAGES/CMS/2024/8/6/5c3faa19-6db8-4839-a2b6-33b2645fec61_f161696d-a419-49eb-9ac0-95e2496aae0c.jpeg',
      category: 'Main course',
      rating: 4.2
    }
  ]);

  const categories = ['Appetizer', 'Main course', 'Dessert', 'Beverage'];

  // Helper Functions
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Cancelled': 'danger',
      'Ready to Serve': 'success',
      'Waiting': 'warning',
      'Completed': 'primary'
    };
    return statusMap[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const textMap = {
      'Cancelled': 'CANCELLED',
      'Ready to Serve': 'READY TO SERVE',
      'Waiting': 'WAITING',
      'Completed': 'COMPLETED'
    };
    return textMap[status] || status.toUpperCase();
  };

  const handleQuantityChange = (itemId, change) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleAddToCart = (menuItem) => {
    const existingItem = cart.find(item => item.id === menuItem.id);
    if (existingItem) {
      handleQuantityChange(menuItem.id, 1);
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleOrderClick = (order) => {
    setSelectedCustomer(order);
    setCustomerName(order.name);
    setSelectedTable(`Table ${order.table}`);
  };

  const handleProcessTransaction = () => {
    alert('Processing transaction...');
  };

  const handleNewOrder = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setSelectedTable('');
    setCart([]);
  };

  const isItemInCart = (itemId) => {
    return cart.some(item => item.id === itemId);
  };

  return (
    <div className="kopag-pos-container page-wrapper">
      {/* Main Content Area */}
      <div className="main-content-wrapper d-flex">
        {/* Left Section - Orders & Menu */}
        <div className="left-section flex-grow-1 p-4">
          {/* Order List Section */}
          <div className="order-list-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Order List</h5>
              <a href="#" className="text-decoration-none text-primary fw-semibold">See All</a>
            </div>
            
            <div className="order-cards-container d-flex gap-3 overflow-auto pb-2">
              {orderList.map(order => (
                <div 
                  key={order.id} 
                  className={`order-card card ${selectedCustomer?.id === order.id ? 'border-primary active' : ''}`}
                  onClick={() => handleOrderClick(order)}
                  style={{ minWidth: '200px', cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-semibold order-name">{order.name}</h6>
                        <small className="text-muted d-block">{order.items} items • Table {order.table}</small>
                      </div>
                      <span className="text-muted small order-number">{order.orderNumber}</span>
                    </div>
                    <span className={`badge badge-${getStatusBadgeClass(order.status)} mt-2`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs-section mb-4 d-flex justify-content-between align-items-center">
            <ul className="nav nav-pills category-tabs">
              {categories.map(category => (
                <li className="nav-item me-2" key={category}>
                  <button
                    className={`nav-link category-pill ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
            <button 
              className="btn btn-primary new-order-btn d-flex align-items-center"
              onClick={handleNewOrder}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Order
            </button>
          </div>

          {/* Menu Section */}
          <div className="menu-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Menu</h5>
              <span className="text-muted items-count">Showing {menuItems.filter(item => item.category === activeCategory).length} items</span>
            </div>

            <div className="row row-cols-1 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 g-4">
              {menuItems.filter(item => item.category === activeCategory).map(item => (
                <div key={item.id} className="col">
                  <div className={`menu-card card h-100 ${isItemInCart(item.id) ? 'card-active' : 'card-inactive'} ${item.available === 0 ? 'card-disabled' : ''}`}>
                    <div className="position-relative menu-image-wrapper">
                      <img 
                        src={item.image} 
                        className="card-img-top menu-item-image" 
                        alt={item.name}
                      />
                      {item.available === 0 && (
                        <div className="out-of-stock-overlay">
                          <span className="badge badge-out-of-stock">Out Of Stock</span>
                        </div>
                      )}
                      {isItemInCart(item.id) && item.available > 0 && (
                        <div className="in-cart-indicator">
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title fw-bold mb-2">{item.name}</h6>
                      <p className="card-text text-muted small mb-3 flex-grow-1">
                        {item.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-2 availability-info">
                        <small className="text-muted">
                          {item.available} Available • {item.sold} Sold
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center menu-card-footer">
                        <span className="price-tag fw-bold">${item.price.toFixed(2)}</span>
                        <div className="quantity-controls d-flex align-items-center">
                          <button 
                            className="btn btn-outline-secondary btn-sm btn-quantity rounded-circle" 
                            onClick={() => {
                              const cartItem = cart.find(ci => ci.id === item.id);
                              if (cartItem && cartItem.quantity > 1) {
                                handleQuantityChange(item.id, -1);
                              } else if (cartItem && cartItem.quantity === 1) {
                                handleRemoveFromCart(item.id);
                              }
                            }}
                            disabled={!cart.find(ci => ci.id === item.id)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="quantity-display mx-2 fw-bold">
                            {cart.find(ci => ci.id === item.id)?.quantity || 0}
                          </span>
                          <button 
                            className="btn btn-primary btn-sm btn-quantity rounded-circle" 
                            onClick={() => handleAddToCart(item)}
                            disabled={item.available === 0}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Customer Info & Cart */}
        <div className="right-section border-start">
          <div className="right-section-inner">
            {/* Customer Information */}
            <div className="customer-info-section mb-4">
              <h5 className="section-title fw-bold mb-3">Customer Information</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Customer Name</label>
                <input 
                  type="text" 
                  className="form-control custom-input" 
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Select Table</label>
                <div className="dropdown">
                  <button 
                    className="form-select custom-select d-flex justify-content-between align-items-center" 
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <span>{selectedTable || 'Select table'}</span>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-custom w-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(table => (
                      <li key={table}>
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedTable(`Table ${table}`);
                          }}
                        >
                          Table {table}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="order-details-section mb-4">
              <h5 className="section-title fw-bold mb-3">Order Details</h5>
              <div className="cart-items-container custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="empty-cart-state text-center py-5">
                    <div className="empty-cart-icon mb-3">
                      <i className="bi bi-cart-x"></i>
                    </div>
                    <p className="text-muted mb-0">No items in cart</p>
                    <small className="text-muted">Add items from menu to start</small>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item card mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="cart-item-image rounded"
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold cart-item-name">{item.name}</h6>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="quantity-controls-cart d-flex align-items-center">
                                <button 
                                  className="btn btn-outline-secondary btn-sm btn-cart-quantity rounded-circle" 
                                  onClick={() => {
                                    if (item.quantity === 1) {
                                      handleRemoveFromCart(item.id);
                                    } else {
                                      handleQuantityChange(item.id, -1);
                                    }
                                  }}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="quantity-display-cart mx-2 fw-bold">{item.quantity}</span>
                                <button 
                                  className="btn btn-primary btn-sm btn-cart-quantity rounded-circle" 
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                              <span className="fw-bold cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-link text-danger btn-sm p-0 mt-2 remove-btn"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <i className="bi bi-trash me-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-section">
              <h5 className="section-title fw-bold mb-3">Order Summary</h5>
              <div className="summary-details">
                <div className="summary-row d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row d-flex justify-content-between mb-3">
                  <span className="text-muted">Tax (10%)</span>
                  <span className="fw-semibold">${calculateTax().toFixed(2)}</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-total d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-5 total-amount">${calculateTotal().toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary btn-process w-100 py-3 fw-bold"
                  onClick={handleProcessTransaction}
                  disabled={cart.length === 0 || !customerName || !selectedTable}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Process Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KopagPOS;
