from flask import *
import mysql.connector
import json
import os
import RPi.GPIO as GPIO
import time

# set up the app, fix image file paths
app = Flask(__name__, static_url_path='/static')

# load credentials
credentials = json.load(open("credentials.json", "r"))

# define the image upload folder
UPLOAD_FOLDER = 'static/images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# set up the SINGLE led to cover the physical component requirement
G_PIN = 14

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(G_PIN, GPIO.OUT)

# create the app routes for the webpages
@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/calender', methods=['GET'])
def calender():
    return render_template('calender.html')

@app.route('/input', methods=['GET'])
def input():
    return render_template('input.html')

# create the app routes for storing data
@app.route('/calender_event', methods=['GET'])
def calender_event():
    # request event data
    eventString = request.values['event_string']
    eventLongString = request.values['event_long_string']
    dateString = request.values['date_string']

    # store the event data
    return json.dumps(store_event_data(eventString, eventLongString, dateString))

@app.route('/media_event_string', methods=['GET'])
def media_event_string():
    # request media data
    mediaString = request.values['media_string']

    # store the media data
    return json.dumps(store_media_string(mediaString))

@app.route('/media_event_image', methods=['POST'])
def media_event_image():
    # request the media data
    mediaImage = request.files['media_image']

    # get the "filename" for the SQL server
    filename = os.path.join(app.config['UPLOAD_FOLDER'], mediaImage.filename)

    # save the image
    mediaImage.save(filename)

    # store the file path ("filename") in the SQL database
    store_media_image(filename)

    # it was mad at me for not returning anything
    return ''

# create the app routes for returning data
@app.route('/return_media', methods=['POST'])
def return_media():
    # open database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # get the 3 most recent media from the database
    cursor = database.cursor()
    query = "SELECT media_string FROM media_data ORDER BY id DESC LIMIT 3;"
    cursor.execute(query)
    outputData = cursor.fetchall()

    # parse and format the media data
    outputString = ""
    for i in range(len(outputData)):
        outputString += str(outputData[i][0])[1:-1] + "||"
    outputString = outputString[:-2]

    # close the database
    cursor.close()
    database.close()

    # return the media data
    response_data = {'media': outputString}
    return jsonify(response_data)

@app.route('/return_event_name', methods=['POST'])
def return_event_name():
    # get the event date
    data = request.get_json()
    dateString = data.get('date')

    # parse and format the date string
    dateArray = dateString.split("/")

    for i in range(len(dateArray)):
        if (len(dateArray[i]) == 1):
            dateArray[i] = "0" + dateArray[i]

    queryString = dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1]

    # open the database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # get the events name at the specified date
    cursor = database.cursor()
    query = "SELECT event_name FROM calender_data WHERE date = \"" + queryString + "\";"
    cursor.execute(query)
    outputData = cursor.fetchall()

    # format the event names
    outputString = ""
    for i in range(len(outputData)):
        outputString += " - " + str(outputData[i][0])[12:-2] + "\n"

    # close the database
    cursor.close()
    database.close()

    # return the event data
    response_data = {'events': outputString}
    return jsonify(response_data)

@app.route('/return_event_long', methods=['POST'])
def return_event_long():
    # get the event date
    data = request.get_json()
    dateString = data.get('date')

    # parse and format the date string
    dateArray = dateString.split("/")

    for i in range(len(dateArray)):
        if (len(dateArray[i]) == 1):
            dateArray[i] = "0" + dateArray[i]

    queryString = dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1]

    # open the database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # get the events long descriptions at the specified date
    cursor = database.cursor()
    query = "SELECT event_long FROM calender_data WHERE date = \"" + queryString + "\";"
    cursor.execute(query)
    outputData = cursor.fetchall()

    # format the event long descriptions
    outputString = ""
    for i in range(len(outputData)):
        outputString += " - " + str(outputData[i][0])[12:-2] + "\n"

    # close the database
    cursor.close()
    database.close()

    # return the event data
    response_data = {'events': outputString}
    return jsonify(response_data)

# these functions all store data in the SQL database
def store_event_data(eventString, eventLongString, dateString):
    # open the database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # insert the event data into the database
    cursor = database.cursor()
    insert_sql = "INSERT INTO `calender_data` (`event_name`, `event_long`, `date`) VALUES (%s, %s, %s);"
    data = (eventString, eventLongString, str(dateString))
    cursor.execute(insert_sql, data)
    database.commit()

    # close the database
    cursor.close()
    database.close()

    # led signal
    led_signal()

def store_media_string(mediaString):
    # open the database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # insert the media text into the databse
    cursor = database.cursor()
    insert_sql = "INSERT INTO `media_data` (`media_string`) VALUES (\" " + mediaString + " \");"
    cursor.execute(insert_sql)
    database.commit()

    # close the database
    cursor.close()
    database.close()

    # led signal
    led_signal()

def store_media_image(filepath):
    # open the database
    database = mysql.connector.connect(
        host=credentials["host"],
        user=credentials["user"],
        passwd=credentials["password"],
        database=credentials["database"]
    )

    # insert the filepath into the database
    cursor = database.cursor()
    insert_sql = "INSERT INTO `media_data` (`media_string`) VALUES (\" " + str(filepath) + " \");"
    cursor.execute(insert_sql)
    database.commit()

    # close the database
    cursor.close()
    database.close()

    # led signal
    led_signal()

def led_signal():
    GPIO.output(G_PIN, GPIO.HIGH)
    time.sleep(3)
    GPIO.output(G_PIN, GPIO.LOW)
