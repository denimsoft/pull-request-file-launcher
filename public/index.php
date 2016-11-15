<?php

$config = require __DIR__ . '/../config/config.php';
$params = $_GET + ['project' => '', 'file' => '', 'line' => 0];
$paths = $config['paths'];

if (!isset($paths[$params['project']])) {
    header('HTTP/1.1 404 Not Found');
    echo '<h1>404 Not Found</h1>';
    echo '<h2>Project not configured</h2>';
    echo '<script>setTimeout(function () { window.close(); }, 2000);</script>';
    exit;
}

$file = $paths[$params['project']] . '/' . $params['file'];

if (!file_exists($file)) {
    header('HTTP/1.1 404 Not Found');
    echo '<h1>404 Not Found</h1>';
    echo '<h2>File not found: ' . htmlspecialchars($file) . '</h2>';
    echo '<script>setTimeout(function () { window.close(); }, 2000);</script>';
    exit;
}

$cmd = sprintf('%s --line %d %s', escapeshellarg($config['phpstorm_bin']), $params['line'], escapeshellarg($file));
shell_exec($cmd);
echo '<script>window.close();</script>';