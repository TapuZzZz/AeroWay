<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Users_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = $conn->real_escape_string($_POST['name']);
    $id_number = $conn->real_escape_string($_POST['IDnumber']);
    $email = strtolower($conn->real_escape_string($_POST['email']));
    $password = $conn->real_escape_string($_POST['password']);
    $repeat_password = $conn->real_escape_string($_POST['repeat-password']);
    $full_name = ucwords(strtolower($full_name));

    $id_check_query = "SELECT * FROM users WHERE IdNumber = '$id_number' OR Email = '$email' LIMIT 1";
    $result = $conn->query($id_check_query);

    $error = "";

    switch (true) {
        case ($result->num_rows > 0):
            $error = "<p style='color: red;'>Error: This ID number or email already exists!</p>";
            break;
        case (!preg_match("/^[a-zA-Z\s]+$/", $full_name)):
            $error = "<p style='color: red;'>Error: Full name must consist of only English letters and spaces!</p>";
            break;
        case (str_word_count($full_name) < 2):
            $error = "<p style='color: red;'>Error: Full name must consist of two words!</p>";
            break;
        case (!preg_match("/^\d{9}$/", $id_number)):
            $error = "<p style='color: red;'>Error: ID number must be exactly 9 digits and contain only numbers!</p>";
            break;
        case (!filter_var($email, FILTER_VALIDATE_EMAIL)):
            $error = "<p style='color: red;'>Error: Invalid email format! Only English characters allowed.</p>";
            break;
        case ($password !== $repeat_password):
            $error = "<p style='color: red;'>Error: Passwords do not match!</p>";
            break;
        default:
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO users (FullName, IdNumber, Email, Password) VALUES ('$full_name', '$id_number', '$email', '$hashed_password')";

            if ($conn->query($sql) === TRUE) {
                header("Location: ../html/login.html");
                exit();
            } else {
                $error = "<p style='color: red;'>Error: " . $conn->error . "</p>";
            }
            break;
    }

    if ($error) {
        echo $error;
    }
}

$conn->close();
?>
