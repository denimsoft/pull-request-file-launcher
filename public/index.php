<?php

require_once __DIR__ . '/../src/functions.php';

// get the repo path from config or try to auto-detect it
// abort if the project is not found
$repos = array_map('envinject', config('paths'));
if (!isset($repos[get('project')])) {
    $repos += git_repos();
    if (!isset($repos[get('project')])) {
        not_found('Project not configured');
    }
}

// abort if the file doesn't exist
$file = $repos[get('project')] . '/' . get('file');
if (!file_exists($file)) {
    not_found('File not found: ' . htmlspecialchars($file));
}

// open the file in the editor
open($file, get('line', 0));