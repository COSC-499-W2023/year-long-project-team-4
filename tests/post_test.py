import requests

# Fill out these 2
login_post_object = {'username': 'lkarnwal', 'password': '1234', 'email': 'lakshaykarnwal@gmail.com'}
video_filename = ''


session = requests.Session()

login_url = 'http://127.0.0.1:8080/auth/login'
logout_url = 'http://127.0.0.1:8080/auth/logout'
signup_url = 'http://127.0.0.1:8080/auth/signup'
currentuser_url = 'http://127.0.0.1:8080/auth/currentuser'
pkey_url = 'http://127.0.0.1:8080/auth/pkey'
retrieve_url = 'http://127.0.0.1:8080/bucket/retrieve'
video_names_url = 'http://127.0.0.1:8080/bucket/getvideos'


post_object = {'video_name': f'/videos/{login_post_object["email"]}/{"cd9bc087-b51f-484b-bfc8-5f25f4ed0ef1"}'}
print(post_object)


# Login or signup
session.post(login_url, data=login_post_object)

result = session.post(retrieve_url, data=post_object)
open('video.mp4', 'wb').write(result.content)
with open('video.mp4', 'wb') as f:
	f.write(str.encode(result.text))
