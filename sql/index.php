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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>AeroWay</title>
    <link rel="icon" href="../img/logo.png" type="image/icon type">
    <link rel="stylesheet" href="../css/index.css" />
    <!-- box icons -->
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
  </head>
  <body class="">
    <nav>
      <div class="logo">
        <img src="../img/logo.png" id="logo-img" class="logo-img" />
        <h1 id="logo-name" class="logo-name">
          <span>A</span><span>e</span><span>r</span><span>o</span><span>W</span><span>a</span><span>y</span>
        </h1>
      </div>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Flights</a></li>
        <li><a href="#"><i class="bx bx-user"></i></a></li>
        <li><a href="#"><i class="bx bx-sun"></i></a></li>
      </ul>
    </nav>

    <!-- Fullscreen sections -->
    <section class="section home">
      <h1>Welcome to AeroWay</h1>
    </section>

    <section class="section flights">
      <h1>Flights Section</h1>
    </section>

    <section class="section about">
      <h1>About Us</h1>
    </section>

    <section class="section contact">
      <h1>Contact Us</h1>
    </section>
    <!-- Footer -->
    <footer>
      <p>&copy; 2024 Your Company | All rights reserved.</p>
      <ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </footer>

    <script src="../js/LogoAnimation.js"></script>
    <script src="../js/ScrollReveal.js"></script>
    <script src="../js/DarkTheme.js"></script>
    <!-- scrollreveal -->
    <script src="https://unpkg.com/scrollreveal"></script>
  </body>
</html>
