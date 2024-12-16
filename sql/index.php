<?php
  session_start();

  if (isset($_SESSION['user_name'])) {
      $user_name = $_SESSION['user_name'];
      $user_email = $_SESSION['email'];
      $user_id = $_SESSION['user_id'];
      $is_logged_in = true;
  } else {
      $user_name = '';
      $user_email = '';
      $user_id = '';
      $is_logged_in = false;
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
  <body>
    <nav>
      <div class="logo">
        <img src="../img/logo.png" id="logo-img" class="logo-img" />
        <h1 id="logo-name" class="logo-name">
          <span>A</span><span>e</span><span>r</span><span>o</span><span>W</span><span>a</span><span>y</span>
        </h1>
      </div>
      <ul>
        <li><a href="#home">Order</a></li>
        <li><a href="#destinations">Destinations</a></li>
        <li><a href="#contact">Help and contact</a></li>
        <li><a href="#" id="user-icon"><i class="bx bx-user"></i></a></li>
        <li class="sun-moon"><i class="bx bx-sun"></i></li>
      </ul>
    </nav>

    <!-- Fullscreen sections -->
    <section class="section home" id="home">
      <div class="home-content">
        <div class="form-container">
          <form action="#" method="POST" class="flight-search-form">
            
          </form>
        </div>
        <div class="img-container">
          <img src="../img/FlightHome.png" alt="AeroWay Image" class="plane-img" />
        </div>
      </div>
    </section>

    <section class="section flights" id="destinations">
      <h1>Flights Section</h1>
    </section>

    <section class="section about">
      <h1>About Us</h1>
    </section>

    <section class="section contact" id="contact">
      <h1>Contact Us</h1>
    </section>

    <!-- Footer -->
    <footer class="footer">

    </footer>

    <script>
      // Check if the user is logged in
      const isLoggedIn = <?php echo json_encode($is_logged_in); ?>;

      // Handle user icon click
      document.getElementById('user-icon').addEventListener('click', function (e) {
        e.preventDefault();
        if (isLoggedIn) {
          // Redirect to personal info page
          window.location.href = 'personal_info.php';
        } else {
          // Redirect to login page
          window.location.href = 'login.php';
        }
      });
    </script>
    <script src="../js/LogoAnimation.js"></script>
    <script src="../js/ScrollReveal.js"></script>
    <script src="../js/DarkTheme.js"></script>
    <script src="../js/NavScroll.js"></script>
    <script src="../js/navHighlight.js"></script>

    <!-- scrollreveal -->
    <script src="https://unpkg.com/scrollreveal"></script>
  </body>
</html>
