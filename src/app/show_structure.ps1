param (
    [string]$startPath = ".",
    [string]$outputFile = "structure_output.txt"
)

function Show-DirectoryStructure {
    param (
        [string]$path,
        [string]$outputFile
    )

    # Get all directories and files
    $items = Get-ChildItem -Path $path -Recurse

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Add-Content -Path $outputFile -Value "Directory: $($item.FullName)"
            Add-Content -Path $outputFile -Value "-----------------"
            Add-Content -Path $outputFile -Value ""
        } else {
            if ($item.Extension -eq ".ts" -or $item.Extension -eq ".html") {
                Add-Content -Path $outputFile -Value "File: $($item.FullName)"
                Add-Content -Path $outputFile -Value "-----------------"
                Get-Content -Path $item.FullName | Add-Content -Path $outputFile
                Add-Content -Path $outputFile -Value ""
            }
        }
    }
}

# Ensure the start path is absolute
$startPath = (Resolve-Path $startPath).Path

# Clear the output file if it exists, or create it if it doesn't
if (Test-Path $outputFile) {
    Clear-Content -Path $outputFile
} else {
    New-Item -Path $outputFile -ItemType File
}

Show-DirectoryStructure -path $startPath -outputFile $outputFile
