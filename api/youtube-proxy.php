<?php
// Get the referer to determine if the request is from the local development
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';

// Check if the host is local
if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
    // Insert headers to counter CORS-issue locally
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST');
    header('Access-Control-Allow-Headers: Content-Type');
}

header("Content-Type: application/json");

// Replace with your actual YouTube API key
$apiKey = ''; // Insert your youtube-key here

// Get video ID from query string
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing video ID"]);
    exit;
}

$videoId = $_GET['id'];
$part = 'id,snippet,contentDetails';
$fields = 'items(id,snippet(title,thumbnails(medium(url))),contentDetails(duration))';

// YouTube API endpoint
$apiUrl = "https://www.googleapis.com/youtube/v3/videos?part=$part&fields=$fields&key=$apiKey&id=$videoId";

// Fetch from YouTube
$response = @file_get_contents($apiUrl);

if ($response === false) {
	http_response_code(502); // Bad Gateway
    echo json_encode(["error" => "Failed to retrieve data from YouTube API"]);
    exit;
}

// Output the response directly
echo $response;