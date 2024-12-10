<?php
session_start();

$error_message = '';

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Users_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id_number = $conn->real_escape_string($_POST['id_number']);
    $email = strtolower($conn->real_escape_string($_POST['email']));
    $password = $conn->real_escape_string($_POST['password_input']);

    $sql = "SELECT * FROM users WHERE IdNumber = '$id_number' AND Email = '$email' LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['Password'])) {
            $_SESSION['user_id'] = $user['IdNumber'];
            $_SESSION['user_name'] = $user['FullName'];
            $_SESSION['email'] = $user['Email'];
            header("Location: ../sql/index.php");
            exit();
        } else {
            $error_message = "Incorrect password!";
        }
    } else {
        $error_message = "No user found with this ID and email!";
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <link rel="icon" href="../img/logo.png" type="image/icon type">
  <link rel="stylesheet" href="../css/login-signup.css">
</head>
<body>
  <div class="wrapper">
    <h1>Login</h1>

    <form id="form" method="POST" action="">
      <div>
        <label for="id_number">
          <img src="../img/icons/id.png" style="max-width: 22px;">
        </label>
        <input type="text" name="id_number" id="id_number" placeholder="ID Number" maxlength="9" required>
      </div>

      <div>
        <label for="email">
          <img src="../img/icons/mail.png" style="max-width: 22px;">
        </label>
        <input type="email" name="email" id="email" placeholder="Email" required>
      </div>

      <div>
        <label for="password_input">
          <img src="../img/icons/key.png" style="max-width: 22px;">
        </label>
        <input type="password" name="password_input" id="password_input" placeholder="Password" required>
      </div>

      <?php
      if (!empty($error_message)) {
        echo "<p style='color: red; font-weight: bold;'>$error_message</p>";
    }
      ?>

      <button type="submit" id="submit">Login</button>
    </form>

    <p>New here? <a href="../html/signup.html">Create an Account</a></p>
  </div>

  <script src="../js/BackgroundCycle.js"></script>

  <script>
    const idNumberInput = document.getElementById('id_number');
    idNumberInput.addEventListener('input', function(event) {
      this.value = this.value.replace(/\D/g, '');
    });
  </script>
  
</body>
</html>
