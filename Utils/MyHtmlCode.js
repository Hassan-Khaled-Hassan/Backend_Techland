

const MyHtmlCode = (name, resetCode, mail) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        /* CSS styles */
        .container {
            background-color: #f1f8fe; /* Sky blue background color */
            color: white; /* White text color */
            padding: 20px;
            border-radius: 20px; /* Add padding for better visibility */
        }
        .container .message-org{
            display:flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <!-- HTML content -->
    <div class="container">
        <div class="message">
            <div class="message-org">
                <p style="font-size:30px;margin:20px;text-align:center">Hi ${name}</p>
                <img src="https://res.cloudinary.com/dsccvadus/image/upload/v1737579464/siwa_logo-removebg-preview_lgwpwx.png" style="width:176px;height:49px;margin:7px"/>
            </div>
            <p style="font-size:20px;margin:26px;text-align:center">We received a request to reset your password. Please use the following code to reset your password</p>
            <h2 style="text-align: center;font-size:30px;">${resetCode}</h2>
            <p style="font-size:20px;margin:26px;">If You hanve any problem,<br/> please mail us on : <a style="color:#0a6dff" href="mailto:${mail}">${mail}</a>
            </p>
        </div>
        <p style="margin:26px;">Thank You</p>
        <p style="margin:26px;">Siwa Garden Support Team</p>
    </div>
</body>
</html>`;

module.exports = MyHtmlCode;