<?php

function config($key = null)
{
    $config = file_exists(__DIR__ . '/../config/config.php')
        ? require __DIR__ . '/../config/config.php'
        : require __DIR__ . '/../config/config.php-dist';
    if ($key) {
        foreach (explode('.', $key) as $key) {
            $config = $config[$key];
        }
    }
    return $config;
}

function envinject($string)
{
    return preg_replace_callback(
        '/\$([a-z_][a-z0-9_]*)/i',
        function ($match) {
            return getenv($match[1]);
        },
        $string);
}

function find($path, array $options = [], array &$found = [], $depth = 1)
{
    if (is_dir($path)) {
        $nodes = array_slice(scandir($path), 2);
        $dirname = rtrim($path, '/');
    } elseif (file_exists($path)) {
        $file = basename($path);
        $nodes[] = $file;
        $dirname = dirname($path);
    } else {
        return $found;
    }
    foreach ($nodes as $basename) {
        $path = "$dirname/$basename";
        $isDir = is_dir($path);
        if (isset($options['min_depth']) && $depth < $options['min_depth']) {
            if (!isset($options['max_depth']) || $depth < $options['max_depth']) {
                if ($isDir) {
                    find($path, $options, $found, $depth + 1);
                }
            }
            continue;
        }
        if (!isset($options['name']) || preg_match('/' . preg_quote($options['name'], '/') . '$/', $path)) {
            if (!isset($options['type']) ||
                (in_array($options['type'], ['file', 'f'], true) && !$isDir) ||
                (in_array($options['type'], ['directory', 'dir', 'd'], true) && $isDir)
            ) {
                $found[] = $path;
            }
        }
        if ($isDir && (!isset($options['max_depth']) || $depth < $options['max_depth'])) {
            find($path, $options, $found, $depth + 1);
        }
    }
    return $found;
}

function get($key, $default = null)
{
    return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
}

function git_configs()
{
    $found = [];
    foreach (config('find.path') as $path) {
        $path = envinject($path);
        if (is_dir($path)) {
            find($path, [
                    'name' => '.git/config',
                    'type' => 'file',
                    'max_depth' => config('find.max_depth'),
                    'min_depth' => config('find.min_depth'),
                ], $found, 1);
        }

    }
    return $found;
}

function git_repos(array $configs = [])
{
    $repos = [];
    if (func_num_args() === 0) {
        $configs = git_configs();
    }
    foreach ($configs as $config) {
        $text = file_get_contents($config);
        if (preg_match('/url = git@bitbucket\.org:(.+)\.git/', $text, $match)) {
            $repo = $match[1];
            $path = dirname(dirname($config));
            $repos[$repo] = $path;
        }
    }
    return $repos;
}

function not_found($message = '')
{
    header('HTTP/1.1 404 Not Found');
    echo '<h1>404 Not Found</h1>';
    if (strlen($message)) {
        echo "<h2>$message</h2>";
    }
    echo '<script>setTimeout(function () { window.close(); }, 2000);</script>';
    exit;
}

function open($file, $line = 0)
{
    $cmd = sprintf('%s --line %d %s', escapeshellarg(config('phpstorm_bin')), $line, escapeshellarg($file));
    shell_exec($cmd);
    echo '<script>window.close();</script>';
    exit;
}