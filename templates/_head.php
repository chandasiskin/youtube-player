<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Youtube-playlist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="favicon.png?<?= filemtime('favicon.png'); ?>">
        <link rel="stylesheet" href="style.css?<?= filemtime('style.css'); ?>">
        <script src="js.js?<?= filemtime('js.js'); ?>" defer></script>
    </head>

    <body>
        <header>
            <nav>
                <form action="index.php" id="form_add_song" method="post">
                    <input id="add_song" name="add_song" placeholder="<?= $_POST['add_song'] ?? 'Add song'; ?>" type="text" />
                </form>
            </nav>
        </header>
        <main>
