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
    <link rel="icon" href="../img/logo.png" type="image/icon type">
    <link rel="stylesheet" href="../css/personal_info.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>
<body>
    <nav>
        <a href="../sql/index.php" class="logo-link"> <!-- Added an anchor tag around the logo -->
            <div class="logo">
                <img src="../img/logo.png" id="logo-img" class="logo-img" alt="Logo" />
                <h1 id="logo-name" class="logo-name">
                    <span>A</span><span>e</span><span>r</span><span>o</span><span>W</span><span>a</span><span>y</span>
                </h1>
            </div>
        </a>
        <ul>
            <li><a href="./index.php">Order</a></li>
            <li><a href="#" id="user-icon" class="active"><i class="bx bx-user"></i></a></li>
            <li class="sun-moon"><i class="bx bx-sun"></i></li>
        </ul>
    </nav>

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

    <script src="../js/LogoAnimation.js"></script>
    <script src="../js/DarkTheme.js"></script>
</body>
</html>
