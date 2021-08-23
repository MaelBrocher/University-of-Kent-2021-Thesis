from flask import Flask
#setup needed for flask to run
app = Flask(__name__)

from app import views
