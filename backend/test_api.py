import urllib.request
import json
import urllib.error

base_url = "http://127.0.0.1:8000"

def test_register():
    print("Testing Register...")
    url = f"{base_url}/api/users/register"
    # use a random email
    import random
    email = f"testuser{random.randint(1000,9999)}@example.com"
    data = {
        "email": email,
        "password": "Password123!",
        "full_name": "Test User"
    }
    req = urllib.request.Request(url, method="POST", data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print("Register Response:", res)
            return email, "Password123!"
    except urllib.error.HTTPError as e:
        print("Register Error:", e.code, e.read().decode())
        return None, None

def test_login(email, password):
    print("\nTesting Login...")
    url = f"{base_url}/api/users/login"
    # Login might be application/x-www-form-urlencoded depending on FastAPI setup (OAuth2PasswordRequestForm)
    # Let's try both or check the backend code. Let's send x-www-form-urlencoded first.
    import urllib.parse
    data = urllib.parse.urlencode({"username": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(url, method="POST", data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print("Login Response:", res)
            return res.get("access_token")
    except urllib.error.HTTPError as e:
        print("Login Error:", e.code, e.read().decode())
        return None

def test_sell_book(token):
    print("\nTesting Sell Book (Upload)...")
    url = f"{base_url}/api/books/"
    # For a simple test, maybe the endpoint accepts JSON or multipart/form-data.
    # We should look at the route to be sure, but let's try JSON first if possible.
    data = {
        "title": "Test Book",
        "author": "Author Name",
        "isbn": "1234567890123",
        "price": 25.50,
        "condition": "Good",
        "description": "Test book description"
    }
    req = urllib.request.Request(url, method="POST", data=json.dumps(data).encode("utf-8"), headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print("Sell Book Response:", res)
    except urllib.error.HTTPError as e:
        print("Sell Book Error:", e.code, e.read().decode())

if __name__ == "__main__":
    email, password = test_register()
    if email:
        token = test_login(email, password)
        if token:
            test_sell_book(token)
