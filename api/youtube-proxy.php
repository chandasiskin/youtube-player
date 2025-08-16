<?php
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
$fields = 'items(id,snippet(title,thumbnails(default(url))),contentDetails(duration))';

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
