from flask import Flask
from flask import request
app = Flask(__name__)

@app.route('/create/<form_name>', method='POST')
def create_document():
    content = request.get_json(silent=True)
    

if __name__ == '__main__':
    app.run()
