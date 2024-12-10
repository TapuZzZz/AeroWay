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
    <link rel="stylesheet" href="../css/index.css" />
    <!-- Google Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </head>
  <body>
    <nav>
      <div class="logo">
        <img src="../img/logo.png" alt="AeroWay Logo" />
        <h1 id="logo-name">
          <span>A</span><span>e</span><span>r</span><span>o</span><span>W</span><span>a</span><span>y</span>
        </h1>
      </div>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Flights</a></li>
        <li><a href="#"> <span class="material-icons">account_circle</span> </a></li> <!-- User Info Icon -->
        <li><a href="#" id="theme-toggle"> <span class="material-icons">brightness_4</span> </a></li> <!-- Theme Change Icon -->
      </ul>
    </nav>

    <script src="../js/DarkTheme.js"></script>
    <script src="../js/LogoAnimation.js"></script>
  </body>
</html>
