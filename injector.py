import socket
import json
import struct
import urllib.request
import time
import os

def evaluate_js(port, path, expression):
    """
    Connects to the WebSocket, evaluates the JS expression, and returns the response.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    try:
        s.connect(('localhost', port))
        
        # WebSocket Handshake
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: localhost:{port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        s.sendall(handshake.encode('utf-8'))
        
        resp = b""
        while b"\r\n\r\n" not in resp:
            chunk = s.recv(1024)
            if not chunk:
                break
            resp += chunk
            
        if b"101" not in resp:
            s.close()
            return None
            
        # Build Chrome DevTools Protocol (CDP) payload
        payload = json.dumps({
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression
            }
        })
        
        payload_bytes = payload.encode('utf-8')
        length = len(payload_bytes)
        frame = bytearray([0x81])
        if length <= 125:
            frame.append(0x80 | length)
        elif length <= 65535:
            frame.append(0x80 | 126)
            frame.extend(struct.pack('>H', length))
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack('>Q', length))
            
        frame.extend([0, 0, 0, 0])  # Masking key (all 0s)
        frame.extend(payload_bytes)
        
        s.sendall(frame)
        
        # Read response
        data = s.recv(4096)
        s.close()
        return data
    except Exception:
        try:
            s.close()
        except Exception:
            pass
        return None

def is_clicker_loaded(port, path):
    try:
        res = evaluate_js(port, path, "!!window.__antigravityClickerLauncher")
        if res and b'"value":true' in res:
            return True
    except Exception:
        pass
    return False

def inject_clicker(port, path, js_code):
    try:
        res = evaluate_js(port, path, js_code)
        if res and b'"result"' in res:
            return True
    except Exception:
        pass
    return False

def main():
    print("🚀 Starting Antigravity 2.0 Auto-Clicker injection daemon...")
    
    last_port = None
    consecutive_failures = 0
    
    while True:
        # Read the current port from DevToolsActivePort
        port = None
        try:
            # Home directory is resolved dynamically to ensure portability
            home = os.path.expanduser('~')
            port_file = os.path.join(home, 'Library/Application Support/Antigravity/DevToolsActivePort')
            with open(port_file, 'r') as f:
                port = int(f.readline().strip())
        except Exception:
            pass
            
        if not port:
            # If the port file is missing or unreadable, the app might be closed or starting
            consecutive_failures += 1
            if consecutive_failures > 10:
                print("❌ DevToolsActivePort missing for a while. App probably closed. Exiting daemon.")
                break
            time.sleep(2)
            continue
            
        # Detect and print port transitions
        if port != last_port:
            print(f"📡 Detected DevTools active port: {port}")
            last_port = port
            consecutive_failures = 0
            
        # Query target pages via CDP
        try:
            response = urllib.request.urlopen(f"http://localhost:{port}/json", timeout=2.0)
            targets = json.loads(response.read().decode('utf-8'))
            consecutive_failures = 0
            
            target_ws_url = None
            target_title = ""
            target_url = ""
            
            # Priority 1: Match '/c/' or 'Greeting' or 'Project' or 'antigravity'
            for target in targets:
                title = target.get('title', '')
                type_ = target.get('type', '')
                url = target.get('url', '')
                
                if url.startswith('data:') or url.startswith('about:blank') or 'Loading' in title:
                    continue
                    
                if type_ == 'page' and ('Greeting' in title or 'Project' in title or 'antigravity' in url or '/c/' in url):
                    target_ws_url = target.get('webSocketDebuggerUrl')
                    target_title = title
                    target_url = url
                    break
                    
            # Priority 2: Fallback to any valid page
            if not target_ws_url:
                for target in targets:
                    title = target.get('title', '')
                    type_ = target.get('type', '')
                    url = target.get('url', '')
                    
                    if url.startswith('data:') or url.startswith('about:blank') or 'Loading' in title:
                        continue
                        
                    if type_ == 'page':
                        target_ws_url = target.get('webSocketDebuggerUrl')
                        target_title = title
                        target_url = url
                        break
                        
            if target_ws_url:
                # Extract path
                path = target_ws_url.split(f"localhost:{port}")[1]
                
                # Check if clicker is loaded
                if not is_clicker_loaded(port, path):
                    print(f"⚡ Clicker not active on '{target_title}' ({target_url}). Injecting clicker.js...")
                    
                    # Read fresh clicker.js code dynamically relative to injector.py's directory
                    try:
                        script_dir = os.path.dirname(os.path.abspath(__file__))
                        clicker_path = os.path.join(script_dir, 'clicker.js')
                        with open(clicker_path, 'r') as f:
                            js_code = f.read()
                            
                        success = inject_clicker(port, path, js_code)
                        if success:
                            print(f"✨ Injection completed successfully!")
                        else:
                            print("⚠️ Injection failed.")
                    except Exception as e:
                        print(f"❌ Error reading/injecting clicker.js: {e}")
            
        except Exception as e:
            consecutive_failures += 1
            if consecutive_failures > 10:
                print(f"❌ Connection to DevTools failed consistently: {e}. Exiting daemon.")
                break
                
        time.sleep(3)

if __name__ == "__main__":
    main()
