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
    <!-- box icons -->
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
  </head>
  <body>
    <nav>
      <div class="logo">
        <img src="../img/logo.png" id="logo-img" class="logo-img" />
        <h1 id="logo-name" class="logo-name">
          <span>A</span><span>e</span><span>r</span><span>o</span><span>W</span><span>a</span><span>y</span>
        </h1>
      </div>
      <ul>
        <li><a href="#">1</a></li>
        <li><a href="#">2</a></li>
        <li><a href="#">3</a></li>
        <li><a href="#">4</a></li>
      </ul>
    </nav>

    <script src="../js/DarkTheme.js"></script>
    <script src="../js/LogoAnimation.js"></script>
    <script src="../js/ScrollReveal.js"></script>
    <!-- scrollreveal -->
    <script src="https://unpkg.com/scrollreveal"></script>
  </body>
</html>
