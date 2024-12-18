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
            <div class="form-group">
              <label for="departure">Departure</label>
              <input type="text" id="departure" name="departure" required>
            </div>
            <div class="form-group">
              <label for="arrival">Arrival</label>
              <input type="text" id="arrival" name="arrival" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dep-date">Departure Date</label>
                <input type="date" id="dep-date" name="dep-date" required>
              </div>
              <div class="form-group">
                <label for="arr-date">Arrival Date</label>
                <input type="date" id="arr-date" name="arr-date" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="adults">Adults</label>
                <input type="number" id="adults" name="adults" min="1" value="1" required>
              </div>
              <div class="form-group">
                <label for="children">Children</label>
                <input type="number" id="children" name="children" min="0" value="0">
              </div>
            </div>
            <button type="submit" class="submit-btn">Search Flights</button>
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

    <section class="section about" id="about">
      <h1>About Section</h1>
    </section>

    <section class="section contact" id="contact">
      <h1>Contact Us</h1>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>About AeroWay</h3>
          <p>Your trusted partner for seamless air travel experiences.</p>
        </div>
        <div class="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#destinations">Destinations</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>Connect With Us</h3>
          <div class="social-icons">
            <a href="#" class="social-icon"><i class='bx bxl-facebook'></i></a>
            <a href="#" class="social-icon"><i class='bx bxl-twitter'></i></a>
            <a href="#" class="social-icon"><i class='bx bxl-instagram'></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 AeroWay. All rights reserved.</p>
        <a href="#home" class="scroll-to-top">
          <i class='bx bx-up-arrow-alt'></i>
        </a>
      </div>
    </footer>

    <script>
      const isLoggedIn = <?php echo json_encode($is_logged_in); ?>;

      document.getElementById('user-icon').addEventListener('click', function (e) {
        e.preventDefault();
        if (isLoggedIn) {
          window.location.href = 'personal_info.php';
        } else {
          window.location.href = 'login.php';
        }
      });
    </script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const departureInput = document.getElementById('departure');
        const arrivalInput = document.getElementById('arrival');

        function handleInput(event) {
          event.target.value = event.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
        }

        departureInput.addEventListener('input', handleInput);
        arrivalInput.addEventListener('input', handleInput);
      });
    </script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const input = document.querySelector('.number-input input');
        const incrementBtn = document.querySelector('.number-input .increment');
        const decrementBtn = document.querySelector('.number-input .decrement');

        incrementBtn.addEventListener('click', function() {
          input.stepUp();
        });

        decrementBtn.addEventListener('click', function() {
          input.stepDown();
        });
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
