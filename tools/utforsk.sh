UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
B=https://www.handball.no/api/AjaxData
h() { curl -sL -A "$UA" "$1" -o "$2" -w "$2 %{http_code} %{size_download}\n" || true; }
h "https://www.handball.no/js/main.bundle.js?v=LwJLDir0E5M8l_8-yQmUhnFrXkutBc2ph5gg-_-LDqY" bundle.js
h "$B/SortedTeamsForClubAsCheckboxes?id=60756" teams_id.json
h "$B/SortedTeamsForClubAsCheckboxes?clubId=60756" teams_clubid.json
h "$B/SortedMatchesForClubsOrTeams?clubIds=60756" m1.json
h "$B/SortedMatchesForClubsOrTeams?id=60756" m2.json
h "$B/SortedMatchesForClubsOrTeams?clubId=60756" m3.json
h "$B/TerminListeForTeam?id=439844" t1.json
h "$B/TerminListeForTeam?teamId=439844" t2.json
