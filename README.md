# Calender and Media Station

* The credentials.json file is reliant on inputting information relating to your own rapsberry pi and its user. Open and edit this file to start
* The database is dependant on having a database named raspberrypi, with the following tables:
    * calender_data
        * Fields: id column (auto increment and primary key), event_name, event_long, date
            * the event_name store the events name
            * the event_long stores the events description
            * the dtae stores the date, note that the date is formatted from the input from the input form
    * media_data
        * Fields: id column (auto increment and primary key), media_string
            * the media_string stores either a long description that is posted to the media section or a filepath for an image to be posted
