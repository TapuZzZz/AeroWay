<?php
session_start();

if (isset($_SESSION['user_name'])) {
    $user_name = $_SESSION['user_name'];
    $user_email = $_SESSION['email'];
    $user_id = $_SESSION['user_id'];
} else {
    $user_name = '';
    $user_email = '';
    $user_id = '';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Booking</title>
  <link rel="stylesheet" href="../css/style.css">
  <style>
    /* General Styling */
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #e9ecef;
      color: #333;
    }
    a {
      text-decoration: none;
      color: #f62f2f;
    }
    a:hover {
      color: #22577a;
    }

    /* Navbar Styling */
    .navbar {
      background-color: #22577a;
      color: #ffffff;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .navbar nav {
      display: flex;
      gap: 15px;
    }
    .navbar nav a {
      color: #ffffff;
      font-size: 14px;
      transition: color 0.3s;
    }
    .navbar nav a:hover {
      color: #f62f2f;
    }
    .navbar .user-info {
      font-size: 14px;
    }

    /* Header Section */
    .header {
      background-image: url('../images/banner.jpg');
      background-size: cover;
      background-position: center;
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      font-size: 36px;
      margin: 0;
    }
    .header p {
      font-size: 16px;
    }

    /* Search Section */
    .search-bar {
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: -30px 20px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      border-radius: 8px;
    }
    .search-bar input,
    .search-bar select {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      flex: 1;
    }
    .search-bar button {
      padding: 10px 20px;
      background-color: #f62f2f;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .search-bar button:hover {
      background-color: #22577a;
    }

    /* Footer Styling */
    .footer {
      background-color: #22577a;
      color: #ffffff;
      text-align: center;
      padding: 15px 0;
      margin-top: 20px;
      font-size: 14px;
    }
    .footer a {
      color: #f62f2f;
    }
    .footer a:hover {
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="navbar">
    <nav>
      <a href="#">Home</a>
      <a href="#search">Search Flights</a>
      <a href="#offers">Special Offers</a>
    </nav>
    <div class="user-info">
      <?php if ($user_name): ?>
        Logged in as: <?php echo htmlspecialchars($user_name); ?>
      <?php else: ?>
        <a href="../html/login.html">Login</a>
      <?php endif; ?>
    </div>
  </div>

  <div class="header">
    <h1>Flight Booking</h1>
    <p>Book your next adventure today!</p>
  </div>

  <div class="search-bar">
    <input type="text" placeholder="From">
    <input type="text" placeholder="To">
    <input type="date" placeholder="Departure Date">
    <select>
      <option>Economy</option>
      <option>Business</option>
    </select>
    <button>Search</button>
  </div>

  <div class="footer">
    &copy; 2024 Flight Booking Platform. All Rights Reserved.
  </div>
</body>
</html>