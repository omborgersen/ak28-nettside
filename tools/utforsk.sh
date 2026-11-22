UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
h() { curl -sL -A "$UA" "$1" -o "$2" -w "$2 %{http_code} %{size_download}\n" || true; }
h "https://www.handball.no/system/klubbdagbok/?clubId=60756" klubbdagbok.html
h "https://www.handball.no/system/kamper/lag/?lagid=439844" lag.html
h "https://www.handball.no/system/kamper/klubb/?klubbid=60756" klubb.html
