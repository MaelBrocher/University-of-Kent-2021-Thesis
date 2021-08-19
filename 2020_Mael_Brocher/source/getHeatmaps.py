import requests

r =requests.get('http://localhost:5000/heatmap')
print(r.text, end='')
