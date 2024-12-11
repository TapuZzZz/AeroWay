<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_name'])) {
    // Redirect to login page if not logged in
    header("Location: login.php");
    exit;
}

// Retrieve user information from the session
$user_name = $_SESSION['user_name'];
$user_email = $_SESSION['email'];
$user_id = $_SESSION['user_id'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Personal Information</title>
    <link rel="stylesheet" href="../css/personal_info.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>
<body>
    <header>
        <nav>
            <div class="logo">
                <a href="index.php">
                    <img src="../img/logo.png" alt="Logo" class="logo-img">
                    <h1 class="logo-name">AeroWay</h1>
                </a>
            </div>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="flights.php">Flights</a></li>
                <li><a href="logout.php"><i class="bx bx-log-out"></i> Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="personal-info">
            <h1>Welcome, <?php echo htmlspecialchars($user_name); ?>!</h1>
            <div class="info-card">
                <h2>Your Information</h2>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($user_name); ?></p>
                <p><strong>Email:</strong> <?php echo htmlspecialchars($user_email); ?></p>
                <p><strong>User ID:</strong> <?php echo htmlspecialchars($user_id); ?></p>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 AeroWay | All rights reserved.</p>
        <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact</a></li>
        </ul>
    </footer>
</body>
</html>
