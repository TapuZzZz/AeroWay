using System;
using System.Text;

namespace AeroWayServer.Pages
{
    public static class LoginPage
    {
        public static string GenerateLoginHtml(string? message)
        {
            return @"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>AeroWay - Login</title>
                <link href='https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap' rel='stylesheet'>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Syne', sans-serif;
                        background: #0a0912;
                        position: relative;
                        overflow: hidden;
                    }

                    .meteor-shower {
                        position: fixed;
                        width: 100vw;
                        height: 100vh;
                        transform: rotate(-35deg);
                        left: -50%;
                        top: 0;
                        pointer-events: none;
                    }

                    .meteor {
                        position: absolute;
                        height: 1px;
                        width: 100px;
                        background: linear-gradient(90deg, #a78bfa, transparent);
                        animation: meteor 2s linear infinite;
                        animation-delay: var(--delay);
                        opacity: 0.7;
                    }

                    @keyframes meteor {
                        0% { transform: translateX(0) translateY(0); opacity: 0.7; }
                        70% { opacity: 0.7; }
                        100% { transform: translateX(1000px) translateY(1000px); opacity: 0; }
                    }

                    .container {
                        position: relative;
                        width: 100%;
                        max-width: 400px;
                        margin: 20px;
                        padding: 40px;
                        background: #13111d;
                        border-radius: 16px;
                        border: 1px solid #2c2640;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        overflow: hidden;
                        z-index: 1;
                        animation: containerPulse 3s ease-in-out infinite;
                    }

                    @keyframes containerPulse {
                        0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        50% { box-shadow: 0 25px 50px -12px rgba(167, 139, 250, 0.1); }
                    }

                    .title {
                        font-size: 36px;
                        font-weight: 700;
                        text-align: center;
                        margin-bottom: 8px;
                        color: #a78bfa;
                        letter-spacing: 1px;
                        animation: titleGlow 3s ease-in-out infinite;
                    }

                    @keyframes titleGlow {
                        0%, 100% { text-shadow: 0 0 20px rgba(167, 139, 250, 0); }
                        50% { text-shadow: 0 0 20px rgba(167, 139, 250, 0.2); }
                    }

                    .subtitle {
                        color: #6d6684;
                        text-align: center;
                        font-size: 14px;
                        margin-bottom: 35px;
                        letter-spacing: 2px;
                    }

                    .input-group {
                        margin-bottom: 20px;
                        position: relative;
                        transition: transform 0.3s ease;
                    }

                    .input-group:hover {
                        transform: translateX(5px);
                    }

                    .input {
                        width: 100%;
                        padding: 16px;
                        background: #1a1727;
                        border: 1px solid #2c2640;
                        border-radius: 12px;
                        color: #e6e6e6;
                        font-size: 15px;
                        transition: all 0.3s ease;
                        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        letter-spacing: 0.3px;
                    }

                    .input:focus {
                        outline: none;
                        border-color: #a78bfa;
                        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
                        background: #1e1b2d;
                    }

                    .input::placeholder {
                        color: #4c4663;
                    }

                    .button {
                        width: 100%;
                        padding: 16px;
                        background: linear-gradient(135deg, #a78bfa, #8b5cf6);
                        border: none;
                        border-radius: 12px;
                        color: #ffffff;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        letter-spacing: 1px;
                        margin-top: 10px;
                        position: relative;
                        overflow: hidden;
                    }

                    .button::after {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: linear-gradient(45deg, 
                            transparent, 
                            rgba(255, 255, 255, 0.1), 
                            transparent);
                        transform: rotate(45deg);
                        animation: buttonShine 3s linear infinite;
                    }

                    @keyframes buttonShine {
                        0% { transform: translateX(-100%) rotate(45deg); }
                        100% { transform: translateX(100%) rotate(45deg); }
                    }

                    .button:hover {
                        transform: translateY(-2px);
                        filter: brightness(1.1);
                    }

                    .footer {
                        text-align: center;
                        color: #4c4663;
                        font-size: 13px;
                        margin-top: 35px;
                        letter-spacing: 1px;
                    }

                    .error {
                        background: rgba(255, 82, 82, 0.1);
                        border: 1px solid rgba(255, 82, 82, 0.2);
                        color: #ff5252;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        margin-bottom: 24px;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    @media (max-width: 480px) {
                        .container {
                            margin: 15px;
                            padding: 30px;
                        }

                        .title {
                            font-size: 30px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class='meteor-shower'>
                    " + string.Join("\n", Enumerable.Range(1, 10).Select(i => $@"
                    <div class='meteor' style='top: {Random.Shared.Next(0, 90)}%; --delay: {Random.Shared.Next(0, 2000)}ms'></div>")) + @"
                </div>
                
                <div class='container'>
                    <div class='title'>AEROWAY</div>
                    <div class='subtitle'>SECURE SERVER MANAGEMENT</div>

                    " + (message != null ? @"
                    <div class='error'>" + message + @"</div>
                    " : "") + @"

                    <form action='/login' method='POST'>
                        <div class='input-group'>
                            <input type='text' name='username' class='input' placeholder='Username' required autocomplete='username'>
                        </div>
                        <div class='input-group'>
                            <input type='password' name='password' class='input' placeholder='Password' required autocomplete='current-password'>
                        </div>
                        <button type='submit' class='button'>LOGIN</button>
                    </form>

                    <div class='footer'>
                        © " + DateTime.Now.Year + @" AEROWAY · SECURE ACCESS ONLY
                    </div>
                </div>
            </body>
            </html>";
        }
    }
}