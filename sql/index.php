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
        <li><a href="#home">Home</a></li>
        <li><a href="#">Destinations</a></li>
        <li><a href="#">Help and contact</a></li>
        <li><a href="#" id="user-icon"><i class="bx bx-user"></i></a></li>
        <li class="sun-moon"><i class="bx bx-sun"></i></li>
      </ul>
    </nav>

    <!-- Fullscreen sections -->
    <section class="section home" id="home">
      <div class="home-content">
        <div class="form-container">
          <h2>Book You'r Next Flight</h2>
          <form action="#" method="POST" class="flight-search-form">
            <div class="input-group">
              <div class="input-item">
                <label for="departure-city">Departure City:</label>
                <input type="text" id="departure-city" name="departure-city" placeholder="Enter departure city" required>
              </div>
              <div class="input-item">
                <label for="destination-city">Destination City:</label>
                <input type="text" id="destination-city" name="destination-city" placeholder="Enter destination city" required>
              </div>
            </div>

            <div class="input-group">
              <div class="input-item">
                <label for="departure-date">Departure Date:</label>
                <input type="date" id="departure-date" name="departure-date" required>
              </div>
              <div class="input-item">
                <label for="return-date">Return Date:</label>
                <input type="date" id="return-date" name="return-date" required>
              </div>
            </div>

            <button class="CartBtn">
              <span class="IconContainer">
                <svg viewBox="0 0 13 13" width="18px">
                  <path
                    fill="white"
                    d="M1.55989957,5.41666667 L5.51582215,5.41666667 L4.47015462,0.108333333 L4.47015462,0.108333333 C4.47015462,0.0634601974 4.49708054,0.0249592654 4.5354546,0.00851337035 L4.57707145,0 L5.36229752,0 C5.43359776,0 5.50087375,0.028779451 5.55026392,0.0782711996 L5.59317877,0.134368264 L7.13659662,2.81558333 L8.29565964,2.81666667 C8.53185377,2.81666667 8.72332694,3.01067661 8.72332694,3.25 C8.72332694,3.48932339 8.53185377,3.68333333 8.29565964,3.68333333 L7.63589819,3.68225 L8.63450135,5.41666667 L11.9308317,5.41666667 C12.5213171,5.41666667 13,5.90169152 13,6.5 C13,7.09830848 12.5213171,7.58333333 11.9308317,7.58333333 L8.63450135,7.58333333 L7.63589819,9.31666667 L8.29565964,9.31666667 C8.53185377,9.31666667 8.72332694,9.51067661 8.72332694,9.75 C8.72332694,9.98932339 8.53185377,10.1833333 8.29565964,10.1833333 L7.13659662,10.1833333 L5.59317877,12.8656317 C5.55725264,12.9280353 5.49882018,12.9724157 5.43174295,12.9907056 L5.36229752,13 L4.57707145,13 L4.55610333,12.9978962 C4.51267695,12.9890959 4.48069792,12.9547924 4.47230803,12.9134397 L4.47223088,12.8704208 L5.51582215,7.58333333 L1.55989957,7.58333333 L0.891288881,8.55114605 C0.853775374,8.60544678 0.798421006,8.64327676 0.73629202,8.65879796 L0.672314689,8.66666667 L0.106844414,8.66666667 L0.0715243949,8.66058466 L0.0715243949,8.66058466 C0.0297243066,8.6457608 0.00275502199,8.60729104 0,8.5651586 L0.00593007386,8.52254537 L0.580855011,6.85813984 C0.64492547,6.67265611 0.6577034,6.47392717 0.619193545,6.28316421 L0.580694768,6.14191703 L0.00601851064,4.48064746 C0.00203480725,4.4691314 0,4.45701613 0,4.44481314 C0,4.39994001 0.0269259152,4.36143908 0.0652999725,4.34499318 L0.106916826,4.33647981 L0.672546853,4.33647981 C0.737865848,4.33647981 0.80011301,4.36066329 0.848265401,4.40322477 L0.89131128,4.45169723 L1.55989957,5.41666667 Z"
                  ></path>
                </svg>
              </span>
              <p class="text">Book Flight</p>
            </button>
          </form>
        </div>
        <div class="img-container">
          <img src="../img/FlightHome.png" alt="AeroWay Image" class="plane-img" />
        </div>
      </div>
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
      <p>&copy; 2024 AeroWay | All rights reserved.</p>
      <ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
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
    <!-- scrollreveal -->
    <script src="https://unpkg.com/scrollreveal"></script>
  </body>
</html>
