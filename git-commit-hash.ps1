$hash = git rev-parse HEAD
"{""commitHash"": ""$hash""}" | Out-File -FilePath "commit-hash.json" -Encoding utf8
