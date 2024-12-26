<?php
// דרישות בסיסיות
set_time_limit(0);
error_reporting(E_ALL);

// יצירת שרת TCP בסיסי
$host = '127.0.0.1';
$port = 8080;
$sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_bind($sock, $host, $port);
socket_listen($sock);

class ClientHandler extends Thread {
    private $client;

    public function __construct($client) {
        $this->client = $client;
    }

    public function run() {
        // קבלת בקשה מהלקוח
        $request = socket_read($this->client, 1024);
        echo "\nRequest Received:\n" . $request;

        // ניתוח הבקשה כדי להחליט על הנתיב
        $lines = explode("\r\n", $request);
        $firstLine = $lines[0];
        preg_match('/GET \/([^ ]*) HTTP\//', $firstLine, $matches);
        $path = isset($matches[1]) && $matches[1] !== '' ? $matches[1] : 'index.php';

        // הגדרת הנתיב המלא לקובץ
        $filePath = __DIR__ . '/../' . $path;

        if (file_exists($filePath)) {
            ob_start();
            include $filePath;
            $content = ob_get_clean();

            $response = "HTTP/1.1 200 OK\r\n";
            $response .= "Content-Type: text/html\r\n\r\n";
            $response .= $content;
        } else {
            $response = "HTTP/1.1 404 Not Found\r\n";
            $response .= "Content-Type: text/html\r\n\r\n";
            $response .= "<h1>404 Not Found</h1>";
        }

        socket_write($this->client, $response);
        socket_close($this->client);
    }
}

while (true) {
    $client = socket_accept($sock);
    echo "\nNew Connection Established\n";

    // יצירת thread חדש עבור כל חיבור
    $thread = new ClientHandler($client);
    $thread->start();
}

socket_close($sock);
?>
