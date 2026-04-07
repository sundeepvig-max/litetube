import http.server
import socketserver
import urllib.request
import urllib.parse
from urllib.parse import urlparse, parse_qs
import json
import re
import os

PORT = int(os.environ.get("PORT", 3000))

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate') # Force browser not to cache!
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # SEARCH API
        if parsed.path.startswith('/api/search'):
            query = parse_qs(parsed.query).get('q', [''])[0]
            url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
            self.scrape_youtube(url)
            return
            
        # SUGGESTIONS API
        elif parsed.path.startswith('/api/suggest'):
            query = urllib.parse.quote(parse_qs(parsed.query).get('q', [''])[0])
            url = f"http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q={query}"
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
                data = json.loads(html)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data[1]).encode())
            except Exception as e:
                self.send_error_json(str(e))
            return
            
        # TRENDING API
        elif parsed.path.startswith('/api/trending'):
            url = "https://www.youtube.com/results?search_query=trending+viral+videos"
            self.scrape_youtube(url)
            return

        # HOME / INDEX
        if self.path == '/':
            self.path = '/index.html'
        super().do_GET()

    def scrape_youtube(self, url):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            })
            html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
            
            # Extract internal YouTube JSON state
            match = re.search(r'var ytInitialData = (\{.*?\});</script>', html)
            if not match:
                self.send_error_json("No JSON found")
                return
                
            data = json.loads(match.group(1))
            
            # Invincible recursive video extractor
            raw_videos = self.extract_video_renderers(data)
            
            # Format and deduplicate
            items = []
            seen = set()
            for v in raw_videos:
                formatted = self.format_video(v)
                if formatted and formatted['url'] not in seen and formatted['duration'] > 0:
                    items.append(formatted)
                    seen.add(formatted['url'])

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(items).encode())
            
        except Exception as e:
            print("Request crashed:", str(e))
            self.send_error_json(str(e))

    def extract_video_renderers(self, data):
        found = []
        if isinstance(data, dict):
            for k, v in data.items():
                if k == 'videoRenderer':
                    found.append(v)
                else:
                    found.extend(self.extract_video_renderers(v))
        elif isinstance(data, list):
            for item in data:
                found.extend(self.extract_video_renderers(item))
        return found

    def format_video(self, renderer):
        # Graceful metadata extraction
        try:
            return {
                "type": "stream",
                "url": f"/watch?v={renderer.get('videoId', '')}",
                "title": renderer.get('title', {}).get('runs', [{}])[0].get('text', 'No Title'),
                "thumbnail": renderer.get('thumbnail', {}).get('thumbnails', [{}])[-1].get('url', ''),
                "uploaderName": renderer.get('ownerText', {}).get('runs', [{}])[0].get('text', 'Unknown'),
                "uploaderAvatar": renderer.get('channelThumbnailSupportedRenderers', {}).get('channelThumbnailWithLinkRenderer', {}).get('thumbnail', {}).get('thumbnails', [{}])[0].get('url', ''),
                "duration": self.parse_length(renderer.get('lengthText', {}).get('simpleText', '0:00')),
                "views": renderer.get('viewCountText', {}).get('simpleText', '').split(' ')[0],
                "uploadedDate": renderer.get('publishedTimeText', {}).get('simpleText', 'Recently')
            }
        except Exception:
            return {}

    def parse_length(self, time_str):
        # Convert "12:34" to seconds for frontend formatting consistency
        parts = time_str.split(':')
        if len(parts) == 3: return int(parts[0])*3600 + int(parts[1])*60 + int(parts[2])
        if len(parts) == 2: return int(parts[0])*60 + int(parts[1])
        return 0

    def send_error_json(self, msg):
        self.send_response(500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": msg}).encode())

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"==================================================")
    print(f"🚀 LiteTube WebScraper Proxy ACTIVE on Port {PORT}")
    print(f"==================================================")
    httpd.serve_forever()
