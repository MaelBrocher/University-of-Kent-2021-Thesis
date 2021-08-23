from app import app
#setup needed for flask to run
#it's threaded so it can handle many calls at once

if __name__ == "__main__":
    app.run(threaded=True)